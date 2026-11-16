import { MotionConfig } from 'framer-motion'

import { CertificateCarousel } from './components/CertificateCarousel.tsx'
import { Footer } from './components/Footer.tsx'
import { Hero } from './components/Hero.tsx'
import { Navbar } from './components/Navbar.tsx'
import { ProjectsSection } from './components/ProjectsSection.tsx'
import { site } from './data/site.ts'
import { forcedReducedMotion } from './lib/motion-preference.ts'

/**
 * Root. MotionConfig reducedMotion="user" makes every Framer Motion
 * animation respect the visitor's prefers-reduced-motion setting.
 */
export default function App() {
  return (
    <MotionConfig reducedMotion={forcedReducedMotion ? 'always' : 'user'}>
      <a
        href="#main"
        className="sr-only rounded-full bg-ink px-5 py-3 text-small font-semibold text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-skip)"
      >
        {site.nav.skipToContent}
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <ProjectsSection />
        <CertificateCarousel />
      </main>
      <Footer />
    </MotionConfig>
  )
}
