# CLAUDE.md — Claude Code Execution & Architecture Guide

This repository hosts the personal full-stack developer portfolio of **Kittiphat Duangmanee (Mark)**, deployed statically to **GitHub Pages**.

Always adhere to the rules in `AGENTS.md` and visual/motion tokens in `design/reference/spec.md`.

---

## 1. Execution Workflow (Follow Strictly in Order)
When building or refactoring features, execute in this sequence:
1. **Inspect & Plan:** Check `package.json`, `vite.config.*` / `next.config.*`, and existing `src/` structure to confirm static export compatibility (`base` path & asset resolution).
2. **Asset Pipeline First:** Before writing UI components, process raw assets from `design/assets/` into `public/`:
   - Convert `design/assets/IMG_5228.jpg` -> `public/images/profile-avatar.webp` (must apply EXIF auto-orientation first, resize to `560px` width).
   - Convert all **4** certificate PDFs in `design/assets/certificates/` into high-DPI `.webp` previews in `public/images/certificates/` and copy the PDFs to `public/certificates/`.
   - Convert the real project screens in `design/assets/projects/<solar|orderdi>/` into `public/images/projects/<id>/screen-N.webp` (full frame, up to 2880px wide) and `screen-N-card.webp` (1440x900 crop from the top) with `node scripts/assets/run.mjs projects`. Sources are listed in `scripts/assets/manifest.json`.
3. **Typed Data Layer (`src/data/*.ts`):** Define TypeScript interfaces and populate `profile.ts`, `projects.ts`, and `certificates.ts` before building components.
4. **UI & Framer Motion Implementation:** Build modular components consuming `src/data/*.ts` with the hero (interactive embossed dot background, icon Core Stack), the project showcase (real screen carousel, detail modal, Draw.io-style architecture diagram), and the 3D Certificate Coverflow Carousel.
5. **Verification:** Run typecheck (`tsc --noEmit`) and production build (`npm run build`), confirming zero errors and verifying that every asset path in `src/data/*.ts` exists in `public/`. `npm run verify:data` also requires exactly 2 projects with 3 to 5 real screens each.

---

## 2. Portfolio Content & Domain Blueprint

### Profile (`src/data/profile.ts`)
- **Name:** full name `Kittiphat Duangmanee`, nickname `Mark`. With the nickname it is always written `Kittiphat Duangmanee (Mark)`. Never use a quoted nickname between the given and family name.
- **Role:** `Full-Stack Developer`
- **Bio:** two short sentences, about 28 words at most, with no em dash or en dash.
- **Education:** B.Eng. in Computer Engineering, Kasetsart University (2026)
- **Experience:** Application Design Intern, SCG Cleanergy (Nov 2025 to Mar 2026)
- **Location:** Bangkok, Thailand (UTC+7)
- **Focus:** Full-Stack Systems, Backend Microservices, Time-Series Telemetry & Cloud Architecture.
- **Core Stack (verified hands-on skills only):**
  - **Backend:** Python, FastAPI, Java, Spring Boot, Spring Cloud Gateway, RabbitMQ
  - **Frontend:** TypeScript, React, Angular, Tailwind CSS
  - **Databases & Cache:** PostgreSQL, TimescaleDB, MySQL, Redis
  - **DevOps & Cloud:** Docker, AWS, Git
  - Tools used in a single project (Hono, Cloudflare Workers, CockroachDB, Drizzle ORM) stay in that project's entry in `src/data/projects.ts` and never appear in the personal Core Stack.

### Projects (`src/data/projects.ts`)
Exactly **2** finished projects. Unfinished or undeployed work (the salon booking microservices and RealWorld_XP) is not shown. Each project is a showcase card (`src/components/ProjectShowcaseCard.tsx`): real screens in an auto-rotating window frame on the left, and a title, role badge, two or three sentence summary, icon tech badges and actions on the right. The long form opens in `ProjectDetailModal.tsx`.
- **Solar String Monitoring Alarm System** *(SCG Cleanergy, Application Design Intern, Nov 2025 to Mar 2026)*
  - **Stack:** Python, FastAPI, React, TimescaleDB, Redis, LINE Messaging API, SMTP.
  - **Screens:** 5 frames exported at 2x from the Solar_Monitoring Figma file (overview, string status grid, string performance, string detail, event history). They carry synthetic names and figures only. The SCG Cleanergy logo in their sidebar is covered by the pipeline's `masks` step; "Site A - Rayong" stays, as the author decided. Never internal hostnames or production data.
  - **Action:** no link; a muted note says it is an internal enterprise system shown with synthetic data.
- **OrderDi** *(restaurant order and POS platform, live in production)*
  - **Stack:** Hono, TypeScript, Tailwind CSS, Drizzle ORM, CockroachDB, Cloudflare Workers.
  - **Screens:** captured from the live app (`https://orderdi.apps.sv-academy.org`) at 1440x900, device scale 2, from a demo shop: floor plan, counter sale, menu management, sales report.
  - **Action:** `Visit live app` (`target="_blank"`, `rel="noopener noreferrer"`).
- **Detail modal:** overview and problem, a check-marked list of what I built, and the system architecture as `DrawioArchitectureDiagram.tsx` (data in `src/data/diagrams/`).
- **Copy:** plain sentences, run through the humanizer rules: no "not X but Y", no one-line closers, no reflex triads, no inflated words, no dash characters.

### Certifications (`src/data/certificates.ts`)
Include all **4** certificates in the 3D Coverflow Carousel. Titles are written exactly as each document states them, never as a stronger credential:
1. **AWS Cloud Practitioner Essentials** (AWS Training & Certification, course completion certificate)
2. **Security Engineer Training Program** (depa with ARIT, 60 hour training certificate)
3. **Security Engineer Program, Selected Participant** (ARIT Co., Ltd., selection certificate)
4. **IT Specialist: Cybersecurity** (Certiport, a Pearson VUE business, exam based certification)

---

## 3. Code & Motion Guardrails (Avoid These Pitfalls)
- **Real Screens Only:** Project visuals are real captures or exported design frames under `public/images/projects/`. Never hand-code a fake HTML/CSS UI mockup of a product. No book or monograph framing (no spines, no `VOL.` numbering, no index rail).
- **No Unapproved Libraries:** Use **Framer Motion** exclusively for the certificate tilt (`preserve-3d`, `useMotionValue`, `useSpring`), carousel and modal transitions, and diagram flow dots. Do not install Three.js, GSAP, or heavy carousel dependencies.
- **Touch & Reduced Motion Safety:**
  - Disable pointer-driven 3D tilt on `(pointer: coarse)` touch devices so cards never get stuck tilted during mobile scrolling.
  - Wrap the app in `<MotionConfig reducedMotion="user">`. Under reduced motion the screen carousel does not autoplay or slide (it cross-fades), the modal fades without travel, and the diagram shows no moving dots.
- **Carousel Autoplay:** 4.5s per screen, driven by one motion value bound to the progress bar so it never re-renders React. It pauses on mouse hover, keyboard focus, drag, the zoom view, the detail modal, off screen, and through a visible pause button.
- **No Template Clutter in the Hero:** No status or availability pill, no `FIG.` / `Fig.` figure labels anywhere in `src/`, and no registration marks or crosshairs around the portrait. The role line is sans-serif (Plus Jakarta Sans), never oversized italic serif.
- **Interactive Embossed Background:** `src/components/InteractiveBackground.tsx` tracks the pointer with `useMotionValue` + `useSpring` and reveals the raised dots through a `useMotionTemplate` mask, so mouse movement never re-renders React. Do not mount the relief layer or attach pointer listeners when `(pointer: coarse)` matches or reduced motion is set; the static dot grid stays.
- **Tech Icons:** Every Core Stack item and every project stack item needs a mark in `src/components/primitives/TechIcon.tsx`, and both render through the same `primitives/TechBadge.tsx`, so project badges always match the Core Stack. `TechId` is `CoreTechId | ProjectTechId`; `profile.stackGroups` accepts only `CoreTechId`, so a project-only tool cannot reach the Core Stack. Do not add an icon library for them.
- **Colours Through Tokens:** Never write a raw hex, `rgb()` or shadow colour in a component. Add it to `src/styles/tokens.css` and bind to the token; `npm run gate:tokens` enforces this, and `npm run check` runs every gate.
- **Keyboard Event Isolation:** Scope `ArrowLeft` / `ArrowRight` handlers on the 3D Certificate Carousel to only trigger when the carousel container is focused or actively within the viewport (`IntersectionObserver`). The project screen carousels handle arrow keys on their own element and mark them handled, so the two never fire together.
- **Dialogs:** Project modals and the screenshot zoom are built on `primitives/ModalDialog.tsx` (native `<dialog>` with `showModal()`, scroll lock, Escape and scrim click, focus returned to the trigger). Their panels use `overflow-clip`, never `overflow-hidden`, so focus can never scroll the header away.
- **GitHub Pages Static Safety:** Never rely on runtime `process.env` secrets, server actions, or dynamic filesystem reads inside React components. Resolve all `public/` paths using `import.meta.env.BASE_URL` (Vite) or configured `basePath` (Next.js static export).