import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Maximize2, Pause, Play } from 'lucide-react'
import { useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'

import { site } from '../data/site.ts'
import type { ProjectScreen } from '../data/types.ts'
import { useInViewport } from '../hooks/useInViewport.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { useRing } from '../hooks/useRing.ts'
import { useRingAutoplay } from '../hooks/useRingAutoplay.ts'
import { asset } from '../lib/asset.ts'
import { cn } from '../lib/cn.ts'
import { ring as ringSpec } from '../styles/tokens.ts'
import { ScreenshotLightbox } from './ScreenshotLightbox.tsx'
import { CircularGallery } from './primitives/CircularGallery.tsx'

interface ProjectUiCarouselProps {
  screens: readonly ProjectScreen[]
  /** Names the carousel for assistive technology. */
  projectTitle: string
  /** Holds the slideshow, for example while the project's detail modal is open. */
  suspended: boolean
}

const copy = site.projects.carousel

const roundButton =
  'grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-[background-color,scale] duration-150 ease-editorial hover:bg-well active:scale-[0.97]'

/**
 * Real screens of one project on a 3D ring, each in a small window frame.
 * The ring turns to the next screen every few seconds and holds whenever
 * the visitor is doing something with it: hovering, tabbing through it,
 * dragging, zooming in, or reading the detail modal. It also holds while
 * off screen.
 *
 * The timer is one motion value, written from the animation frame and bound
 * straight to the progress bar, so a tick never re-renders React.
 */
export function ProjectUiCarousel({ screens, projectTitle, suspended }: ProjectUiCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPreference()
  const inView = useInViewport(rootRef, 0.5)
  const ring = useRing(screens.length, reduced)

  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [dragging, setDragging] = useState(false)
  // The screen open in the zoom view, or null. Kept apart from the ring so
  // the view changes at once while the ring turns behind it.
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const zoomOpen = zoomIndex !== null

  const count = screens.length
  const canRotate = count > 1
  const canAutoplay = canRotate && !reduced
  const playing =
    canAutoplay && inView && !userPaused && !hovered && !keyboardFocus && !dragging && !zoomOpen && !suspended
  const progress = useRingAutoplay(ring, playing)

  if (count === 0) return null

  const screen = screens[ring.active]
  // Every screen is cut to the same card size; the first one sets the ratio.
  const ratio = screens[0].card.height / screens[0].card.width

  // Arrow keys are handled here, on the carousel that holds focus, and marked
  // as handled so the certificate carousel further down ignores them.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canRotate || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      ring.step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      ring.step(1)
    }
  }

  // Only keyboard focus holds the slideshow. A mouse click on a control would
  // otherwise leave it stopped until the visitor clicked somewhere else.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setKeyboardFocus(true)
  }
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false)
  }

  return (
    <>
      <div
        ref={rootRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${projectTitle} ${copy.regionLabel}`}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        <CircularGallery
          items={screens}
          getKey={(candidate) => candidate.id}
          ring={ring}
          cardHeight={(width) => width * ratio + ringSpec.screenChrome}
          maxCardWidth={ringSpec.maxCardWidth.screens}
          onOpen={setZoomIndex}
          onDraggingChange={setDragging}
          renderCard={(candidate, { front, onClick }) => (
            <button
              type="button"
              onClick={onClick}
              aria-haspopup={front ? 'dialog' : undefined}
              className={cn(
                'flex size-full flex-col overflow-hidden rounded-xl border border-hairline bg-surface text-left shadow-window',
                front ? 'cursor-zoom-in' : 'cursor-pointer',
              )}
            >
              <span className="sr-only">
                {front ? copy.zoom : copy.bringToFront}: {candidate.title}.
              </span>
              {/* Window chrome: three quiet dots and the name of the screen. */}
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center gap-3 border-b border-hairline bg-well px-3.5"
                style={{ height: ringSpec.screenChrome }}
              >
                <span className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-hairline-strong" />
                  <span className="size-2 rounded-full bg-hairline-strong" />
                  <span className="size-2 rounded-full bg-hairline-strong" />
                </span>
                <span className="min-w-0 truncate text-[12px] font-medium text-ink-2">{candidate.title}</span>
              </span>
              <img
                src={asset(candidate.card.src)}
                width={candidate.card.width}
                height={candidate.card.height}
                alt={candidate.card.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="min-h-0 w-full flex-1 select-none bg-well object-cover object-top"
              />
            </button>
          )}
        />

        <p
          aria-live={playing ? 'off' : 'polite'}
          className="mx-auto mt-3 min-h-11 max-w-2xl text-center text-small text-ink-2"
        >
          {screen.caption}
        </p>

        {canRotate ? (
          <div className="mx-auto mt-2 flex max-w-2xl items-center justify-between gap-3">
            <ol className="-ml-1 flex items-center">
              {screens.map((candidate, index) => {
                const active = index === ring.active
                return (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => ring.goTo(index)}
                      aria-label={`${copy.goTo} ${index + 1}: ${candidate.title}`}
                      aria-current={active ? 'true' : undefined}
                      className="group grid h-11 place-items-center px-1"
                    >
                      <span
                        className={cn(
                          'relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-editorial',
                          active ? 'w-9 bg-ink/20' : 'w-2 bg-ink-3 group-hover:bg-ink-2',
                        )}
                      >
                        {active ? (
                          <motion.span
                            className="absolute inset-0 origin-left rounded-full bg-ink"
                            style={canAutoplay ? { scaleX: progress } : undefined}
                          />
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomIndex(ring.active)}
                aria-label={`${copy.zoom}: ${screen.title}`}
                aria-haspopup="dialog"
                className={roundButton}
              >
                <Maximize2 aria-hidden="true" className="size-4" />
              </button>
              {canAutoplay ? (
                <button
                  type="button"
                  onClick={() => setUserPaused((paused) => !paused)}
                  aria-label={userPaused ? copy.play : copy.pause}
                  className={roundButton}
                >
                  {userPaused ? (
                    <Play aria-hidden="true" className="size-4" />
                  ) : (
                    <Pause aria-hidden="true" className="size-4" />
                  )}
                </button>
              ) : null}
              <button type="button" onClick={() => ring.step(-1)} aria-label={copy.previous} className={roundButton}>
                <ArrowLeft aria-hidden="true" className="size-5" />
              </button>
              <button type="button" onClick={() => ring.step(1)} aria-label={copy.next} className={roundButton}>
                <ArrowRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* A sibling, not a child: events inside the dialog must not reach the carousel's own handlers. */}
      <ScreenshotLightbox
        screens={screens}
        index={zoomIndex}
        onIndexChange={(index) => {
          setZoomIndex(index)
          ring.goTo(index)
        }}
        onClose={() => setZoomIndex(null)}
      />
    </>
  )
}
