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
  - The personal Core Stack in `src/data/profile.ts` lists verified hands-on skills only. Tools used in one project (for example Hono, Cloudflare Workers, CockroachDB and Drizzle ORM in OrderDi) stay in that project's `stack` in `src/data/projects.ts`.
  - Site copy contains no em dash or en dash; `npm run verify:data` fails on one.
- **Design Reference:** Follow `design/reference/spec.md` for visual tokens, typography, spacing, and motion parameters.

---

## 3. Asset Processing Pipeline
Before building UI components, ensure raw assets from `design/assets/` are processed and optimized into `public/`:
1. **Profile Photo (`design/assets/IMG_5228.jpg`):**
   - Must apply EXIF auto-orientation first to prevent sideways rotation from DSLR metadata.
   - Resize to `560px` width (preserving aspect ratio) and export as `public/images/profile-avatar.webp` (quality ~82–85).
2. **Certificates (`design/assets/certificates/`):**
   - Process all **4** certificate PDFs (`AWS_Cloud_Practitioner_Certificate.pdf`, `Depa_certificate.pdf`, `arit_certificate.pdf`, and the `LCCE` certificate PDF—verify exact filenames in directory before running script).
   - Render page 1 of each PDF into high-DPI `.webp` preview images under `public/images/certificates/` for fast carousel rendering.
   - Copy/expose sanitized `.pdf` files under `public/certificates/` so users can view or download full certificates from the lightbox modal.

---

## 4. Security, Privacy & NDA Compliance
- **Confidentiality:** Never expose proprietary data, internal hostnames, private endpoints, raw telemetry logs, or confidential schematics from **SCG Cleanergy** or client systems.
- **Solar Monitoring Representation:** Depict the Solar String Monitoring Alarm system using abstracted architecture, synthetic/anonymized metrics, and clean interactive SVG diagrams rather than confidential production screenshots.
- **Secrets:** Never commit `.env` files, API tokens, or personal contact credentials not explicitly approved in `src/data/profile.ts`.

---

## 5. Design & Motion Standards (Framer Motion Only)
Use **Framer Motion** exclusively for animations. Do not install heavy external scroll/3D libraries (e.g., Three.js, GSAP, Locomotive Scroll) unless explicitly requested.

### A. Wide 3D Project Monograph Cards
- **Proportion & Tactile Detail:** Use a landscape monograph proportion (`aspect-[16/10]` on desktop, responsive stacking on mobile) instead of narrow portrait book ratios. Retain a subtle left-edge book spine crease, volume numbering (`VOL. I`, `VOL. II`, etc.), and fine paper-grain border styling.
- **3D Interactive Tilt:**
  - Wrap cards in `perspective: 1200px` with `transformStyle: "preserve-3d"`.
  - Use `useMotionValue` + `useSpring` for smooth pointer-driven tilt capped at `±7deg` on `rotateX` and `rotateY`.
  - Apply Z-axis depth separation: base cover (`translateZ(0px)`), primary screenshot/interactive SVG diagram (`translateZ(24px)`), floating badges/tech pills (`translateZ(36px)`), and a subtle pointer-tracking radial sheen.
  - **Touch Devices:** Automatically disable pointer tilt when `(pointer: coarse)` is detected to prevent stuck tilt states during mobile scrolling.

### B. Scroll-Driven Motion
- **Viewport Reveals:** Use Framer Motion `whileInView` (`viewport={{ once: true, amount: 0.2 }}`) for clean entrance transitions (`rotateX` settling from `8deg` to `0deg`, subtle `y` translation, and opacity fade).
- **Scroll Parallax:** Bind `useScroll` + `useTransform` to project section refs so inner visual layers shift subtly relative to the outer monograph frame during vertical scroll.
- **Sticky Volume Index:** Provide a desktop sticky side index synced with scroll position to highlight the active project volume.

### C. 3D Certificate Coverflow Carousel
- Render `src/data/certificates.ts` in an interactive **3D Perspective Coverflow Carousel**:
  - **Center Card (`offset === 0`):** `scale: 1`, `rotateY: 0deg`, `zIndex: 20`, full opacity, with active 3D pointer tilt on desktop.
  - **Adjacent Cards (`offset === ±1`):** `scale: 0.86`, angled inward (`rotateY: offset * -20deg`), shifted horizontally with reduced opacity (`0.7`), clickable to bring into center focus.
  - **Controls & Lightbox:** Support touch swipe/drag (`drag="x"`), prev/next buttons, scoped keyboard arrow navigation (active only when the carousel section is focused/in view so it does not conflict with project navigation), and a click-to-open Lightbox modal displaying the high-res `.webp` plus a PDF download/view button.

### D. Hero & Interactive Embossed Background
- **Hero Content:** `h1` name, a sans-serif role line (`Full-Stack Developer`), a two-sentence bio, one primary CTA, three metadata columns (Education, Experience, Location), the Core Stack, and the portrait card with a two-line caption. No status or availability pill, no `FIG.` / `Fig.` labels, and no registration marks or crosshairs.
- **Background (`src/components/InteractiveBackground.tsx`):** A static `24px` dot matrix on the canvas, with an aligned layer of larger ink dots and a warm highlight that rise under the cursor through a radial mask.
  - Track the pointer with `useMotionValue` smoothed by `useSpring` (`stiffness: 220, damping: 28, mass: 0.5`) and build the mask with `useMotionTemplate`, so mouse movement causes zero React re-renders.
  - **Touch & Reduced Motion:** When `(pointer: coarse)` matches or `prefers-reduced-motion` is set, do not mount the relief layer or attach pointer listeners. Keep the static dot grid.

### E. Core Stack Badges
- Render `profile.stackGroups` in a two by two grid (`grid-cols-1 sm:grid-cols-2 gap-6`) of four categories: Backend, Frontend, Databases & Cache, DevOps & Cloud.
- Each technology is a badge with a 16x16 brand mark from `src/components/primitives/TechIcon.tsx`. The icon map is typed by `TechId`, so every stack item must have a mark. Do not install an icon library for them.
- Hover lift is `whileHover={{ y: -2 }}` on a spring (`stiffness: 400, damping: 25`), dropped under reduced motion.

---

## 6. Responsive & Accessibility Requirements
- **Breakpoints:** Must render cleanly from `375px` (mobile) up to `1440px+` (wide desktop) with zero horizontal overflow.
- **Reduced Motion:** Respect `prefers-reduced-motion` via Framer Motion's `MotionConfig reducedMotion="user"` so 3D tilts and scroll transforms degrade gracefully.
- **Contrast & Tokens:** Text meets 4.5:1 on its surface. Muted Ink (`#8A909E`) is for axis labels and line numbers only; small labels use Secondary Ink (`#525866`). Colours, shadows and gradients live in `src/styles/tokens.css`, never as raw values in components.
- **Semantics:** Maintain proper heading hierarchy (`h1` -> `h2` -> `h3`), accessible `aria-label` attributes on carousel controls and modals, and descriptive `alt` text for all `.webp` images.

---

## 7. Agent Execution & Verification Protocol
Before marking any task complete, the agent MUST verify:
1. All TypeScript types compile with zero errors (`npm run typecheck` or `npx tsc --noEmit`).
2. Production static build succeeds (`npm run build`) with zero missing asset warnings.
3. All rendered `.webp` and `.pdf` assets referenced in `src/data/*.ts` exist in `public/`.