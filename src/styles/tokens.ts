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
  /** Perspective of the tilting card itself, in px. */
  perspective: 1400,
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

/** Project screen ring autoplay: one screen every few seconds. */
export const carousel = {
  intervalSeconds: 4.5,
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

/**
 * 3D circular gallery, used for the project screens and the certificates.
 * Cards stand on a ring seen from outside, `stepDegrees` apart: the front
 * card faces the reader and its neighbours curve away. Every length is a
 * multiple of the card width, so the ring keeps its shape at any size.
 */
export const ring = {
  stepDegrees: 40,
  /** Gap between neighbours on the ring: 1 means their edges just meet. */
  spacing: 1.06,
  /** Perspective distance as a multiple of the card width. */
  perspective: 3,
  /** Opacity one step from the front. It falls to 0 halfway round, where a card changes sides. */
  neighbourOpacity: 0.85,
  /** Card width as a share of the stage width, below and from `wideFrom` px of stage. */
  cardShare: { narrow: 0.7, wide: 0.5 },
  wideFrom: 640,
  maxCardWidth: { screens: 640, certificates: 440 },
  /** Height in px of the window chrome above a project screen. */
  screenChrome: 36,
  /** Certificate cards: A4 landscape, width over height. */
  certificateRatio: 1.414,
  /** Vertical room above and below the cards for their shadow, in px. */
  stagePad: 28,
  /** Overdamped, so the ring settles without swinging past the card. */
  spring: { type: 'spring', stiffness: 260, damping: 34, mass: 0.9 },
  /** Pointer travel for one step, as a share of the card width. */
  dragStep: 0.6,
  /** A release past this many px, or faster than `flickVelocity` px/s, always moves one card. */
  dragThreshold: 50,
  flickVelocity: 400,
  /** Seconds of release velocity added to where the ring lands. */
  flickProjection: 0.15,
  /** Reduced motion: the ring jumps and fades back in. */
  reducedFade: { duration: 0.22, ease },
} as const

export interface RingPose {
  x: number
  z: number
  rotateY: number
  opacity: number
  zIndex: number
}

/** Ring radius in px for a card width, wide enough that neighbours never cut into each other. */
export function ringRadius(cardWidth: number): number {
  const step = (ring.stepDegrees * Math.PI) / 180
  return (ring.spacing * (cardWidth / 2) * (1 + Math.cos(step))) / Math.sin(step)
}

/**
 * Pose of a card `offset` steps from the front (fractional while the ring
 * turns) in a ring of `count` cards. The front card sits at z 0, so it shows
 * at its natural size.
 */
export function ringPose(offset: number, count: number, cardWidth: number): RingPose {
  const degrees = offset * ring.stepDegrees
  const angle = (degrees * Math.PI) / 180
  const radius = ringRadius(cardWidth)
  const distance = Math.abs(offset)
  const half = count / 2
  const opacity =
    distance <= 1
      ? 1 - distance * (1 - ring.neighbourOpacity)
      : half <= 1
        ? 0
        : Math.max(0, ring.neighbourOpacity * (1 - (distance - 1) / (half - 1)))
  return {
    x: radius * Math.sin(angle),
    z: radius * (Math.cos(angle) - 1),
    rotateY: degrees,
    opacity,
    zIndex: Math.max(1, 30 - Math.round(distance * 10)),
  }
}
