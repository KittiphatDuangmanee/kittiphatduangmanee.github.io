import { profile } from '../data/profile.ts'
import { site } from '../data/site.ts'
import { BrandIcon } from './primitives/BrandIcon.tsx'
import { Container } from './primitives/Container.tsx'

const github = profile.links.find((link) => link.kind === 'github')

/** Sticky top bar: monogram and name on the left, anchors and GitHub on the right. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-(--z-nav) h-16 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <Container className="flex h-full items-center justify-between gap-2 sm:gap-3">
        <a href="#top" aria-label={site.nav.homeLabel} className="flex min-h-11 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-[4px] bg-ink font-display text-small font-semibold tracking-wide text-canvas"
          >
            {profile.name.monogram}
          </span>
          <span className="hidden font-display text-lede font-medium text-ink md:block">{profile.name.full}</span>
        </a>

        <nav aria-label={site.nav.ariaLabel}>
          <ul className="flex items-center sm:gap-1">
            {site.nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex min-h-11 items-center rounded-full px-1.5 text-[0.8125rem] font-medium text-ink-2 transition-colors duration-200 ease-monograph hover:text-ink sm:px-3 sm:text-small"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {github ? (
              <li className="hidden min-[350px]:block">
                <a
                  href={github.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={site.nav.githubLabel}
                  className="ml-1 grid size-11 place-items-center rounded-full text-ink transition-colors duration-200 ease-monograph hover:bg-well"
                >
                  <BrandIcon brand="github" className="size-5" />
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </Container>
    </header>
  )
}
