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
3. **Typed Data Layer (`src/data/*.ts`):** Define TypeScript interfaces and populate `profile.ts`, `projects.ts`, and `certificates.ts` before building components.
4. **UI & Framer Motion Implementation:** Build modular components consuming `src/data/*.ts` with the hero (interactive embossed dot background, icon Core Stack), Wide 3D Monograph cards, scroll-driven reveals/parallax, and the 3D Certificate Coverflow Carousel.
5. **Verification:** Run typecheck (`tsc --noEmit`) and production build (`npm run build`), confirming zero errors and verifying that every asset path in `src/data/*.ts` exists in `public/`.

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

### Project Monographs (`src/data/projects.ts`)
Render each project as a **Wide 3D Monograph (`aspect-[16/10]`)** with left-edge spine detailing:
- **VOL. I — Solar String Monitoring Alarm System** *(SCG Cleanergy Internship)*
  - **Stack:** FastAPI, React, TimescaleDB, Redis, Anomaly Detection, LINE/Email Alerting.
  - **Visuals (NDA-Safe):** Use an **interactive SVG system architecture & telemetry flow diagram** with synthetic/anonymized metrics. Never use proprietary screenshots, internal hostnames, or raw production data.
- **VOL. II — OrderDi (Restaurant Order Management Platform)**
  - **Stack:** Hono 4, TypeScript, Tailwind CSS, Drizzle ORM, CockroachDB / PostgreSQL, Cloudflare Workers.
  - **Visuals:** Clean product UI showcase (menu management, live bill tracking, sales analytics).
- **VOL. III — Salon Booking Microservices Platform**
  - **Stack:** Java Spring Boot, Spring Cloud Gateway, Eureka Discovery, PostgreSQL, MySQL, Redis, RabbitMQ, Stripe/Razorpay, React.
  - **Visuals:** Service-mesh / event-driven booking & payment flow diagram or dashboard preview.
- **VOL. IV — RealWorld_XP (Gamified Activity & Lifestyle Tracker)**
  - **Stack:** Python, FastAPI, TabNet Deep Learning, Angular.
  - **Visuals:** XP progression, streak mechanics, and lifestyle classification UI.

### Certifications (`src/data/certificates.ts`)
Include all **4** certificates in the 3D Coverflow Carousel:
1. **AWS Certified Cloud Practitioner**
2. **depa Software Security Certification**
3. **ARIT Software Security Certification**
4. **LINK Certified Cabling Engineer (LCCE)**

---

## 3. Code & Motion Guardrails (Avoid These Pitfalls)
- **No Portrait Book Ratios:** Do NOT style project cards as narrow portrait books (`2:3`). Use landscape monograph proportions (`aspect-[16/10]` on desktop) so architecture diagrams and UI previews remain legible.
- **No Unapproved Libraries:** Use **Framer Motion** exclusively for 3D tilt (`preserve-3d`, `useMotionValue`, `useSpring`), scroll parallax (`useScroll`, `useTransform`), and carousel transitions. Do not install Three.js, GSAP, or heavy carousel dependencies.
- **Touch & Reduced Motion Safety:**
  - Disable pointer-driven 3D tilt on `(pointer: coarse)` touch devices so cards never get stuck tilted during mobile scrolling.
  - Wrap the app in `<MotionConfig reducedMotion="user">`.
- **No Template Clutter in the Hero:** No status or availability pill, no `FIG.` / `Fig.` figure labels anywhere in `src/`, and no registration marks or crosshairs around the portrait. The role line is sans-serif (Plus Jakarta Sans), never oversized italic serif.
- **Interactive Embossed Background:** `src/components/InteractiveBackground.tsx` tracks the pointer with `useMotionValue` + `useSpring` and reveals the raised dots through a `useMotionTemplate` mask, so mouse movement never re-renders React. Do not mount the relief layer or attach pointer listeners when `(pointer: coarse)` matches or reduced motion is set; the static dot grid stays.
- **Core Stack Icons:** Every Core Stack item needs a mark in `src/components/primitives/TechIcon.tsx` (typed by `TechId`). Do not add an icon library for them.
- **Colours Through Tokens:** Never write a raw hex, `rgb()` or shadow colour in a component. Add it to `src/styles/tokens.css` and bind to the token; `npm run gate:tokens` enforces this, and `npm run check` runs every gate.
- **Keyboard Event Isolation:** Scope `ArrowLeft` / `ArrowRight` handlers on the 3D Certificate Carousel to only trigger when the carousel container is focused or actively within the viewport (`IntersectionObserver`), preventing conflicts with project volume navigation.
- **GitHub Pages Static Safety:** Never rely on runtime `process.env` secrets, server actions, or dynamic filesystem reads inside React components. Resolve all `public/` paths using `import.meta.env.BASE_URL` (Vite) or configured `basePath` (Next.js static export).