"""Asset pipeline for the portfolio.

Turns the raw files in design/assets/ (kept out of git) into the optimised,
sanitised files the site ships from public/.

    python scripts/assets/build_assets.py all            # everything
    python scripts/assets/build_assets.py profile        # avatar only
    python scripts/assets/build_assets.py certificates   # previews + PDFs
    python scripts/assets/build_assets.py projects       # project screens
    python scripts/assets/build_assets.py check          # verify outputs

Profile photo: EXIF auto-orientation FIRST, then local background removal,
then a 4:5 head and torso crop, then 560 px wide WebP with alpha and no EXIF.

Certificates: page 1 of each PDF rendered at high resolution into a lightbox
WebP and a carousel WebP, and a sanitised single page PDF (rebuilt as a new
document, metadata and XMP removed) so nothing private rides along.

Project screens: real captures and exported design frames, never drawn
mockups. Each source becomes screen-N.webp (the whole frame, for the zoom
view) and screen-N-card.webp (cropped from the top to the carousel ratio),
with no metadata.
"""

from __future__ import annotations

import argparse
import inspect
import io
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageCms, ImageOps

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
MANIFEST = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
DENYLIST_FILE = HERE / "denylist.local.txt"
EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

Image.MAX_IMAGE_PIXELS = None  # our own DSLR sources, not untrusted input


def log(message: str) -> None:
    print(message, flush=True)


def fail(message: str) -> None:
    print(f"FAIL  {message}", file=sys.stderr, flush=True)
    raise SystemExit(1)


# ---------------------------------------------------------------- profile ---


def load_oriented_srgb(path: Path) -> Image.Image:
    """Open a photo, apply EXIF orientation first, and return plain sRGB."""
    image = Image.open(path)
    image = ImageOps.exif_transpose(image)  # must happen before any resize
    icc = image.info.get("icc_profile")
    if icc:
        try:
            source = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            target = ImageCms.createProfile("sRGB")
            image = ImageCms.profileToProfile(image, source, target, outputMode="RGB")
        except Exception:  # an unreadable profile is not worth failing over
            image = image.convert("RGB")
    else:
        image = image.convert("RGB")
    image.info.pop("icc_profile", None)
    image.info.pop("exif", None)
    return image


def remove_background(image: Image.Image, session) -> Image.Image:
    from rembg import remove

    options = {"session": session}
    if "decontaminate" in inspect.signature(remove).parameters:
        options["decontaminate"] = True  # pull background colour out of edges
    return remove(image, **options).convert("RGBA")


def largest_component(mask: np.ndarray) -> np.ndarray:
    from scipy import ndimage

    labels, count = ndimage.label(mask)
    if count <= 1:
        return mask
    sizes = ndimage.sum(mask, labels, index=range(1, count + 1))
    return labels == (int(np.argmax(sizes)) + 1)


def locate_head(alpha: np.ndarray) -> tuple[int, float, float]:
    """Return (head_top_row, head_centre_x, head_width) in mask pixels."""
    subject = largest_component(alpha > 128)
    rows = np.where(subject.sum(axis=1) > max(3, subject.shape[1] * 0.01))[0]
    if rows.size == 0:
        fail("background removal found no subject in the profile photo")
    top, bottom = int(rows[0]), int(rows[-1])
    band_height = max(8, int((bottom - top) * 0.14))  # crown down to ear level
    band = subject[top : top + band_height]
    columns = np.where(band.any(axis=0))[0]
    left, right = int(columns[0]), int(columns[-1])
    return top, (left + right) / 2.0, float(right - left)


def build_profile(model_override: str | None, qa_dir: Path | None) -> None:
    from rembg import new_session

    spec = MANIFEST["profile"]
    source = ROOT / spec["source"]
    output = ROOT / spec["output"]
    if not source.exists():
        fail(f"profile source missing: {source}")

    model = model_override or spec["model"]
    log(f"profile  loading {source.name} and applying EXIF orientation")
    photo = load_oriented_srgb(source)
    log(f"profile  oriented size {photo.width}x{photo.height}")

    log(f"profile  background removal model: {model} (runs locally)")
    session = new_session(model)

    # Pass 1: find the subject on a reduced copy.
    scout = photo.copy()
    scout.thumbnail((1536, 1536), Image.Resampling.LANCZOS)
    scale = photo.width / scout.width
    scout_alpha = np.asarray(remove_background(scout, session).getchannel("A"))
    head_top, head_cx, head_w = (value * scale for value in locate_head(scout_alpha))

    framing = spec["framing"]
    aspect_w, aspect_h = spec["aspect"]
    crop_w = head_w * framing["widthInHeadWidths"]
    crop_h = crop_w * aspect_h / aspect_w
    centre_x = head_cx + head_w * framing["shiftXInHeadWidths"]
    left = centre_x - crop_w / 2
    top = head_top - crop_h * framing["headroom"]
    left = min(max(0.0, left), photo.width - crop_w)
    top = min(max(0.0, top), photo.height - crop_h)
    box = (round(left), round(top), round(left + crop_w), round(top + crop_h))
    log(f"profile  4:5 crop box {box} from head at x={head_cx:.0f}, top={head_top:.0f}")

    # Pass 2: segment a tight region so the model spends its resolution on the subject.
    margin = round(crop_w * 0.06)
    region = (
        max(0, box[0] - margin),
        max(0, box[1] - margin),
        min(photo.width, box[2] + margin),
        min(photo.height, box[3] + margin),
    )
    cutout = remove_background(photo.crop(region), session)
    cutout = cutout.crop(
        (box[0] - region[0], box[1] - region[1], box[2] - region[0], box[3] - region[1])
    )

    width = spec["width"]
    height = round(width * aspect_h / aspect_w)
    # Resize in premultiplied alpha so edge pixels do not pick up a fringe.
    avatar = cutout.convert("RGBa").resize((width, height), Image.Resampling.LANCZOS)
    avatar = avatar.convert("RGBA")

    output.parent.mkdir(parents=True, exist_ok=True)
    avatar.save(output, "WEBP", quality=spec["quality"], method=6, alpha_quality=95)
    log(f"profile  wrote {output.relative_to(ROOT)} {width}x{height} {output.stat().st_size} bytes")

    if qa_dir:
        qa_dir.mkdir(parents=True, exist_ok=True)
        saved = Image.open(output).convert("RGBA")
        sheet = Image.new("RGB", (width * 2 + 60, height + 40), (255, 255, 255))
        for index, backdrop in enumerate(((243, 241, 236), (15, 41, 34))):
            tile = Image.new("RGBA", (width, height), backdrop + (255,))
            tile.alpha_composite(saved)
            sheet.paste(tile.convert("RGB"), (20 + index * (width + 20), 20))
        sheet.save(qa_dir / "profile-qa.png")
        log(f"profile  QA sheet at {qa_dir / 'profile-qa.png'}")


# ----------------------------------------------------------- certificates ---


def denylist() -> list[str]:
    if not DENYLIST_FILE.exists():
        return []
    lines = DENYLIST_FILE.read_text(encoding="utf-8").splitlines()
    return [line.strip() for line in lines if line.strip() and not line.startswith("#")]


def render_page(page, pixel_width: int) -> Image.Image:
    import pymupdf

    zoom = pixel_width / page.rect.width
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
    return Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)


def write_webp(image: Image.Image, width: int, path: Path, quality: int) -> None:
    height = round(image.height * width / image.width)
    resized = image.resize((width, height), Image.Resampling.LANCZOS)
    resized.save(path, "WEBP", quality=quality, method=6)
    log(f"cert     wrote {path.relative_to(ROOT)} {width}x{height} {path.stat().st_size} bytes")


def sanitise_pdf(source_doc, pages: list[int], path: Path) -> None:
    import pymupdf

    # Rebuild as a new document holding only the pages we publish. Dropped
    # pages are gone for good once the garbage collected copy is written.
    draft = pymupdf.open()
    for page_index in pages:
        draft.insert_pdf(source_doc, from_page=page_index, to_page=page_index, links=False, annots=False)
    compact = draft.tobytes(garbage=4, deflate=True, clean=True)
    draft.close()

    clean = pymupdf.open("pdf", compact)
    try:
        clean.scrub()  # attachments, hidden text, thumbnails, javascript
    except RuntimeError as error:
        # Some generators leave cross references scrub() cannot walk. The
        # metadata and page removal below still apply, and check_outputs()
        # verifies the result either way.
        log(f"cert     note: scrub skipped for {path.name} ({error})")
        clean.close()
        clean = pymupdf.open("pdf", compact)
    clean.set_metadata({})
    clean.del_xml_metadata()
    clean.save(path, garbage=4, deflate=True, clean=True)
    clean.close()
    log(f"cert     wrote {path.relative_to(ROOT)} {path.stat().st_size} bytes")


def build_certificates() -> None:
    import pymupdf

    render = MANIFEST["render"]
    previews = ROOT / MANIFEST["outputs"]["previews"]
    documents = ROOT / MANIFEST["outputs"]["documents"]
    previews.mkdir(parents=True, exist_ok=True)
    documents.mkdir(parents=True, exist_ok=True)

    for item in MANIFEST["certificates"]:
        source = ROOT / item["source"]
        if not source.exists():
            fail(f"certificate source missing: {source}")
        slug = item["slug"]
        if slug != slug.lower():
            fail(f"slug must be lowercase (GitHub Pages is case sensitive): {slug}")
        document = pymupdf.open(source)
        log(f"cert     {source.name}: {document.page_count} page(s), keeping {item['pages']}")
        master = render_page(document[item["pages"][0]], render["supersampleWidth"])
        write_webp(master, render["fullWidth"], previews / f"{slug}.webp", render["quality"])
        write_webp(master, render["thumbWidth"], previews / f"{slug}-thumb.webp", render["quality"])
        sanitise_pdf(document, item["pages"], documents / f"{slug}.pdf")
        document.close()


# --------------------------------------------------------------- projects ---


def card_size(group: dict, source_width: int) -> tuple[int, int]:
    """Pixel size of a carousel card: the set's ratio, never wider than the source."""
    card = MANIFEST["projects"]["card"]
    aspect_w, aspect_h = group.get("aspect", card["aspect"])
    width = min(source_width, card["width"])
    return width, round(width * aspect_h / aspect_w)


def apply_masks(image: Image.Image, masks: list[dict], name: str) -> Image.Image:
    """Cover boxes of a screen (a logo, say) with a flat colour sampled from the screen itself.

    Coordinates are source pixels. The sample point must sit on a flat area, so
    its 5x5 neighbourhood is checked first: a fill taken from an edge or a
    gradient would leave a visible patch.
    """
    from PIL import ImageDraw

    pixels = np.asarray(image)
    draw = ImageDraw.Draw(image)
    for mask in masks:
        sample_x, sample_y = mask["fillFrom"]
        patch = pixels[sample_y - 2 : sample_y + 3, sample_x - 2 : sample_x + 3].reshape(-1, 3).astype(int)
        if np.ptp(patch, axis=0).max() > 2:
            fail(f"{name}: mask sample at {mask['fillFrom']} is not a flat colour")
        colour = tuple(int(channel) for channel in patch[0])
        x0, y0, x1, y1 = mask["box"]
        draw.rectangle((x0, y0, x1 - 1, y1 - 1), fill=colour)
        log(f"project  {name}: masked {mask['box']} with rgb{colour}")
    return image


def build_projects() -> None:
    spec = MANIFEST["projects"]
    for group in spec["sets"]:
        out_dir = ROOT / spec["output"] / group["id"]
        out_dir.mkdir(parents=True, exist_ok=True)
        # Start clean, so a source dropped from the manifest leaves no orphan behind.
        for stale in out_dir.glob("screen-*.webp"):
            stale.unlink()

        for number, relative in enumerate(group["sources"], start=1):
            source = ROOT / relative
            if not source.exists():
                fail(f"project screen missing: {source}")
            # A fresh RGB copy carries no EXIF, ICC profile or text chunks.
            image = Image.open(source).convert("RGB")
            if group.get("masks"):
                image = apply_masks(image, group["masks"], source.name)

            full_width = min(image.width, spec["full"]["maxWidth"])
            full_height = round(image.height * full_width / image.width)
            full = image if full_width == image.width else image.resize(
                (full_width, full_height), Image.Resampling.LANCZOS
            )
            full_path = out_dir / f"screen-{number}.webp"
            full.save(full_path, "WEBP", quality=spec["full"]["quality"], method=6)

            width, height = card_size(group, image.width)
            scaled_height = round(image.height * width / image.width)
            if scaled_height < height:
                fail(f"{source.name} is too short for a {width}x{height} card; set an aspect for {group['id']}")
            card = image.resize((width, scaled_height), Image.Resampling.LANCZOS).crop((0, 0, width, height))
            card_path = out_dir / f"screen-{number}-card.webp"
            card.save(card_path, "WEBP", quality=spec["card"]["quality"], method=6)

            log(
                f"project  {group['id']} {source.name}: "
                f"{full_path.name} {full_width}x{full_height} {full_path.stat().st_size} bytes, "
                f"{card_path.name} {width}x{height} {card_path.stat().st_size} bytes"
            )


# ------------------------------------------------------------------ check ---


def check_outputs() -> None:
    import pymupdf

    problems: list[str] = []
    banned = denylist()

    def must_exist(path: Path) -> bool:
        if not path.exists() or path.stat().st_size == 0:
            problems.append(f"missing or empty: {path.relative_to(ROOT)}")
            return False
        return True

    profile = MANIFEST["profile"]
    avatar_path = ROOT / profile["output"]
    if must_exist(avatar_path):
        avatar = Image.open(avatar_path)
        expected = (profile["width"], round(profile["width"] * profile["aspect"][1] / profile["aspect"][0]))
        if avatar.size != expected:
            problems.append(f"avatar is {avatar.size}, expected {expected}")
        if avatar.mode != "RGBA":
            problems.append("avatar has no alpha channel")
        elif np.asarray(avatar.getchannel("A")).min() > 0:
            problems.append("avatar alpha is fully opaque: background was not removed")
        if avatar.getexif():
            problems.append("avatar still carries EXIF")

    render = MANIFEST["render"]
    previews = ROOT / MANIFEST["outputs"]["previews"]
    documents = ROOT / MANIFEST["outputs"]["documents"]
    for item in MANIFEST["certificates"]:
        slug = item["slug"]
        for suffix, width in (("", render["fullWidth"]), ("-thumb", render["thumbWidth"])):
            path = previews / f"{slug}{suffix}.webp"
            if must_exist(path) and Image.open(path).width != width:
                problems.append(f"{path.name} is not {width}px wide")
        pdf_path = documents / f"{slug}.pdf"
        if not must_exist(pdf_path):
            continue
        document = pymupdf.open(pdf_path)
        if document.page_count != len(item["pages"]):
            problems.append(f"{pdf_path.name} has {document.page_count} pages, expected {len(item['pages'])}")
        leftover = {key: value for key, value in (document.metadata or {}).items()
                    if value and key not in ("format", "encryption")}
        if leftover:
            problems.append(f"{pdf_path.name} still has metadata: {leftover}")
        if document.xref_xml_metadata() != 0:
            problems.append(f"{pdf_path.name} still has XMP metadata")
        text = "\n".join(page.get_text() for page in document)
        raw = pdf_path.read_bytes()
        if EMAIL_PATTERN.search(text):
            problems.append(f"{pdf_path.name} text contains an email address")
        for entry in banned:
            if entry.lower() in text.lower() or entry.encode("utf-8") in raw:
                problems.append(f"{pdf_path.name} contains a denylisted string")
        document.close()

    projects = MANIFEST["projects"]
    screens = 0
    for group in projects["sets"]:
        out_dir = ROOT / projects["output"] / group["id"]
        for number in range(1, len(group["sources"]) + 1):
            screens += 1
            full_path = out_dir / f"screen-{number}.webp"
            card_path = out_dir / f"screen-{number}-card.webp"
            if not (must_exist(full_path) and must_exist(card_path)):
                continue
            full = Image.open(full_path)
            card = Image.open(card_path)
            if full.width > projects["full"]["maxWidth"]:
                problems.append(f"{group['id']}/{full_path.name} is wider than {projects['full']['maxWidth']}px")
            if card.size != card_size(group, full.width):
                problems.append(f"{group['id']}/{card_path.name} is {card.size}, expected {card_size(group, full.width)}")
            for image, path in ((full, full_path), (card, card_path)):
                if image.getexif():
                    problems.append(f"{group['id']}/{path.name} still carries EXIF")

    if problems:
        for problem in problems:
            print(f"FAIL  {problem}", file=sys.stderr)
        raise SystemExit(1)
    total = 1 + 3 * len(MANIFEST["certificates"]) + 2 * screens
    log(f"check    ok: {total} outputs present, sized, sanitised"
        f" ({len(banned)} denylist entries applied)")


# -------------------------------------------------------------------- cli ---


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("target", choices=("all", "profile", "certificates", "projects", "check"))
    parser.add_argument("--model", help="override the background removal model")
    parser.add_argument("--qa", type=Path, help="directory for a profile QA sheet")
    arguments = parser.parse_args()

    if arguments.target in ("all", "profile"):
        build_profile(arguments.model, arguments.qa)
    if arguments.target in ("all", "certificates"):
        build_certificates()
    if arguments.target in ("all", "projects"):
        build_projects()
    check_outputs()


if __name__ == "__main__":
    main()
