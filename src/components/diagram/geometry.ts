import type { GridPos, GridSize, NodeSide } from '../../data/types.ts'

// Pure geometry for the architecture diagram: grid cells to pixel boxes,
// orthogonal connectors between box sides, and where a label can sit on a
// connector. No React in here.

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface Size {
  width: number
  height: number
}

/** The pixel box of a node centred in a one based grid cell. */
export function cellRect(position: GridPos, grid: GridSize, area: Size, node: Size): Rect {
  const cellWidth = area.width / grid.cols
  const cellHeight = area.height / grid.rows
  return {
    x: (position.col - 0.5) * cellWidth - node.width / 2,
    y: (position.row - 0.5) * cellHeight - node.height / 2,
    width: node.width,
    height: node.height,
  }
}

// A narrow stage reads top to bottom, so the wide layout is transposed:
// columns become rows, and each side of a node turns with them.

export function transposePos(position: GridPos): GridPos {
  return { col: position.row, row: position.col }
}

export function transposeGrid(grid: GridSize): GridSize {
  return { cols: grid.rows, rows: grid.cols }
}

const transposedSide: Record<NodeSide, NodeSide> = { left: 'top', top: 'left', right: 'bottom', bottom: 'right' }

export function transposeSide(side: NodeSide): NodeSide {
  return transposedSide[side]
}

function isHorizontal(side: NodeSide): boolean {
  return side === 'left' || side === 'right'
}

/** The point `at` of the way along one side of a box, pushed `gap` px away from it. */
function sidePoint(rect: Rect, side: NodeSide, at: number, gap: number): Point {
  switch (side) {
    case 'top':
      return { x: rect.x + rect.width * at, y: rect.y - gap }
    case 'bottom':
      return { x: rect.x + rect.width * at, y: rect.y + rect.height + gap }
    case 'left':
      return { x: rect.x - gap, y: rect.y + rect.height * at }
    case 'right':
      return { x: rect.x + rect.width + gap, y: rect.y + rect.height * at }
  }
}

export interface ConnectorEnd {
  rect: Rect
  side: NodeSide
  /** 0 to 1 along the side. */
  at: number
}

/**
 * Corner points of an orthogonal connector. Two facing sides give a straight
 * line or a Z, two perpendicular sides give a single elbow. The line stops
 * `arrowGap` px short of the target so the arrowhead does not touch the box.
 */
export function routeConnector(from: ConnectorEnd, to: ConnectorEnd, arrowGap: number): Point[] {
  const start = sidePoint(from.rect, from.side, from.at, 0)
  const end = sidePoint(to.rect, to.side, to.at, arrowGap)
  const leavesSideways = isHorizontal(from.side)
  const entersSideways = isHorizontal(to.side)

  if (leavesSideways && entersSideways) {
    if (Math.abs(start.y - end.y) < 0.5) return [start, end]
    const middle = (start.x + end.x) / 2
    return [start, { x: middle, y: start.y }, { x: middle, y: end.y }, end]
  }
  if (!leavesSideways && !entersSideways) {
    if (Math.abs(start.x - end.x) < 0.5) return [start, end]
    const middle = (start.y + end.y) / 2
    return [start, { x: start.x, y: middle }, { x: end.x, y: middle }, end]
  }
  if (leavesSideways) return [start, { x: end.x, y: start.y }, end]
  return [start, { x: start.x, y: end.y }, end]
}

function round(value: number): string {
  return value.toFixed(1)
}

/** SVG path through the corner points, with each corner rounded to `radius`. */
export function connectorPath(points: readonly Point[], radius: number): string {
  let path = `M${round(points[0].x)} ${round(points[0].y)}`
  for (let index = 1; index < points.length - 1; index += 1) {
    const before = points[index - 1]
    const corner = points[index]
    const after = points[index + 1]
    const lengthIn = Math.hypot(corner.x - before.x, corner.y - before.y)
    const lengthOut = Math.hypot(after.x - corner.x, after.y - corner.y)
    const cut = Math.min(radius, lengthIn / 2, lengthOut / 2)
    if (cut < 0.5) {
      path += ` L${round(corner.x)} ${round(corner.y)}`
      continue
    }
    const enterX = corner.x - ((corner.x - before.x) / lengthIn) * cut
    const enterY = corner.y - ((corner.y - before.y) / lengthIn) * cut
    const leaveX = corner.x + ((after.x - corner.x) / lengthOut) * cut
    const leaveY = corner.y + ((after.y - corner.y) / lengthOut) * cut
    path += ` L${round(enterX)} ${round(enterY)} Q${round(corner.x)} ${round(corner.y)} ${round(leaveX)} ${round(leaveY)}`
  }
  const last = points[points.length - 1]
  return `${path} L${round(last.x)} ${round(last.y)}`
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

/**
 * Where a label chip can sit on a connector: the middle of its longest
 * segment that has room for the chip. A sideways segment needs the chip's
 * width, an upright one its height, and in both cases the chip must stay
 * clear of every node. Returns null when no segment fits, and the label is
 * then left to the inspector.
 */
export function labelAnchor(
  points: readonly Point[],
  chip: Size,
  margin: number,
  obstacles: Iterable<Rect>,
): Point | null {
  const nodes = [...obstacles]
  let best: { length: number; anchor: Point } | null = null
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index]
    const to = points[index + 1]
    const sideways = Math.abs(to.y - from.y) < 0.5
    const length = Math.hypot(to.x - from.x, to.y - from.y)
    if (length < (sideways ? chip.width : chip.height) + margin) continue
    if (best && length <= best.length) continue
    const anchor = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    const box = {
      x: anchor.x - chip.width / 2 - 2,
      y: anchor.y - chip.height / 2 - 2,
      width: chip.width + 4,
      height: chip.height + 4,
    }
    if (nodes.some((node) => overlaps(box, node))) continue
    best = { length, anchor }
  }
  return best ? best.anchor : null
}
