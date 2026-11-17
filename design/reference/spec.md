# Design & Motion Specification (`design/reference/spec.md`)

This document defines the visual tokens, layout proportions, and Framer Motion physics for Kittiphat Duangmanee’s engineering portfolio: warm editorial paper for the page, real product screens for the work, and a light engineering canvas for the architecture diagrams.

---

## 1. Color System

### Core Surface & Ink Tokens
- **Canvas Background:** `#FAF9F6` (Warm Archival Paper)
- **Elevated Card Surface:** `#FFFFFF` (Crisp Print White)
- **Subtle Panel / Code Well:** `#F3F1EC`
- **Hairline Border:** `#E4E2DD`
- **Strong Hairline (hover border on badges):** `#C5C0B8`
- **Dot Matrix (hero background grid):** `#DCD8D0`
- **Primary Ink (Headings / Body):** `#141517`
- **Secondary Ink (Captions / Metadata / Small labels):** `#525866`
- **Muted Ink (Line numbers / Axis labels):** `#8A909E`. It reaches only about 3:1 on the canvas, so it is never used for text labels. Small labels use Secondary Ink.

Components never write these values as raw hex. They bind to the tokens in `src/styles/tokens.css` (`bg-canvas`, `text-ink-2`, `border-hairline`, `shadow-window`), and `npm run gate:tokens` fails on a colour literal anywhere else in `src/`.

### Technology Mark Tokens (Icons Only)
Core stack:
- Python `#3776AB` · FastAPI `#009688` · Java `#E76F00` (steam) and `#5382A1` (cup) · Spring `#6DB33F` · RabbitMQ `#FF6600`
- TypeScript `#3178C6` · React `#087EA4` · Angular `#DD0031` · Tailwind CSS `#06B6D4`
- PostgreSQL `#336791` · TimescaleDB `#FDB515` · MySQL `#4479A1` · Redis `#FF4438`
- Docker `#2496ED` · AWS `#232F3E` (wordmark) and `#FF9900` (smile) · Git `#F03C2E`

Tools used in a single project (never in the core stack):
- Hono `#E36002` · CockroachDB `#6933FF` · Cloudflare Workers `#F38020` · LINE Messaging API `#06C755`
- Drizzle ORM and SMTP are set in ink (`#141517` and `#525866`): Drizzle's own lime cannot be seen on white, and SMTP has no mark of its own.

### Architecture Diagram Tokens
A cool slate canvas, so the diagram reads as an engineering drawing set into the warm page:
- Canvas `#F8FAFC` · Grid lines `#E2E8F0` (major every 80px, minor every 16px at half strength) · Border `#CBD5E1`
- Idle connector `#94A3B8` · Selected node and live connector `#2563EB` (white text on it clears 4.5:1)
- Glyph hues for components without a brand mark: solar `#F59E0B` with panel cells `#0369A1`, scheduler `#6366F1`, anomaly engine `#7C3AED`, alerting `#E11D48`, browser `#475569`, sales chart `#059669`
- Node shadow `0 1px 2px rgba(15,23,42,0.06), 0 3px 8px -3px rgba(15,23,42,0.1)`; selected node `0 1px 2px rgba(15,23,42,0.06), 0 10px 20px -10px rgba(37,99,235,0.55)`

### Elevation
- **Window** (screen carousel frame): `0 12px 36px -12px rgba(20, 21, 23, 0.12)`
- **Modal** (detail modal, lightboxes): `0 24px 48px -12px rgba(20, 21, 23, 0.22), 0 4px 12px -2px rgba(20, 21, 23, 0.08)`
- **Scrim:** `rgba(20, 21, 23, 0.46)` with a 6px backdrop blur behind project dialogs; the certificate lightbox keeps `rgba(20, 21, 23, 0.78)`.

---

## 2. Typography & Scale

Load via Google Fonts (with system fallbacks):
- **Display / Headings:** `'Newsreader', Georgia, serif` (Weights: `500`, `600`)
- **UI & Technical Body:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` (Weights: `400`, `500`, `600`, `700`)
- **Monospace / Telemetry / Stack Tags:** `'JetBrains Mono', monospace` (Weights: `400`, `500`)

### Type Scale
- **Hero Headline (`h1`):** `clamp(2.25rem, 4.5vw, 3.75rem)` | Line-height `1.08` | Tracking `-0.03em`
- **Section Heading (`h2`):** `clamp(1.75rem, 3vw, 2.5rem)` | Line-height `1.15` | Tracking `-0.02em`
- **Project Title (`h3`):** `clamp(1.35rem, 2.2vw, 1.85rem)` | Line-height `1.2`
- **Body Copy:** `1rem` (`16px`) | Line-height `1.65` | Max measure `65ch`
- **Technical Metadata:** `0.75rem` (`12px`) | `JetBrains Mono` | Uppercase | Tracking `0.08em`
- **Diagram node:** title `12px` Plus Jakarta Sans bold; tech line and connector labels `9.5px` to `10px` JetBrains Mono

---

## 3. Page Architecture & Responsive Grid

- **Container:** `max-w-7xl` (`1280px`), centered, horizontal padding `px-5 sm:px-8 lg:px-12`.
- **Section Vertical Rhythm:** `py-20 lg:py-28` with `1px solid #E4E2DD` editorial dividers between major sections.

### Section Breakdown
1. **Top Navigation Bar:** Minimal sticky header (`h-16`, `backdrop-blur-md bg-[#FAF9F6]/85`) with monogram mark, anchor links (`Projects`, `Certifications`, `Contact`), and the GitHub link.
2. **Hero Section:** Asymmetric 12-column grid (`lg:grid-cols-12`, `gap-10 items-start`) over the Interactive Embossed Background (section 7).
   - Left (`lg:col-span-7`), in this order:
     - `h1`: `Kittiphat Duangmanee` in Newsreader at the Hero Headline scale.
     - Role line directly beneath: `Full-Stack Developer` in Plus Jakarta Sans (`text-2xl sm:text-3xl font-semibold tracking-tight`, Secondary Ink). Never italic serif.
     - Bio: two sentences, about 28 words at most (`max-w-xl text-base sm:text-[17px] leading-relaxed`, Secondary Ink).
     - Primary CTA (`View projects`) with press feedback (`active:scale-[0.97]`).
     - Three metadata columns, each a small icon and mono label over two lines: `EDUCATION` (`B.Eng. in Computer Engineering` / `Kasetsart University, 2026`), `EXPERIENCE` (`Application Design Intern` / `SCG Cleanergy (Nov 2025 to Mar 2026)`), `LOCATION` (`Bangkok, Thailand` / `Thailand (UTC+7)`).
     - Core Stack (section 8).
   - Right (`lg:col-span-5`): portrait card (`max-w-[360px] rounded-2xl bg-white p-2.5 border border-[#E4E2DD] shadow-[0_12px_32px_-12px_rgba(20,21,23,0.12)]`). Inside it, `public/images/profile-avatar.webp` on a `#F3F1EC` panel (`aspect-[4/5]`, inner radius 6px so the corners stay concentric), then a caption: `Kittiphat Duangmanee (Mark)` (`font-semibold`, Primary Ink) over `B.Eng. in Computer Engineering, Kasetsart University` (`text-xs`, Secondary Ink). On `lg:` and wider the card is `sticky top-24`, so it starts level with the name and stays beside the column.
   - **Not in the hero:** no status or availability pill, no `FIG.` / `Fig.` figure labels, no registration marks or crosshairs around the portrait.
   - **Name format:** the full name is `Kittiphat Duangmanee`. With the nickname it is always `Kittiphat Duangmanee (Mark)`, never a quoted nickname between the given and family name.
   - **Copy punctuation:** no em dash or en dash in site copy (`npm run verify:data` enforces it). Use a comma, a colon, a period, or the word `to` in date ranges.
3. **Projects (section 4):** a plain `h2` `Projects` with one line under it, then the two project showcase cards (`mt-14 lg:mt-20`, `gap-20 lg:gap-28` between them). No eyebrow, no index rail, no jump pills.
4. **Certifications (3D Coverflow Carousel):** Full-width centered showcase displaying the 4 certificates (`AWS`, `depa`, `ARIT`, `Certiport`).
5. **Footer / Contact:** Clean colophon with build stack note, email copy button, and external profiles.

---

## 4. Component Spec: Project Showcase

Two finished projects, the Solar String Monitoring Alarm System and OrderDi, from `src/data/projects.ts`. Each is shown through its real screens. A screen is a capture of the live product or a frame exported from its design file, never a hand-coded mockup.

### Showcase Card (`ProjectShowcaseCard.tsx`)
- **Grid:** `lg:grid-cols-12 lg:gap-12`. Screens in `lg:col-span-7`, summary in `lg:col-span-5 lg:pt-2`. Below `lg` the two stack, screens first.
- **Summary column, top to bottom:**
  - Title `h3` (Project Title scale), optional subtitle at Lede size in Secondary Ink.
  - Role badge: one rounded-lg chip (`border-hairline bg-surface text-[13px]`), its parts joined by a middot, for example `SCG Cleanergy · Application Design Intern` or `Full-stack web application · Live in production`.
  - Summary: at most three plain sentences, Secondary Ink, `max-w-measure`.
  - Tech badges: the same `TechBadge` as the Core Stack (section 8).
  - Primary button `View project details and architecture` (`min-h-12 rounded-full bg-ink text-canvas`, `active:scale-[0.97]`), opening the detail modal.
  - Secondary: `Visit live app` (outlined pill, new tab) for OrderDi; a muted lock note for the solar system (`Internal enterprise system. Screens are shown with synthetic data.`).
- **Entrance:** `whileInView` from `{ opacity: 0, y: 16 }` to `{ opacity: 1, y: 0 }`, `viewport={{ once: true, amount: 0.2 }}`, `0.5s` on the site ease-out. One entrance per card, no stagger inside it.

### Screen Carousel (`ProjectUiCarousel.tsx`)
- **Window frame:** `rounded-xl border border-hairline bg-surface shadow-window overflow-hidden`.
  - Chrome row `h-11 bg-well border-b`: three `10px` dots in `#C5C0B8`, the current screen title centred (`13px`, Secondary Ink), and a zoom button on the right.
  - Stage at the card ratio (`16:10`, from the image's own size), image `object-cover object-top`.
  - Caption under the frame (`text-small`, Secondary Ink, `min-h-11` so a change of caption length does not shift the controls).
- **Autoplay:** one screen every `4.5s`. The timer is a single motion value advanced from `useAnimationFrame` (frame gaps capped at `100ms`) and bound to the active pill's `scaleX`, so a tick never re-renders React. It holds on mouse hover, keyboard focus inside the carousel, drag, the zoom view, the detail modal, while less than half the carousel is on screen, and while the visitor has pressed pause. Under reduced motion it never starts.
- **Change of slide:** `AnimatePresence` keyed by screen, with the direction as `custom`. The new screen enters from `x: ±28px` and the old one leaves to `∓28px` on a spring without overshoot (`stiffness: 320, damping: 36, mass: 0.9`), while both cross-fade over `220ms` on the site ease-out. Under reduced motion: cross-fade only. The next screen is preloaded.
- **Controls:** one pill per screen (`6px` tall; inactive `8px` wide, active `36px` with the progress fill inside), pause or play, previous, next (`44px` round buttons). `drag="x"` with `touch-action: pan-y`: release past `50px` or faster than `400px/s` changes the screen. `ArrowLeft` and `ArrowRight` act on the focused carousel only and are marked handled, so the certificate carousel ignores them.
- **Zoom (`ScreenshotLightbox.tsx`):** a click on the screen or the zoom button opens the full frame (up to `2880px` wide) in a dialog with its title, `n / total`, previous and next, the caption, and Escape to close.

### Detail Modal (`ProjectDetailModal.tsx`)
- Built on `primitives/ModalDialog.tsx`: the native `<dialog>` opened with `showModal()` (focus trap, inert page, focus returned to the trigger), `role="dialog"`, `aria-modal="true"`, `aria-labelledby` the title, scroll lock, and Escape or a scrim click to close. The dialog stays in the top layer until its exit animation ends.
- **Panel:** `max-w-5xl`, `rounded-2xl`, `bg-canvas`, Modal elevation, `overflow-clip` (a clipped panel cannot be scrolled by focus, so the header never slides away). Scrim `rgba(20,21,23,0.46)` with a `6px` backdrop blur, fading in over `250ms` and out over `180ms`.
- **Motion:** from `md`, a centred panel entering from `{ opacity: 0, scale: 0.97, y: 12 }` on a spring (`duration: 0.45, bounce: 0`) and leaving in `180ms`. Below `md`, a bottom sheet (`100dvh - 12px` tall, top corners rounded) entering from `y: 100%` over `450ms` and leaving over `250ms` on the drawer curve `cubic-bezier(0.32, 0.72, 0, 1)`. Reduced motion: opacity only.
- **Header (fixed):** title, `organisation · role · period`, the close button (`44px`), and from `md` the tech badges. On phones the badges sit at the top of the scrolling content instead, so the header stays short.
- **Content (scrolls):** two columns from `lg` (`5fr` and `6fr`): `Overview and problem` paragraphs, and `What I built` as a list with a check mark per item. Then `System architecture` with the diagram at full width.

### Architecture Diagram (`DrawioArchitectureDiagram.tsx`)
- **Canvas:** `rounded-xl` with a `#CBD5E1` border. A white toolbar on top holds the flow filters (`All flows` plus one pill per flow, pressed state `#2563EB` with white text) and a `Reset` button. Under it the `diagram-grid` canvas: `#F8FAFC` with `#E2E8F0` lines every `80px` and half-strength lines every `16px`.
- **Layout:** nodes sit centred in the cells of the grid given in `src/data/diagrams/*.ts`, `136px` per row. When the stage is narrower than `920px` the grid is transposed (columns become rows, and each connector's sides turn with them), so phones read it top to bottom and never scroll sideways.
- **Nodes:** real `<button>` elements, `132 x 96px` at most, `bg-surface border-2 rounded-xl` with the node shadow. A `28px` icon (the technology's brand mark from `TechIcon`, or a drawn glyph from `diagram/DiagramIcon.tsx`), the title (`12px` bold), and the technology line (`9.5px` mono, truncated). Hover lifts the border to `#94A3B8`; press scales to `0.97`.
- **Connectors:** one SVG layer under the nodes. Each edge leaves and enters the side named in its data; facing sides make a straight line or a Z, perpendicular sides an L, every corner rounded to `8px`. Idle `1.5px #94A3B8` with a small arrowhead; live `1.75px #2563EB`. Label chips (`10px` mono on white, `5px` radius) sit at the middle of the longest segment that has room and clears every node; a connector with no room shows no chip. Dots `7px` travel along live connectors (`offset-path`, `1.8s` linear, staggered); none under reduced motion.
- **Interaction:** mouse hover or keyboard focus previews a node; click, tap, Enter or Space selects it and a second press lets go. A focused node keeps its own connectors and the nodes at their other ends at full strength; everything else drops to `30%` (connectors) or `40%` (nodes). A flow filter does the same for the edges of one flow. A click on the empty canvas or `Reset` clears it.
- **Inspector:** a white panel under the canvas (`aria-live="polite"`, `min-h-44` from `sm`). With a node focused: icon and title, then `Technology`, `Input`, `Output` and `Key engineering decision` in four columns from `lg`. With none: the flow (or the diagram) title and description, and a one-line hint. A visually hidden list repeats every connection for screen readers.

---

## 5. Component Spec: Page Motion

- **Global Wrapper:** Wrap the root application in `<MotionConfig reducedMotion="user">`. Motion values driven by hand (pointer tilt, the carousel timer, flow dots) also read `useMotionPreference` and hold still.
- **One easing curve:** `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-editorial`) for CSS transitions and timed Framer transitions. Press feedback is `scale(0.97)` over `150ms` on every pill and round button.
- **Exits are shorter than entrances:** modal `0.45s` in, `0.18s` out; sheet `0.45s` in, `0.25s` out.
- **No scroll parallax, no sticky index:** the page scrolls as written. The project cards rise into view once.

---

## 6. Component Spec: 3D Certificate Coverflow Carousel

### Stage & Card Geometry
- **Stage Container:** `relative w-full h-[360px] sm:h-[430px] flex items-center justify-center overflow-x-clip` with `style={{ perspective: 1400 }}`.
- **Card Dimensions:** `w-[280px] sm:w-[380px] md:w-[440px] aspect-[1.414/1]` (standard A4 landscape certificate ratio), `rounded-xl bg-white border border-[#E4E2DD] shadow-xl overflow-hidden`.

### Position States (`offset = index - activeIndex`)
Animate each certificate card with `transition={{ type: "spring", stiffness: 280, damping: 28 }}`:
- **`offset === 0` (Center Active Card):**
  - `x: "0%"`, `scale: 1`, `rotateY: 0`, `zIndex: 30`, `opacity: 1`
  - Enables interactive 3D pointer tilt (`±6deg`) on desktop and opens the Lightbox modal on click.
- **`offset === -1` (Left Adjacent Card):**
  - `x: "-56%"`, `scale: 0.85`, `rotateY: 22`, `zIndex: 20`, `opacity: 0.72`
  - Clicking brings this card to center (`setActiveIndex(index)`).
- **`offset === 1` (Right Adjacent Card):**
  - `x: "56%"`, `scale: 0.85`, `rotateY: -22`, `zIndex: 20`, `opacity: 0.72`
  - Clicking brings this card to center (`setActiveIndex(index)`).
- **`Math.abs(offset) >= 2` (Parked Cards):**
  - `x: offset < 0 ? "-92%" : "92%"`, `scale: 0.7`, `rotateY: offset < 0 ? 32 : -32`, `zIndex: 10`, `opacity: 0`, `pointerEvents: "none"`

### Controls, Gestures & Lightbox
- **Touch / Pointer Drag:** Support horizontal swipe (`drag="x"`, `dragConstraints={{ left: 0, right: 0 }}`); release with `offset.x < -50` advances next, `offset.x > 50` goes previous.
- **Navigation Bar:** Centered controls beneath the stage with Previous button, pagination dots (`1 / 4`), active certificate title/issuer caption, and Next button.
- **Keyboard Isolation:** Bind `ArrowLeft` and `ArrowRight` listeners **only** when the carousel section is focused or intersecting the viewport (`isCarouselInView === true`) and the lightbox is closed.
- **Lightbox Modal:**
  - Triggered by clicking the active center certificate card (or "Inspect Certificate" button).
  - Renders high-resolution `.webp` image inside a centered modal (`max-w-4xl`), issuer/date metadata, and a direct **"Open / Download PDF"** link pointing to `/certificates/<filename>.pdf`.
  - Closes on `Escape` key, close button, or backdrop click.
---

## 7. Component Spec: Interactive Embossed Background

A dot matrix behind the hero that rises under the cursor, as if the paper were embossed where the pointer is (`src/components/InteractiveBackground.tsx`). It is the first child of the `relative` hero section and fills it (`pointer-events-none absolute inset-0 overflow-hidden`).

### Layers (back to front)
1. **Base grid:** `radial-gradient(#DCD8D0 1.15px, transparent 1.15px)`, `background-size: 24px 24px`, on the `#FAF9F6` canvas.
2. **Ambient highlight:** `radial-gradient(280px circle at ${x}px ${y}px, rgba(255,255,255,0.85), rgba(20,21,23,0.03) 45%, transparent 75%)`.
3. **Raised dots:** `radial-gradient(#141517 2px, transparent 2px)`, `background-size: 24px 24px`, `opacity: 0.28`, aligned with the base grid and revealed through `maskImage` / `WebkitMaskImage`: `radial-gradient(220px circle at ${x}px ${y}px, black 0%, rgba(0,0,0,0.45) 45%, transparent 80%)`.
4. **Bottom fade:** `bg-linear-to-b from-transparent via-transparent to-[#FAF9F6]`, so the grid dissolves into the Projects section.

### Motion
- Pointer position is held in `useMotionValue` and smoothed with `useSpring(value, { stiffness: 220, damping: 28, mass: 0.5 })`. The spring is overdamped, so the relief trails the cursor without wobble.
- The highlight and the mask are built with `useMotionTemplate`, so a mouse move never re-renders React.
- The first move after the pointer enters jumps to its position, so the relief never slides in from a corner. When the pointer leaves the hero, layers 2 and 3 fade out on the same spring.

### Touch and Reduced Motion
- When `(pointer: coarse)` matches or `prefers-reduced-motion` is set, layers 2 and 3 are not mounted and no pointer listener is attached. Only the static base grid and the fade remain.
- Non-mouse pointer events are ignored, so a touch on a hybrid laptop does not light the relief.

---

## 8. Component Spec: Core Stack and Tech Badges

The personal core stack (`src/components/CoreStack.tsx`), fed by `profile.stackGroups`. It lists verified, hands-on skills only. A tool used in a single project stays in that project's stack in `src/data/projects.ts` (for example Hono, Cloudflare Workers, CockroachDB and Drizzle ORM belong to OrderDi, and the LINE Messaging API and SMTP to the solar system, not to the personal stack). The project cards and the detail modal render their stacks with the same badge, so the two always look alike.

### Content
- **Backend:** Python, FastAPI, Java, Spring Boot, Spring Cloud Gateway, RabbitMQ
- **Frontend:** TypeScript, React, Angular, Tailwind CSS
- **Databases & Cache:** PostgreSQL, TimescaleDB, MySQL, Redis
- **DevOps & Cloud:** Docker, AWS, Git

### Layout
- A two by two grid of the four categories: `grid-cols-1 sm:grid-cols-2 gap-6`.
- Category header: Technical Metadata style (`JetBrains Mono`, 12px, uppercase), Secondary Ink, `mb-3`.
- Badge (`src/components/primitives/TechBadge.tsx`): `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2DD] text-[13px] font-medium text-[#141517] shadow-[0_1px_2px_rgba(20,21,23,0.04)] transition-colors hover:border-[#C5C0B8]`.
- Hover lift: `whileHover={{ y: -2 }}` with `transition={{ type: "spring", stiffness: 400, damping: 25 }}`. The lift is dropped under reduced motion; the border change stays.

### Technology Icons
- `src/components/primitives/TechIcon.tsx` renders one mark per technology in its brand colour (Technology Mark Tokens, section 1): 16x16 in a badge, 28px or 32px on a diagram node and in its inspector (`size` prop). Icons are decorative (`aria-hidden`); the name is always beside them as text.
- Path data lives in `src/components/primitives/tech-icon-paths.ts`. The outlines come from the Simple Icons project (CC0 1.0), with three exceptions: the Java cup and the SMTP envelope are drawn for this site, and the MySQL mark keeps only its dolphin because the wordmark cannot be read at 16px.
- The icon map is typed by `TechId` (`CoreTechId | ProjectTechId`), so a stack item without an icon fails the typecheck, and `profile.stackGroups` accepts core ids only.
- The hero metadata labels use `lucide-react` line icons (`GraduationCap`, `Briefcase`, `MapPin`) at 14px with a 1.75 stroke.
