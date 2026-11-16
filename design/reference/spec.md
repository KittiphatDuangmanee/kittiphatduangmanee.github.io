# Design & Motion Specification (`design/reference/spec.md`)

This document defines the visual tokens, layout proportions, and Framer Motion physics for Kittiphat Duangmanee’s engineering portfolio. It adapts the editorial rigor of technical monographs into a **wide landscape 3D format** optimized for system architecture diagrams and full-stack product previews.

---

## 1. Color System & Per-Volume Monograph Themes

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

Components never write these values as raw hex. They bind to the tokens in `src/styles/tokens.css` (`bg-canvas`, `text-ink-2`, `border-hairline`, `shadow-portrait`), and `npm run gate:tokens` fails on a colour literal anywhere else in `src/`.

### Technology Mark Tokens (Core Stack Icons Only)
- Python `#3776AB` · FastAPI `#009688` · Java `#E76F00` (steam) and `#5382A1` (cup) · Spring `#6DB33F` · RabbitMQ `#FF6600`
- TypeScript `#3178C6` · React `#087EA4` · Angular `#DD0031` · Tailwind CSS `#06B6D4`
- PostgreSQL `#336791` · TimescaleDB `#FDB515` · MySQL `#4479A1` · Redis `#FF4438`
- Docker `#2496ED` · AWS `#232F3E` (wordmark) and `#FF9900` (smile) · Git `#F03C2E`

### Monograph Volume Accent Tokens
Each project volume carries a distinct cover spine and technical accent palette:
- **VOL. I — Solar String Monitoring Alarm System**
  - Primary Cover / Spine: `#0F2922` (Deep Telemetry Forest)
  - Accent / Highlight: `#F59E0B` (Solar Amber)
  - Diagram Grid Tint: `#163B31`
- **VOL. II — OrderDi (Restaurant Order Management)**
  - Primary Cover / Spine: `#18181B` (Obsidian Kitchen)
  - Accent / Highlight: `#EF4444` (Order Vermilion)
  - Surface Tint: `#27272A`
- **VOL. III — Salon Booking Microservices Platform**
  - Primary Cover / Spine: `#0F172A` (Midnight Cloud)
  - Accent / Highlight: `#3B82F6` (Gateway Cobalt)
  - Diagram Grid Tint: `#1E293B`
- **VOL. IV — RealWorld_XP (Gamified Activity Tracker)**
  - Primary Cover / Spine: `#1E1B4B` (Deep Indigo)
  - Accent / Highlight: `#8B5CF6` (Neural Violet)
  - Surface Tint: `#2E2A6E`

---

## 2. Typography & Scale

Load via Google Fonts (with system fallbacks):
- **Display / Monograph Cover Title:** `'Newsreader', Georgia, serif` (Weights: `500`, `600`, italic for subtitles)
- **UI & Technical Body:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` (Weights: `400`, `500`, `600`, `700`)
- **Monospace / Telemetry / Stack Tags:** `'JetBrains Mono', monospace` (Weights: `400`, `500`)

### Type Scale
- **Hero Headline (`h1`):** `clamp(2.25rem, 4.5vw, 3.75rem)` | Line-height `1.08` | Tracking `-0.03em`
- **Section Heading (`h2`):** `clamp(1.75rem, 3vw, 2.5rem)` | Line-height `1.15` | Tracking `-0.02em`
- **Monograph Cover Title (`h3`):** `clamp(1.35rem, 2.2vw, 1.85rem)` | Line-height `1.2`
- **Body Copy:** `1rem` (`16px`) | Line-height `1.65` | Max measure `65ch`
- **Technical Metadata / Volume Tag:** `0.75rem` (`12px`) | `JetBrains Mono` | Uppercase | Tracking `0.08em`

---

## 3. Page Architecture & Responsive Grid

- **Container:** `max-w-7xl` (`1280px`), centered, horizontal padding `px-5 sm:px-8 lg:px-12`.
- **Section Vertical Rhythm:** `py-20 lg:py-28` with `1px solid #E4E2DD` editorial dividers between major sections.

### Section Breakdown
1. **Top Navigation Bar:** Minimal sticky header (`h-16`, `backdrop-blur-md bg-[#FAF9F6]/85`) with monogram mark, anchor links (`Projects`, `Architecture`, `Certifications`, `Contact`), and GitHub/Resume links.
2. **Hero Section:** Asymmetric 12-column grid (`lg:grid-cols-12`, `gap-10 items-start`) over the Interactive Embossed Background (section 7).
   - Left (`lg:col-span-7`), in this order:
     - `h1`: `Kittiphat Duangmanee` in Newsreader at the Hero Headline scale.
     - Role line directly beneath: `Full-Stack Developer` in Plus Jakarta Sans (`text-2xl sm:text-3xl font-semibold tracking-tight`, Secondary Ink). Never italic serif.
     - Bio: two sentences, about 28 words at most (`max-w-xl text-base sm:text-[17px] leading-relaxed`, Secondary Ink).
     - Primary CTA (`Explore Monographs`) with press feedback (`active:scale-[0.97]`).
     - Three metadata columns, each a small icon and mono label over two lines: `EDUCATION` (`B.Eng. in Computer Engineering` / `Kasetsart University, 2026`), `EXPERIENCE` (`Application Design Intern` / `SCG Cleanergy (Nov 2025 to Mar 2026)`), `LOCATION` (`Bangkok, Thailand` / `Thailand (UTC+7)`).
     - Core Stack (section 8).
   - Right (`lg:col-span-5`): portrait card (`max-w-[360px] rounded-2xl bg-white p-2.5 border border-[#E4E2DD] shadow-[0_12px_32px_-12px_rgba(20,21,23,0.12)]`). Inside it, `public/images/profile-avatar.webp` on a `#F3F1EC` panel (`aspect-[4/5]`, inner radius 6px so the corners stay concentric), then a caption: `Kittiphat Duangmanee (Mark)` (`font-semibold`, Primary Ink) over `B.Eng. in Computer Engineering, Kasetsart University` (`text-xs`, Secondary Ink). On `lg:` and wider the card is `sticky top-24`, so it starts level with the name and stays beside the column.
   - **Not in the hero:** no status or availability pill, no `FIG.` / `Fig.` figure labels, no registration marks or crosshairs around the portrait.
   - **Name format:** the full name is `Kittiphat Duangmanee`. With the nickname it is always `Kittiphat Duangmanee (Mark)`, never a quoted nickname between the given and family name.
   - **Copy punctuation:** no em dash or en dash in site copy (`npm run verify:data` enforces it). Use a comma, a colon, a period, or the word `to` in date ranges.
3. **Selected Works (Wide 3D Monograph Index):**
   - Desktop (`lg:grid-cols-12`): Sticky left index rail (`lg:col-span-3`, `sticky top-28`) listing `VOL. I` – `VOL. IV` with active scroll indicator; Right content column (`lg:col-span-9`) stacking the Monograph cards and their structured architectural takeaways.
   - Mobile (`< 1024px`): Single-column stack with horizontal scrollable volume jump pills.
4. **Certifications (3D Coverflow Carousel):** Full-width centered showcase displaying the 4 certificates (`AWS`, `depa`, `ARIT`, `LCCE`).
5. **Footer / Contact:** Clean colophon with build stack note, email copy button, and external profiles.

---

## 4. Component Spec: Wide 3D Monograph Card

### Proportions & Book Anatomy
- **Aspect Ratio:** `aspect-[16/10]` on `md:` and larger (`w-full max-w-[780px]`); on mobile (`< 768px`), adapt gracefully (`min-h-[340px]`) so internal diagrams/text never clip.
- **Book Spine & Crease (Left Edge):**
  - Spine width: `w-6 sm:w-8` on the left edge (`rounded-l-[4px] rounded-r-2xl`).
  - Crease shadow overlay:
    ```css
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.28) 0%,
      rgba(255, 255, 255, 0.18) 35%,
      rgba(0, 0, 0, 0.22) 65%,
      rgba(255, 255, 255, 0.08) 100%
    );
    ```
  - Outer book elevation shadow: `0 24px 48px -12px rgba(20, 21, 23, 0.22), 0 4px 12px -2px rgba(20, 21, 23, 0.08)`.
  - Subtle paper grain texture overlay (`pointer-events-none opacity-[0.035]`).

### 3D Tilt & Depth Layering (Framer Motion)
- **Outer Wrapper:** `style={{ perspective: 1200 }}`
- **Tilt Surface (`motion.div`):**
  - `style={{ transformStyle: "preserve-3d", rotateX, rotateY }}`
  - Spring smoothing: `useSpring(rawValue, { stiffness: 260, damping: 24, mass: 0.6 })`
  - Pointer tilt range: Clamp `rotateX` and `rotateY` strictly within `[-7, 7]` degrees.
  - **Touch Rule:** Check `window.matchMedia("(pointer: coarse)").matches`; if `true`, lock `rotateX = 0` and `rotateY = 0`.
- **Z-Axis Depth Layers:**
  - **Layer 0 (`translateZ(0px)`):** Monograph cover background, spine crease, faint architectural coordinate grid.
  - **Layer 1 (`translateZ(24px)`):** Main visual viewport (`rounded-lg border border-white/15 shadow-xl overflow-hidden`):
    - *VOL. I & VOL. III:* Interactive SVG system/microservices architecture diagram with clickable or hoverable nodes (e.g., Inverter String -> FastAPI -> TimescaleDB -> Redis -> Alerting) using synthetic metrics.
    - *VOL. II & VOL. IV:* Clean UI preview card / interactive state preview.
  - **Layer 2 (`translateZ(36px)`):** Floating top header bar (`VOL. I` monospace tag + domain badge) and bottom quick-metric callout pill.
  - **Interactive Specular Sheen:** Pointer-following `radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.14), transparent 70%)`.

---

## 5. Component Spec: Scroll-Driven Animations

- **Global Wrapper:** Wrap root application in `<MotionConfig reducedMotion="user">`.
- **Monograph Entrance (`whileInView`):**
  - `initial={{ opacity: 0, y: 36, rotateX: 8 }}`
  - `whileInView={{ opacity: 1, y: 0, rotateX: 0 }}`
  - `viewport={{ once: true, amount: 0.2 }}`
  - `transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}`
- **Inner Layer Scroll Parallax:**
  - Attach `useScroll({ target: cardRef, offset: ["start end", "end start"] })` to each monograph container.
  - Map `scrollYProgress` to subtle vertical shift on Layer 1 (`y: useTransform(scrollYProgress, [0, 1], [-12, 12])`) so the internal diagram/preview glides subtly within the cover frame.
- **Sticky Volume Index Sync:**
  - Use `IntersectionObserver` (`rootMargin: "-35% 0px -45% 0px"`) to update the active volume indicator in the sticky sidebar smoothly as the user scrolls.

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

## 8. Component Spec: Core Stack

The personal core stack (`src/components/CoreStack.tsx`), fed by `profile.stackGroups`. It lists verified, hands-on skills only. A tool used in a single project stays in that project's stack in `src/data/projects.ts` (for example Hono, Cloudflare Workers, CockroachDB and Drizzle ORM belong to OrderDi, not to the personal stack).

### Content
- **Backend:** Python, FastAPI, Java, Spring Boot, Spring Cloud Gateway, RabbitMQ
- **Frontend:** TypeScript, React, Angular, Tailwind CSS
- **Databases & Cache:** PostgreSQL, TimescaleDB, MySQL, Redis
- **DevOps & Cloud:** Docker, AWS, Git

### Layout
- A two by two grid of the four categories: `grid-cols-1 sm:grid-cols-2 gap-6`.
- Category header: Technical Metadata style (`JetBrains Mono`, 12px, uppercase), Secondary Ink, `mb-3`.
- Badge: `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E4E2DD] text-[13px] font-medium text-[#141517] shadow-[0_1px_2px_rgba(20,21,23,0.04)] transition-colors hover:border-[#C5C0B8]`.
- Hover lift: `whileHover={{ y: -2 }}` with `transition={{ type: "spring", stiffness: 400, damping: 25 }}`. The lift is dropped under reduced motion; the border change stays.

### Technology Icons
- `src/components/primitives/TechIcon.tsx` renders one 16x16 mark per technology in its brand colour (Technology Mark Tokens, section 1). Icons are decorative (`aria-hidden`); the name is always beside them as text.
- Path data lives in `src/components/primitives/tech-icon-paths.ts`. The outlines come from the Simple Icons project (CC0 1.0), with two exceptions: the Java cup is drawn for this site, and the MySQL mark keeps only its dolphin because the wordmark cannot be read at 16px.
- The icon map is typed by `TechId`, so a stack item without an icon fails the typecheck.
- The hero metadata labels use `lucide-react` line icons (`GraduationCap`, `Briefcase`, `MapPin`) at 14px with a 1.75 stroke.
