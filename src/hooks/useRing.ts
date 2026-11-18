import { animate, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls, type MotionValue } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'

import { clamp } from '../lib/clamp.ts'
import { ringIndex, wrap } from '../lib/wrap.ts'
import { ring as ringSpec } from '../styles/tokens.ts'

export interface Ring {
  count: number
  /** Where the ring stands, in cards. Whole numbers face a card to the front; it never wraps. */
  position: MotionValue<number>
  /** Stage opacity. It dips and returns when the ring jumps under reduced motion. */
  fade: MotionValue<number>
  /** Index of the card nearest the front. */
  active: number
  reduced: boolean
  step: (direction: number) => void
  goTo: (index: number) => void
  /** Starts a drag: stops the ring where it is and returns that position. */
  grab: () => number
  /** Ends a drag that started at `start`: lands on a card after the release velocity. */
  release: (start: number, offsetPx: number, velocityPx: number, pxPerStep: number) => void
}

/**
 * State of a circular gallery. The ring turns through one motion value, so
 * a frame of motion never re-renders React; only a change of front card
 * does. Under reduced motion the ring jumps to the card and fades back in.
 */
export function useRing(count: number, reduced: boolean): Ring {
  const position = useMotionValue(0)
  const fade = useMotionValue(1)
  const target = useRef(0)
  const turning = useRef<AnimationPlaybackControls | null>(null)
  const fading = useRef<AnimationPlaybackControls | null>(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  useMotionValueEvent(position, 'change', (value) => {
    const index = ringIndex(value, count)
    if (index === activeRef.current) return
    activeRef.current = index
    setActive(index)
  })

  const moveTo = useCallback(
    (next: number, velocity = 0) => {
      turning.current?.stop()
      target.current = next
      if (reduced) {
        if (position.get() === next) return
        position.set(next)
        fading.current?.stop()
        fade.set(0)
        fading.current = animate(fade, 1, ringSpec.reducedFade)
        return
      }
      turning.current = animate(position, next, { ...ringSpec.spring, velocity })
    },
    [position, fade, reduced],
  )

  const step = useCallback((direction: number) => moveTo(target.current + direction), [moveTo])

  const goTo = useCallback(
    (index: number) => {
      const front = ringIndex(target.current, count)
      moveTo(target.current + wrap(index - front, count))
    },
    [count, moveTo],
  )

  const grab = useCallback(() => {
    turning.current?.stop()
    return position.get()
  }, [position])

  const release = useCallback(
    (start: number, offsetPx: number, velocityPx: number, pxPerStep: number) => {
      const from = Math.round(start)
      // Where the finger left the ring, plus at most one card of momentum.
      const dropped = Math.round(position.get())
      let next = reduced
        ? from
        : clamp(Math.round(position.get() - (velocityPx * ringSpec.flickProjection) / pxPerStep), dropped - 1, dropped + 1)
      if (next === from) {
        if (offsetPx < -ringSpec.dragThreshold || velocityPx < -ringSpec.flickVelocity) next = from + 1
        else if (offsetPx > ringSpec.dragThreshold || velocityPx > ringSpec.flickVelocity) next = from - 1
      }
      next = clamp(next, from - (count - 1), from + (count - 1))
      moveTo(next, reduced ? 0 : -velocityPx / pxPerStep)
    },
    [count, moveTo, position, reduced],
  )

  return useMemo(
    () => ({ count, position, fade, active, reduced, step, goTo, grab, release }),
    [count, position, fade, active, reduced, step, goTo, grab, release],
  )
}
