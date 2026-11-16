import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

import { useCoarsePointer } from '../hooks/useCoarsePointer.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { emboss } from '../styles/tokens.ts'

/**
 * Dot matrix behind the hero. A static grid is printed on the canvas, and
 * under the pointer a second, aligned grid of larger ink dots rises through a
 * soft mask with a warm highlight, so the paper reads as embossed where the
 * cursor is. Place it as the first child of a `relative` section: it fills
 * that section and listens for the pointer on it.
 *
 * Pointer position lives in motion values, so moving the mouse never
 * re-renders React. On touch devices and with reduced motion the relief is
 * not mounted and no listener is attached: only the static grid remains.
 */
export function InteractiveBackground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const coarsePointer = useCoarsePointer()
  const { reduced } = useMotionPreference()
  const interactive = !coarsePointer && !reduced

  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)
  const presenceTarget = useMotionValue(0)

  const x = useSpring(targetX, emboss.spring)
  const y = useSpring(targetY, emboss.spring)
  const presence = useSpring(presenceTarget, emboss.spring)

  useEffect(() => {
    const host = rootRef.current?.parentElement
    if (!interactive || !host) return

    let tracking = false

    const onPointerMove = (event: PointerEvent) => {
      // (pointer: coarse) only describes the primary pointer, so a touch on a
      // hybrid laptop is filtered here as well.
      if (event.pointerType !== 'mouse') return
      const bounds = host.getBoundingClientRect()
      const localX = event.clientX - bounds.left
      const localY = event.clientY - bounds.top
      targetX.set(localX)
      targetY.set(localY)
      if (!tracking) {
        // Arrive where the pointer entered instead of sliding in from the
        // last place it left.
        x.jump(localX)
        y.jump(localY)
        tracking = true
      }
      presenceTarget.set(1)
    }

    const onPointerLeave = () => {
      tracking = false
      presenceTarget.set(0)
    }

    host.addEventListener('pointermove', onPointerMove, { passive: true })
    host.addEventListener('pointerleave', onPointerLeave)
    return () => {
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      presenceTarget.set(0)
      presence.jump(0)
    }
  }, [interactive, targetX, targetY, presenceTarget, x, y, presence])

  const highlight = useMotionTemplate`radial-gradient(${emboss.highlightRadius}px circle at ${x}px ${y}px, var(--emboss-highlight), var(--emboss-shade) 45%, transparent 75%)`
  const reliefMask = useMotionTemplate`radial-gradient(${emboss.maskRadius}px circle at ${x}px ${y}px, black 0%, var(--emboss-mask-mid) 45%, transparent 80%)`

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden contain-strict">
      <div className="dot-grid absolute inset-0" />
      {interactive ? (
        <motion.div className="absolute inset-0" style={{ opacity: presence }}>
          <motion.div className="absolute inset-0" style={{ backgroundImage: highlight }} />
          <motion.div
            className="dot-grid-raised absolute inset-0"
            style={{ opacity: emboss.raisedOpacity, maskImage: reliefMask, WebkitMaskImage: reliefMask }}
          />
        </motion.div>
      ) : null}
      {/* The grid dissolves into the canvas before the next section begins. */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-canvas" />
    </div>
  )
}
