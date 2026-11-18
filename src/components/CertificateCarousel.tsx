import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react'
import { useRef, useState, type MouseEvent } from 'react'

import { certificates } from '../data/certificates.ts'
import { site } from '../data/site.ts'
import type { CertificateItem } from '../data/types.ts'
import { useCoarsePointer } from '../hooks/useCoarsePointer.ts'
import { useInViewport } from '../hooks/useInViewport.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { usePointerTilt } from '../hooks/usePointerTilt.ts'
import { useRing } from '../hooks/useRing.ts'
import { useScopedArrowKeys } from '../hooks/useScopedArrowKeys.ts'
import { asset } from '../lib/asset.ts'
import { cn } from '../lib/cn.ts'
import { ring as ringSpec, tilt } from '../styles/tokens.ts'
import { CertificateLightbox } from './CertificateLightbox.tsx'
import { CircularGallery } from './primitives/CircularGallery.tsx'
import { Container } from './primitives/Container.tsx'
import { SectionHeading } from './primitives/SectionHeading.tsx'

const copy = site.certifications

const roundButton =
  'grid size-12 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-[background-color,scale] duration-150 ease-editorial hover:bg-well active:scale-[0.97]'

/**
 * Certifications on a 3D ring. The front card opens the lightbox, its
 * neighbours turn to the front when clicked, and the ring goes round in
 * both directions. It turns only when the visitor turns it: these are
 * documents to read.
 */
export function CertificateCarousel() {
  const groupRef = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPreference()
  const ring = useRing(certificates.length, reduced)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [focusWithin, setFocusWithin] = useState(false)

  const inView = useInViewport(groupRef, 0.5)
  const active = certificates[ring.active]
  const { step } = ring

  // Arrow keys belong to the carousel only while it is on screen or holds
  // focus, and never while the lightbox is open.
  useScopedArrowKeys({
    enabled: (inView || focusWithin) && lightboxIndex === null,
    onPrevious: () => step(-1),
    onNext: () => step(1),
  })

  return (
    <section
      id={copy.id}
      aria-labelledby="certifications-heading"
      className="border-t border-hairline"
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false)
      }}
    >
      <Container className="py-20 lg:py-28">
        <SectionHeading
          headingId="certifications-heading"
          eyebrow={copy.eyebrow}
          heading={copy.heading}
          lede={copy.lede}
        />

        <div
          ref={groupRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={copy.regionLabel}
          className="mt-10"
        >
          <p className="meta-tag text-center text-ink-2">{copy.hint}</p>

          <CircularGallery
            items={certificates}
            getKey={(certificate) => certificate.id}
            ring={ring}
            cardHeight={(width) => width / ringSpec.certificateRatio}
            maxCardWidth={ringSpec.maxCardWidth.certificates}
            onOpen={setLightboxIndex}
            className="mt-2"
            renderCard={(certificate, { front, onClick }) => (
              <CertificateCard certificate={certificate} front={front} onClick={onClick} />
            )}
          />

          <div className="mx-auto mt-2 flex max-w-2xl items-center justify-between gap-3 sm:gap-6">
            <button type="button" onClick={() => step(-1)} aria-label={copy.previous} className={roundButton}>
              <ArrowLeft aria-hidden="true" className="size-5" />
            </button>

            <div aria-live="polite" className="min-w-0 text-center">
              <p className="font-display text-lede font-medium leading-snug text-ink">{active.title}</p>
              <p className="mt-0.5 text-small text-ink-2">
                {active.issuer} · {active.issued.label}
              </p>
            </div>

            <button type="button" onClick={() => step(1)} aria-label={copy.next} className={roundButton}>
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-4">
            <ol className="flex items-center">
              {certificates.map((certificate, index) => (
                <li key={certificate.id}>
                  <button
                    type="button"
                    onClick={() => ring.goTo(index)}
                    aria-label={`${copy.goTo} ${index + 1}: ${certificate.title}`}
                    aria-current={index === ring.active ? 'true' : undefined}
                    className="group grid size-11 place-items-center"
                  >
                    <span
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300 ease-editorial',
                        index === ring.active ? 'w-6 bg-ink' : 'w-1.5 bg-ink-3 group-hover:bg-ink-2',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
            <p className="meta-tag text-ink-2">
              {ring.active + 1} {copy.counterSeparator} {certificates.length}
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setLightboxIndex(ring.active)}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-ink px-6 text-small font-semibold text-ink transition-colors duration-200 ease-editorial hover:bg-ink hover:text-canvas"
            >
              <Maximize2 aria-hidden="true" className="size-4" />
              {copy.inspect}
            </button>
          </div>
        </div>
      </Container>

      <CertificateLightbox
        certificate={lightboxIndex === null ? null : certificates[lightboxIndex]}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  )
}

interface CertificateCardProps {
  certificate: CertificateItem
  front: boolean
  onClick: (event: MouseEvent) => void
}

function CertificateCard({ certificate, front, onClick }: CertificateCardProps) {
  const { reduced } = useMotionPreference()
  const coarsePointer = useCoarsePointer()

  // Only the front card tilts, on a fine pointer. The listeners sit on the
  // still wrapper and the rotation on the button inside it, with its own
  // perspective, so measurements never chase the transform.
  const pointerTilt = usePointerTilt({
    max: tilt.maxCertificate,
    disabled: !front || reduced || coarsePointer,
  })

  return (
    <div
      className="size-full"
      onPointerMove={pointerTilt.handlers.onPointerMove}
      onPointerLeave={pointerTilt.handlers.onPointerLeave}
    >
      <motion.button
        type="button"
        onClick={onClick}
        aria-haspopup={front ? 'dialog' : undefined}
        className={cn(
          'block size-full overflow-hidden rounded-xl border border-hairline bg-white shadow-xl',
          front ? 'cursor-zoom-in' : 'cursor-pointer',
        )}
        style={{
          rotateX: pointerTilt.rotateX,
          rotateY: pointerTilt.rotateY,
          transformPerspective: tilt.perspective,
        }}
      >
        <img
          src={asset(certificate.preview.thumb.src)}
          width={certificate.preview.thumb.width}
          height={certificate.preview.thumb.height}
          alt={certificate.preview.thumb.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-full select-none object-contain"
        />
        <span className="sr-only">{front ? copy.inspect : copy.bringToFront}</span>
      </motion.button>
    </div>
  )
}
