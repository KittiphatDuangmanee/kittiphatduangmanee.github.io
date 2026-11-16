import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useCallback, useEffect, type PointerEvent } from 'react'

import { clamp } from '../lib/clamp.ts'
import { tilt } from '../styles/tokens.ts'

interface PointerTiltOptions {
  /** Largest rotation on either axis, in degrees. */
  max: number
  /** Touch devices and reduced motion: stay flat. */
  disabled: boolean
}

export interface PointerTilt {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  /** Pointer position in pixels, local to the element with the handlers. */
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  /** 0 when the pointer is away, 1 while it is over the element. */
  presence: MotionValue<number>
  handlers: {
    onPointerMove: (event: PointerEvent<HTMLElement>) => void
    onPointerLeave: () => void
  }
}

/**
 * Pointer driven 3D tilt. Attach the handlers to the static perspective
 * wrapper, not to the surface that rotates, so measurements never chase the
 * transform. Rotation is spring smoothed and clamped to [-max, max] degrees.
 */
export function usePointerTilt({ max, disabled }: PointerTiltOptions): PointerTilt {
  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const presenceTarget = useMotionValue(0)

  const rotateX = useSpring(targetX, tilt.spring)
  const rotateY = useSpring(targetY, tilt.spring)
  const presence = useSpring(presenceTarget, tilt.spring)

  const settle = useCallback(() => {
    targetX.set(0)
    targetY.set(0)
    presenceTarget.set(0)
  }, [targetX, targetY, presenceTarget])

  useEffect(() => {
    if (!disabled) return
    settle()
    // Jump straight to flat so nothing lingers mid tilt when a device
    // switches to touch or the motion preference changes.
    rotateX.jump(0)
    rotateY.jump(0)
    presence.jump(0)
  }, [disabled, settle, rotateX, rotateY, presence])

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      // The (pointer: coarse) query only describes the primary pointer, so a
      // touch on a hybrid laptop is filtered here as well.
      if (disabled || event.pointerType !== 'mouse') return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return
      const localX = event.clientX - bounds.left
      const localY = event.clientY - bounds.top
      const fromCentreX = (localX / bounds.width - 0.5) * 2
      const fromCentreY = (localY / bounds.height - 0.5) * 2
      targetY.set(clamp(fromCentreX * max, -max, max))
      targetX.set(clamp(-fromCentreY * max, -max, max))
      pointerX.set(localX)
      pointerY.set(localY)
      presenceTarget.set(1)
    },
    [disabled, max, targetX, targetY, pointerX, pointerY, presenceTarget],
  )

  return { rotateX, rotateY, pointerX, pointerY, presence, handlers: { onPointerMove, onPointerLeave: settle } }
}
