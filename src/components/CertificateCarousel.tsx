import { motion, type PanInfo } from 'framer-motion'
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react'
import { useCallback, useRef, useState, type MouseEvent } from 'react'

import { certificates } from '../data/certificates.ts'
import { site } from '../data/site.ts'
import type { CertificateItem } from '../data/types.ts'
import { useCoarsePointer } from '../hooks/useCoarsePointer.ts'
import { useInViewport } from '../hooks/useInViewport.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { usePointerTilt } from '../hooks/usePointerTilt.ts'
import { useScopedArrowKeys } from '../hooks/useScopedArrowKeys.ts'
import { asset } from '../lib/asset.ts'
import { clamp } from '../lib/clamp.ts'
import { cn } from '../lib/cn.ts'
import { coverflow, coverflowPose, perspective, tilt } from '../styles/tokens.ts'
import { CertificateLightbox } from './CertificateLightbox.tsx'
import { Container } from './primitives/Container.tsx'
import { SectionHeading } from './primitives/SectionHeading.tsx'

const copy = site.certifications

/**
 * Certifications as a 3D perspective coverflow. The centre card opens the
 * lightbox, its neighbours come to the centre when clicked, the rest wait
 * out of sight.
 *
 * Structure: a static stage (the specified classes and perspective) holds a
 * draggable track. Drag lives on the track and not on the cards, because a
 * card's x is animated in percent and a drag would write pixels to the same
 * value. The track repeats the perspective and stays flat, so zIndex still
 * decides which card is in front.
 */
export function CertificateCarousel() {
  const stageRef = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [focusWithin, setFocusWithin] = useState(false)

  const inView = useInViewport(stageRef, 0.5)
  const lastIndex = certificates.length - 1
  const active = certificates[activeIndex]

  const goTo = useCallback((index: number) => setActiveIndex(clamp(index, 0, lastIndex)), [lastIndex])
  const goPrevious = useCallback(() => setActiveIndex((index) => Math.max(0, index - 1)), [])
  const goNext = useCallback(() => setActiveIndex((index) => Math.min(lastIndex, index + 1)), [lastIndex])

  // Arrow keys belong to the carousel only while it is on screen or holds
  // focus, and never while the lightbox is open.
  useScopedArrowKeys({
    enabled: (inView || focusWithin) && lightboxIndex === null,
    onPrevious: goPrevious,
    onNext: goNext,
  })

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x < -coverflow.dragThreshold) goNext()
    else if (info.offset.x > coverflow.dragThreshold) goPrevious()
    // The click that ends a drag is dispatched after this handler.
    window.setTimeout(() => {
      dragged.current = false
    }, 0)
  }

  const onCardClick = (event: MouseEvent, index: number) => {
    // A keyboard activation has detail 0 and is never the tail of a drag.
    if (dragged.current && event.detail !== 0) return
    if (index === activeIndex) setLightboxIndex(index)
    else goTo(index)
  }

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

        <div role="group" aria-roledescription="carousel" aria-label={copy.regionLabel} className="mt-10">
          <p className="meta-tag text-center text-ink-2">{copy.hint}</p>

          <div
            ref={stageRef}
            className="relative flex h-[360px] w-full items-center justify-center overflow-x-clip sm:h-[430px]"
            style={{ perspective: perspective.coverflow }}
          >
            <motion.div
              className="flex size-full cursor-grab items-center justify-center active:cursor-grabbing"
              style={{ perspective: perspective.coverflow }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragStart={() => {
                dragged.current = true
              }}
              onDragEnd={onDragEnd}
            >
              {certificates.map((certificate, index) => (
                <CoverflowCard
                  key={certificate.id}
                  certificate={certificate}
                  offset={index - activeIndex}
                  onClick={(event) => onCardClick(event, index)}
                />
              ))}
            </motion.div>
          </div>

          <div className="mx-auto mt-2 flex max-w-2xl items-center justify-between gap-3 sm:gap-6">
            <button
              type="button"
              onClick={goPrevious}
              disabled={activeIndex === 0}
              aria-label={copy.previous}
              className="grid size-12 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-colors duration-200 ease-editorial hover:bg-well disabled:text-ink-3 disabled:hover:bg-surface"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
            </button>

            <div aria-live="polite" className="min-w-0 text-center">
              <p className="font-display text-lede font-medium leading-snug text-ink">{active.title}</p>
              <p className="mt-0.5 text-small text-ink-2">
                {active.issuer} · {active.issued.label}
              </p>
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === lastIndex}
              aria-label={copy.next}
              className="grid size-12 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-colors duration-200 ease-editorial hover:bg-well disabled:text-ink-3 disabled:hover:bg-surface"
            >
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-4">
            <ol className="flex items-center">
              {certificates.map((certificate, index) => (
                <li key={certificate.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`${copy.goTo} ${index + 1}: ${certificate.title}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    className="group grid size-11 place-items-center"
                  >
                    <span
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300 ease-editorial',
                        index === activeIndex ? 'w-6 bg-ink' : 'w-1.5 bg-ink-3 group-hover:bg-ink-2',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
            <p className="meta-tag text-ink-2">
              {activeIndex + 1} {copy.counterSeparator} {certificates.length}
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setLightboxIndex(activeIndex)}
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

interface CoverflowCardProps {
  certificate: CertificateItem
  /** index minus activeIndex. */
  offset: number
  onClick: (event: MouseEvent) => void
}

function CoverflowCard({ certificate, offset, onClick }: CoverflowCardProps) {
  const { reduced } = useMotionPreference()
  const coarsePointer = useCoarsePointer()
  const isCentre = offset === 0
  const parked = Math.abs(offset) >= 2
  const pose = coverflowPose(offset)

  // Only the centre card tilts, on a fine pointer. The listeners sit on the
  // posed wrapper, which holds still once the spring settles; the rotation
  // goes on the inner element with its own perspective, because the wrapper
  // passes through opacity 0.72 and would flatten a shared 3D context.
  const pointerTilt = usePointerTilt({
    max: tilt.maxCertificate,
    disabled: !isCentre || reduced || coarsePointer,
  })

  return (
    <motion.div
      className="absolute aspect-[1.414/1] w-[280px] sm:w-[380px] md:w-[440px]"
      initial={false}
      animate={{ x: pose.x, scale: pose.scale, rotateY: pose.rotateY, zIndex: pose.zIndex, opacity: pose.opacity }}
      transition={coverflow.spring}
      style={{ pointerEvents: parked ? 'none' : 'auto' }}
      inert={parked}
      onPointerMove={pointerTilt.handlers.onPointerMove}
      onPointerLeave={pointerTilt.handlers.onPointerLeave}
    >
      <motion.button
        type="button"
        onClick={onClick}
        tabIndex={parked ? -1 : 0}
        className="block size-full overflow-hidden rounded-xl border border-hairline bg-white shadow-xl"
        style={{
          rotateX: pointerTilt.rotateX,
          rotateY: pointerTilt.rotateY,
          transformPerspective: perspective.coverflow,
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
        <span className="sr-only">{isCentre ? copy.inspect : copy.bringToCentre}</span>
      </motion.button>
    </motion.div>
  )
}
