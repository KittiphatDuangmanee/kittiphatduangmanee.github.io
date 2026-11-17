import { AnimatePresence, motion, useAnimationFrame, useMotionValue, type PanInfo, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, Maximize2, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'

import { site } from '../data/site.ts'
import type { ProjectScreen } from '../data/types.ts'
import { useInViewport } from '../hooks/useInViewport.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { asset } from '../lib/asset.ts'
import { cn } from '../lib/cn.ts'
import { carousel } from '../styles/tokens.ts'
import { ScreenshotLightbox } from './ScreenshotLightbox.tsx'

interface ProjectUiCarouselProps {
  screens: readonly ProjectScreen[]
  /** Names the carousel for assistive technology. */
  projectTitle: string
  /** Holds the slideshow, for example while the project's detail modal is open. */
  suspended: boolean
}

const copy = site.projects.carousel

const slideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * carousel.slideOffset }),
  centre: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -carousel.slideOffset }),
}

// Reduced motion: the screens cross-fade in place.
const fadeVariants: Variants = {
  enter: { opacity: 0 },
  centre: { opacity: 1 },
  exit: { opacity: 0 },
}

const roundButton =
  'grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-[background-color,scale] duration-150 ease-editorial hover:bg-well active:scale-[0.97]'

/**
 * Real screens of one project in a window frame. The slideshow advances on
 * its own every few seconds and holds whenever the visitor is doing
 * something with it: hovering, tabbing through it, dragging, zooming in, or
 * reading the detail modal. It also holds while off screen.
 *
 * The timer is one motion value, written from the animation frame and bound
 * straight to the progress bar, so a tick never re-renders React.
 */
export function ProjectUiCarousel({ screens, projectTitle, suspended }: ProjectUiCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)
  const elapsed = useRef(0)
  const progress = useMotionValue(0)
  const { reduced } = useMotionPreference()
  const inView = useInViewport(rootRef, 0.5)

  const [slide, setSlide] = useState({ index: 0, direction: 1 })
  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)

  const count = screens.length
  const canRotate = count > 1
  const canAutoplay = canRotate && !reduced
  const playing =
    canAutoplay && inView && !userPaused && !hovered && !keyboardFocus && !dragging && !zoomOpen && !suspended

  const goTo = useCallback(
    (index: number, direction: number) => {
      elapsed.current = 0
      progress.set(0)
      setSlide({ index: (index + count) % count, direction })
    },
    [count, progress],
  )

  const step = useCallback(
    (direction: number) => {
      elapsed.current = 0
      progress.set(0)
      setSlide((current) => ({ index: (current.index + direction + count) % count, direction }))
    },
    [count, progress],
  )

  useAnimationFrame((_time, delta) => {
    if (!playing) return
    elapsed.current += Math.min(delta, carousel.maxFrameMs)
    const ratio = elapsed.current / (carousel.intervalSeconds * 1000)
    if (ratio >= 1) step(1)
    else progress.set(ratio)
  })

  // Fetch the next screen ahead of time, so the slide never fades in blank.
  useEffect(() => {
    if (!inView || !canRotate) return
    const next = screens[(slide.index + 1) % count]
    const image = new Image()
    image.src = asset(next.card.src)
  }, [inView, canRotate, screens, slide.index, count])

  if (count === 0) return null

  const screen = screens[slide.index]

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    setDragging(false)
    if (info.offset.x < -carousel.dragThreshold || info.velocity.x < -carousel.flickVelocity) step(1)
    else if (info.offset.x > carousel.dragThreshold || info.velocity.x > carousel.flickVelocity) step(-1)
    // The click that ends a drag is dispatched after this handler.
    window.setTimeout(() => {
      dragged.current = false
    }, 0)
  }

  const onSlideClick = (event: MouseEvent) => {
    if (dragged.current && event.detail !== 0) return
    setZoomOpen(true)
  }

  // Arrow keys are handled here, on the carousel that holds focus, and marked
  // as handled so the certificate carousel further down ignores them.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canRotate || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
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
        <figure>
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-window">
            {/* Window chrome: three quiet dots, the name of the screen, and the zoom control. */}
            <div className="grid h-11 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-hairline bg-well pl-4">
              <span aria-hidden="true" className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-hairline-strong" />
                <span className="size-2.5 rounded-full bg-hairline-strong" />
                <span className="size-2.5 rounded-full bg-hairline-strong" />
              </span>
              <p
                aria-live={playing ? 'off' : 'polite'}
                className="max-w-[46vw] truncate text-center text-[13px] font-medium text-ink-2 sm:max-w-xs"
              >
                {screen.title}
              </p>
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                aria-label={`${copy.zoom}: ${screen.title}`}
                aria-haspopup="dialog"
                className="grid size-11 place-items-center justify-self-end text-ink-2 transition-[color,scale] duration-150 ease-editorial hover:text-ink active:scale-[0.94]"
              >
                <Maximize2 aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div
              className="relative overflow-hidden bg-well"
              style={{ aspectRatio: `${screen.card.width} / ${screen.card.height}` }}
            >
              <AnimatePresence initial={false} custom={slide.direction}>
                <motion.div
                  key={screen.id}
                  custom={slide.direction}
                  variants={reduced ? fadeVariants : slideVariants}
                  initial="enter"
                  animate="centre"
                  exit="exit"
                  transition={{ x: carousel.slideSpring, opacity: carousel.fade }}
                  drag={canRotate && !reduced ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={carousel.dragElastic}
                  onDragStart={() => {
                    dragged.current = true
                    setDragging(true)
                  }}
                  onDragEnd={onDragEnd}
                  onClick={onSlideClick}
                  className="absolute inset-0 cursor-zoom-in touch-pan-y"
                >
                  <img
                    src={asset(screen.card.src)}
                    width={screen.card.width}
                    height={screen.card.height}
                    alt={screen.card.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="size-full select-none object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <figcaption className="mt-3.5 min-h-11 text-small text-ink-2">{screen.caption}</figcaption>
        </figure>

        {canRotate ? (
          <div className="mt-1 flex items-center justify-between gap-3">
            <ol className="-ml-1 flex items-center">
              {screens.map((candidate, index) => {
                const active = index === slide.index
                return (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => goTo(index, index >= slide.index ? 1 : -1)}
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
              <button type="button" onClick={() => step(-1)} aria-label={copy.previous} className={roundButton}>
                <ArrowLeft aria-hidden="true" className="size-5" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label={copy.next} className={roundButton}>
                <ArrowRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* A sibling, not a child: events inside the dialog must not reach the carousel's own handlers. */}
      <ScreenshotLightbox
        screens={screens}
        index={zoomOpen ? slide.index : null}
        onIndexChange={(index) => goTo(index, index >= slide.index ? 1 : -1)}
        onClose={() => setZoomOpen(false)}
      />
    </>
  )
}
