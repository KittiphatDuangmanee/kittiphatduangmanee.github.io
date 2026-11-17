# AGENTS.md — Repository & Engineering Guidelines

## 1. Project Overview & Deployment Target
- **Purpose:** Personal Full-Stack Developer portfolio for Kittiphat Duangmanee (Mark).
- **Name Format:** The full name is `Kittiphat Duangmanee`. With the nickname it is always `Kittiphat Duangmanee (Mark)`, never a quoted nickname between the given and family name.
- **Target Hosting:** Static hosting on **GitHub Pages** (`gh-pages` / static build output).
- **Core Constraints:**
  - Must build cleanly as a 100% static bundle (no server-side runtime dependencies, SSR-only APIs, or live backend calls required to render core content).
  - All asset paths must resolve cleanly under relative/configured base paths without broken links on GitHub Pages.

---

## 2. Directory & Data Architecture
- **Strict Separation of Data and UI:**
  - All portfolio content (bio, experience, projects, tech stacks, architecture specs, certificates, social links) MUST live in typed TypeScript modules under `src/data/*.ts` (e.g., `profile.ts`, `projects.ts`, `certificates.ts`).
  - UI components must consume data strictly via props or imports from `src/data/`—never hardcode copy, metrics, or project lists inside JSX/TSX components.
  - The personal Core Stack in `src/data/profile.ts` lists verified hands-on skills only. Tools used in one project (for example Hono, Cloudflare Workers, CockroachDB and Drizzle ORM in OrderDi, or the LINE Messaging API and SMTP in the solar system) stay in that project's `stack` in `src/data/projects.ts`. The types enforce it: `StackGroup.items` takes `CoreTechId` only.
  - `src/data/projects.ts` holds exactly two finished projects: the Solar String Monitoring Alarm System and OrderDi. Each has 3 to 5 real `screens`, a `stack` of tech ids, a `detail` block (overview, contributions, architecture diagram from `src/data/diagrams/`), and either a `live` link or a `note` saying why there is none.
  - Site copy contains no em dash or en dash; `npm run verify:data` fails on one. Project copy is written in plain sentences and checked against the humanizer rules (no "not X but Y" contrasts, no one-line closers, no reflex triads, no inflated words).
- **Design Reference:** Follow `design/reference/spec.md` for visual tokens, typography, spacing, and motion parameters.

---

## 3. Asset Processing Pipeline
Before building UI components, ensure raw assets from `design/assets/` are processed and optimized into `public/`:
1. **Profile Photo (`design/assets/IMG_5228.jpg`):**
   - Must apply EXIF auto-orientation first to prevent sideways rotation from DSLR metadata.
   - Resize to `560px` width (preserving aspect ratio) and export as `public/images/profile-avatar.webp` (quality ~82–85).
2. **Certificates (`design/assets/certificates/`):**
   - Process all **4** certificate PDFs listed under `certificates` in `scripts/assets/manifest.json`: `AWS_Cloud_Practioner_Certificate.pdf` (the source file is spelled this way), `Depa_certificate.pdf`, `arit_certificate.pdf` and `Cybersecurity_certificate.pdf` (Certiport IT Specialist: Cybersecurity).
   - Publish page 1 only. Page 2 of the Certiport PDF is a score report with private contact details and registration ids.
   - Render page 1 of each PDF into high-DPI `.webp` preview images under `public/images/certificates/` for fast carousel rendering.
   - Copy/expose sanitized `.pdf` files under `public/certificates/` so users can view or download full certificates from the lightbox modal.
3. **Project Screens (`design/assets/projects/<solar|orderdi>/`):**
   - Sources are real: OrderDi screens are captured from the live app at a 1440x900 viewport with device scale 2 (2880x1800 PNG) from a demo shop; Solar screens are frames exported at 2x from the Solar_Monitoring Figma file.
   - List each source in `scripts/assets/manifest.json` under `projects.sets` (a set may add `masks`: boxes in source pixels filled with a flat colour sampled from the screen), then run `node scripts/assets/run.mjs projects`. It writes `public/images/projects/<id>/screen-N.webp` (whole frame, at most 2880px wide, for the zoom view) and `screen-N-card.webp` (1440x900, cropped from the top, for the carousel), with no metadata.
   - Look at every output before it is referenced. Nothing goes to `public/` that shows a real phone number, PromptPay id, customer name, client site name or internal hostname.

---

## 4. Security, Privacy & NDA Compliance
- **Confidentiality:** Never expose proprietary data, internal hostnames, private endpoints, raw telemetry logs, or confidential schematics from **SCG Cleanergy** or client systems.
- **Solar Monitoring Representation:** The dashboard is shown through frames from the Solar_Monitoring Figma file, which use synthetic names and figures (approved by the author on 2026-11-17). The company logo in the frames' sidebar is covered by a `masks` entry in `scripts/assets/manifest.json`, so the published screens carry no company mark. Never use screenshots of the production system. The architecture diagram stays abstract: an anonymised "plant data source", no site names, endpoints or hostnames.
- **Secrets:** Never commit `.env` files, API tokens, or personal contact credentials not explicitly approved in `src/data/profile.ts`.

---

## 5. Design & Motion Standards (Framer Motion Only)
Use **Framer Motion** exclusively for animations. Do not install heavy external scroll/3D libraries (e.g., Three.js, GSAP, Locomotive Scroll) unless explicitly requested.

### A. Project Showcase Cards (`ProjectShowcaseCard.tsx`)
- **Layout:** `lg:grid-cols-12`, screens in `lg:col-span-7`, summary in `lg:col-span-5`; stacked below `lg`. The section header is a plain `h2` "Projects" with one line under it. No eyebrow, no index rail, no book framing.
- **Summary column:** title (`h3`), role badge (parts joined with a middot), a summary of at most three sentences, `TechBadge` list, the primary button `View project details and architecture` (`active:scale-[0.97]`), then `Visit live app` for OrderDi or a lock note for the solar system.
- **Entrance:** one `whileInView` fade with a 16px rise (`viewport={{ once: true, amount: 0.2 }}`, 0.5s on the site ease-out).

### B. Screen Carousel (`ProjectUiCarousel.tsx`) and Zoom (`ScreenshotLightbox.tsx`)
- **Frame:** `rounded-xl border border-hairline bg-surface shadow-window overflow-hidden`, a quiet chrome row (three dots, the screen title, a zoom button), a stage at the card ratio (16:10), and the caption underneath.
- **Autoplay:** every `4.5s`, timed by one motion value written from `useAnimationFrame` and bound to the active pill's `scaleX`, so ticks never re-render React. Pauses on mouse hover, keyboard focus, drag, zoom, the detail modal, off screen, and by the pause button. No autoplay under reduced motion.
- **Change of slide:** `AnimatePresence` with direction: a 28px slide on a spring without overshoot (`stiffness: 320, damping: 36, mass: 0.9`) and a 220ms opacity fade. Reduced motion: fade only.
- **Controls:** previous and next buttons, one pill per screen, `drag="x"` with `touch-action: pan-y` (changes on 50px or a 400px/s flick), arrow keys on the focused carousel, and click or the zoom button for the full-resolution lightbox.

### C. Detail Modal (`ProjectDetailModal.tsx`) and Architecture Diagram (`DrawioArchitectureDiagram.tsx`)
- **Modal:** `primitives/ModalDialog.tsx` on a native `<dialog>`: focus trap, inert page, scroll lock, Escape and scrim click, focus back on the trigger. `max-w-5xl` centred panel from `md` (spring entrance `duration: 0.45, bounce: 0` from `scale: 0.97, y: 12`; 180ms exit); a bottom sheet on phones on the drawer curve. Blurred scrim.
- **Content:** fixed header (title, role and period, tech badges from `md`), then overview and problem, a check-marked list of contributions, and the architecture diagram.
- **Diagram:** a light Draw.io-style canvas (`diagram-grid`: `#F8FAFC` with `#E2E8F0` lines, `#CBD5E1` border), a toolbar of flow filters and a reset, white icon node cards (`border-2 rounded-xl`, 28px icon, bold title, mono tech line), orthogonal connectors with rounded corners, arrowheads and label chips, and dots that travel along live connectors. Hover previews a node, click selects it: its connectors and neighbours stay lit, the rest dims, and the inspector shows technology, input, output and the key decision. Below a 920px stage the grid is transposed to read top to bottom, so it never scrolls sideways.

### D. 3D Certificate Coverflow Carousel
- Render `src/data/certificates.ts` in an interactive **3D Perspective Coverflow Carousel**:
  - **Center Card (`offset === 0`):** `scale: 1`, `rotateY: 0deg`, `zIndex: 20`, full opacity, with active 3D pointer tilt on desktop.
  - **Adjacent Cards (`offset === ±1`):** `scale: 0.86`, angled inward (`rotateY: offset * -20deg`), shifted horizontally with reduced opacity (`0.7`), clickable to bring into center focus.
  - **Controls & Lightbox:** Support touch swipe/drag (`drag="x"`), prev/next buttons, scoped keyboard arrow navigation (active only when the carousel section is focused/in view so it does not conflict with project navigation), and a click-to-open Lightbox modal displaying the high-res `.webp` plus a PDF download/view button.

### E. Hero & Interactive Embossed Background
- **Hero Content:** `h1` name, a sans-serif role line (`Full-Stack Developer`), a two-sentence bio, one primary CTA, three metadata columns (Education, Experience, Location), the Core Stack, and the portrait card with a two-line caption. No status or availability pill, no `FIG.` / `Fig.` labels, and no registration marks or crosshairs.
- **Background (`src/components/InteractiveBackground.tsx`):** A static `24px` dot matrix on the canvas, with an aligned layer of larger ink dots and a warm highlight that rise under the cursor through a radial mask.
  - Track the pointer with `useMotionValue` smoothed by `useSpring` (`stiffness: 220, damping: 28, mass: 0.5`) and build the mask with `useMotionTemplate`, so mouse movement causes zero React re-renders.
  - **Touch & Reduced Motion:** When `(pointer: coarse)` matches or `prefers-reduced-motion` is set, do not mount the relief layer or attach pointer listeners. Keep the static dot grid.

### F. Core Stack and Project Tech Badges
- Render `profile.stackGroups` in a two by two grid (`grid-cols-1 sm:grid-cols-2 gap-6`) of four categories: Backend, Frontend, Databases & Cache, DevOps & Cloud.
- Each technology, in the Core Stack and in every project stack, is a `primitives/TechBadge.tsx` badge with a 16x16 brand mark from `src/components/primitives/TechIcon.tsx`. The icon map is typed by `TechId`, so every stack item must have a mark. Do not install an icon library for them.
- Hover lift is `whileHover={{ y: -2 }}` on a spring (`stiffness: 400, damping: 25`), dropped under reduced motion.

---

## 6. Responsive & Accessibility Requirements
- **Breakpoints:** Must render cleanly from `375px` (mobile) up to `1440px+` (wide desktop) with zero horizontal overflow.
- **Reduced Motion:** Respect `prefers-reduced-motion` via Framer Motion's `MotionConfig reducedMotion="user"` so tilts, slides and travelling dots degrade to fades or stillness.
- **Contrast & Tokens:** Text meets 4.5:1 on its surface. Muted Ink (`#8A909E`) is for axis labels and line numbers only; small labels use Secondary Ink (`#525866`). Colours, shadows and gradients live in `src/styles/tokens.css`, never as raw values in components.
- **Semantics:** Maintain proper heading hierarchy (`h1` -> `h2` -> `h3`), accessible `aria-label` attributes on carousel controls and modals, and descriptive `alt` text for all `.webp` images.

---

## 7. Agent Execution & Verification Protocol
Before marking any task complete, the agent MUST verify:
1. All TypeScript types compile with zero errors (`npm run typecheck` or `npx tsc --noEmit`).
2. Production static build succeeds (`npm run build`) with zero missing asset warnings.
3. All rendered `.webp` and `.pdf` assets referenced in `src/data/*.ts` exist in `public/`, at the dimensions the data states (`npm run verify:assets`).
4. The layout holds at 375px, 768px and 1440px with no horizontal page scroll, and the detail modal and diagram work at each width.