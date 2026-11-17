import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react'

import { profile } from '../data/profile.ts'
import { site } from '../data/site.ts'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts'
import { cn } from '../lib/cn.ts'
import { BrandIcon, type Brand } from './primitives/BrandIcon.tsx'
import { Container } from './primitives/Container.tsx'

const copy = site.footer
const brands: readonly Brand[] = ['github', 'linkedin', 'leetcode']
const profileLinks = profile.links.flatMap((link) => {
  const brand = brands.find((candidate) => candidate === link.kind)
  return brand ? [{ ...link, brand }] : []
})
// Read once when the bundle loads, so rendering stays pure.
const currentYear = new Date().getFullYear()

/** Contact and colophon: one click email copy, external profiles, build note. */
export function Footer() {
  const { status, copy: copyToClipboard } = useCopyToClipboard()
  const copied = status === 'copied'
  const statusMessage = copied ? copy.copied : status === 'failed' ? copy.copyFailed : ''

  return (
    <footer id={copy.id} aria-labelledby="contact-heading" className="border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <div className="min-w-0 lg:col-span-7">
          <p className="meta-tag flex items-center gap-3 text-ink-2">
            <span aria-hidden="true" className="h-px w-10 bg-ink-2/60" />
            {copy.eyebrow}
          </p>
          <h2 id="contact-heading" className="mt-4 text-ink">
            {copy.heading}
          </h2>
          <p className="mt-4 max-w-measure text-lede text-ink-2">{copy.lede}</p>

          <p className="mt-8 break-all font-display text-h3 text-ink">{profile.email}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => copyToClipboard(profile.email)}
              className={cn(
                'inline-flex min-h-12 min-w-40 items-center justify-center gap-2.5 rounded-full px-6 text-small font-semibold transition-colors duration-200 ease-editorial',
                copied ? 'bg-well text-ink' : 'bg-ink text-canvas hover:bg-ink-2',
              )}
            >
              {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
              {copied ? copy.copied : copy.copy}
            </button>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-hairline bg-surface px-6 text-small font-semibold text-ink transition-colors duration-200 ease-editorial hover:bg-well"
            >
              <Mail aria-hidden="true" className="size-4" />
              {copy.sendMail}
            </a>
            <span role="status" aria-live="polite" className={cn('text-small text-ink-2', copied && 'sr-only')}>
              {statusMessage}
            </span>
          </div>
        </div>

        <div className="grid content-start gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:pt-10">
          <div>
            <h3 className="meta-tag border-b border-hairline pb-2.5 font-mono text-ink">{copy.profilesLabel}</h3>
            <ul className="mt-3 grid gap-1">
              {profileLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex min-h-11 items-center gap-3 font-medium text-ink"
                  >
                    <BrandIcon brand={link.brand} className="size-5" />
                    <span className="underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-200 ease-editorial group-hover:decoration-ink">
                      {link.label}
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4 text-ink-2" />
                    <span className="sr-only">({site.projects.opensInNewTab})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="meta-tag border-b border-hairline pb-2.5 font-mono text-ink">{copy.colophonLabel}</h3>
            <ul className="mt-3 grid gap-1.5 text-small text-ink-2">
              {copy.colophon.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-hairline">
        <Container className="meta-tag flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-ink-2">
          <p>
            © {currentYear} {copy.copyrightHolder}
          </p>
          <p>{profile.location.place}</p>
        </Container>
      </div>
    </footer>
  )
}
