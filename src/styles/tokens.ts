// The motion contract. Every number here is copied once from
// design/reference/spec.md, and components import it. No component retypes a
// spec value, so the spec and the code cannot drift apart silently.

type Bezier = [number, number, number, number]

/** The site's one easing curve: a strong ease-out. */
export const ease: Bezier = [0.22, 1, 0.36, 1]

/** Sheet curve for the detail modal on phones: quick start, long settle. */
export const easeDrawer: Bezier = [0.32, 0.72, 0, 1]

/** Short, shared timings for small state changes (seconds). */
export const duration = {
  quick: 0.2,
  state: 0.35,
} as const

/** Pointer tilt on the centre certificate: spring smoothing and the clamp, in degrees. */
export const tilt = {
  spring: { stiffness: 260, damping: 24, mass: 0.6 },
  maxCertificate: 6,
} as const

/** Perspective distances in pixels. */
export const perspective = {
  coverflow: 1400,
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

/** Technology badge: hover lift in px and its spring. */
export const badgeHover = {
  lift: -2,
  spring: { type: 'spring', stiffness: 400, damping: 25 },
} as const

/** A project card rising into view, once. */
export const reveal = {
  initial: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease },
} as const

/**
 * Project screenshot carousel. A slide travels `slideOffset` px on a spring
 * with no overshoot while it cross-fades; a drag past `dragThreshold` px or a
 * flick faster than `flickVelocity` px/s changes the slide.
 */
export const carousel = {
  intervalSeconds: 4.5,
  slideOffset: 28,
  slideSpring: { type: 'spring', stiffness: 320, damping: 36, mass: 0.9 },
  fade: { duration: 0.22, ease },
  dragThreshold: 50,
  flickVelocity: 400,
  dragElastic: 0.18,
  /** Longest frame gap counted toward the timer, so a background tab never skips slides. */
  maxFrameMs: 100,
} as const

/**
 * Dialogs opened from the projects section. Entrances use a spring or the
 * sheet curve; exits are shorter than entrances so the page answers at once.
 */
export const modal = {
  scaleFrom: 0.97,
  offsetY: 12,
  enter: { type: 'spring', duration: 0.45, bounce: 0 },
  exit: { duration: 0.18, ease },
  sheetEnter: { duration: 0.45, ease: easeDrawer },
  sheetExit: { duration: 0.25, ease: easeDrawer },
  scrimEnter: { duration: 0.25, ease },
  scrimExit: { duration: 0.18, ease },
} as const

/** Architecture diagram: travel time of a flow dot, and layout sizes in px. */
export const diagram = {
  dotSeconds: 1.8,
  /** Below this stage width the grid is transposed so it reads top to bottom. */
  wideFrom: 920,
  rowHeight: 136,
  nodeWidth: 132,
  nodeHeight: 96,
  /** Smallest side margin between a node and its grid cell. */
  cellGap: 10,
  /** Narrowest node that still shows its technology line. */
  techLineFrom: 112,
  cornerRadius: 8,
  /** Gap between an arrow tip and the node it points at. */
  arrowGap: 3,
  /** Estimated advance of one label character, and the chip's padding and height. */
  labelCharWidth: 6.05,
  labelPadding: 14,
  labelHeight: 18,
  /** Spare length a connector segment needs beyond its label chip. */
  labelMargin: 8,
} as const

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
