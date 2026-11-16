// The motion contract. Every number here is copied once from
// design/reference/spec.md, and components import it. No component retypes a
// spec value, so the spec and the code cannot drift apart silently.

/** Pointer tilt: spring smoothing and the clamp, in degrees. */
export const tilt = {
  spring: { stiffness: 260, damping: 24, mass: 0.6 },
  maxMonograph: 7,
  maxCertificate: 6,
} as const

/** Perspective distances in pixels. */
export const perspective = {
  monograph: 1200,
  coverflow: 1400,
} as const

/** Z axis depth of the three monograph layers, in pixels. */
export const depth = {
  pageBlock: -6,
  cover: 0,
  viewport: 24,
  chrome: 36,
  sheen: 37,
} as const

/** Pointer following specular sheen: radius in px and falloff stop in percent. */
export const sheen = {
  radius: 420,
  falloff: 70,
} as const

/**
 * Hero dot matrix relief: pointer spring, opacity of the raised dots, and the
 * radii in px of the highlight and of the mask that reveals the relief.
 */
export const emboss = {
  spring: { stiffness: 220, damping: 28, mass: 0.5 },
  raisedOpacity: 0.28,
  highlightRadius: 280,
  maskRadius: 220,
} as const

/** Core stack badge: hover lift in px and its spring. */
export const badgeHover = {
  lift: -2,
  spring: { type: 'spring', stiffness: 400, damping: 25 },
} as const

/** Monograph entrance, driven by whileInView. */
export const entrance = {
  initial: { opacity: 0, y: 36, rotateX: 8 },
  visible: { opacity: 1, y: 0, rotateX: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
} as const

/** Scroll parallax of the inner viewport layer, in pixels. */
export const parallax = {
  from: -12,
  to: 12,
} as const

/** Band of the viewport that decides which volume is active in the index. */
export const activeSectionRootMargin = '-35% 0px -45% 0px'

export interface CoverflowPose {
  x: string
  scale: number
  rotateY: number
  zIndex: number
  opacity: number
}

/** 3D coverflow: spring, drag threshold and the four position states. */
export const coverflow = {
  spring: { type: 'spring', stiffness: 280, damping: 28 },
  dragThreshold: 50,
  poses: {
    center: { x: '0%', scale: 1, rotateY: 0, zIndex: 30, opacity: 1 },
    left: { x: '-56%', scale: 0.85, rotateY: 22, zIndex: 20, opacity: 0.72 },
    right: { x: '56%', scale: 0.85, rotateY: -22, zIndex: 20, opacity: 0.72 },
    parkedLeft: { x: '-92%', scale: 0.7, rotateY: 32, zIndex: 10, opacity: 0 },
    parkedRight: { x: '92%', scale: 0.7, rotateY: -32, zIndex: 10, opacity: 0 },
  } satisfies Record<string, CoverflowPose>,
} as const

/** Maps offset = index - activeIndex to its pose. */
export function coverflowPose(offset: number): CoverflowPose {
  if (offset === 0) return coverflow.poses.center
  if (offset === -1) return coverflow.poses.left
  if (offset === 1) return coverflow.poses.right
  return offset < 0 ? coverflow.poses.parkedLeft : coverflow.poses.parkedRight
}

/** Short, shared timings for small state changes (seconds). */
export const duration = {
  quick: 0.2,
  state: 0.35,
} as const

export const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]
