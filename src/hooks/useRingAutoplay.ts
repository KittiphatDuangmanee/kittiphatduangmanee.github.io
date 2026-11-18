import { useAnimationFrame, useMotionValue, type MotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'

import { carousel } from '../styles/tokens.ts'
import type { Ring } from './useRing.ts'

/**
 * Turns the ring one card every few seconds while `playing`. Returns the
 * timer as a motion value from 0 to 1, for the active pill to show, so a
 * tick never re-renders React. Any change of front card, by hand or by the
 * timer, starts the count again.
 */
export function useRingAutoplay(ring: Ring, playing: boolean): MotionValue<number> {
  const progress = useMotionValue(0)
  const elapsed = useRef(0)
  // Set once the timer has turned the ring, until the next card reaches the front.
  const waiting = useRef(false)
  const { active, step } = ring

  useEffect(() => {
    waiting.current = false
    elapsed.current = 0
    progress.set(0)
  }, [active, progress])

  useAnimationFrame((_time, delta) => {
    if (!playing || waiting.current) return
    elapsed.current += Math.min(delta, carousel.maxFrameMs)
    const ratio = elapsed.current / (carousel.intervalSeconds * 1000)
    if (ratio >= 1) {
      waiting.current = true
      progress.set(1)
      step(1)
    } else {
      progress.set(ratio)
    }
  })

  return progress
}
