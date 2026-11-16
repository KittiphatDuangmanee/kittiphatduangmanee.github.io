import type { GridPos, GridSize } from '../../data/types.ts'

// Pure geometry for the architecture diagrams: grid cells to pixel boxes,
// edges clipped at box borders, and label wrapping. No React in here.

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

export interface BoxLimits {
  maxWidth: number
  maxHeight: number
  gapX: number
  gapY: number
}

/** The pixel box of a node sitting in a one based grid cell. */
export function cellRect(position: GridPos, grid: GridSize, area: { width: number; height: number }, box: BoxLimits): Rect {
  const cellWidth = area.width / grid.cols
  const cellHeight = area.height / grid.rows
  const width = Math.max(0, Math.min(box.maxWidth, cellWidth - box.gapX))
  const height = Math.max(0, Math.min(box.maxHeight, cellHeight - box.gapY))
  const centreX = (position.col - 0.5) * cellWidth
  const centreY = (position.row - 0.5) * cellHeight
  return { x: centreX - width / 2, y: centreY - height / 2, width, height }
}

export function centreOf(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

/** Smallest box around a set of boxes, grown by `padding` on every side. */
export function unionRect(rects: readonly Rect[], padding: number): Rect {
  const left = Math.min(...rects.map((rect) => rect.x)) - padding
  const top = Math.min(...rects.map((rect) => rect.y)) - padding
  const right = Math.max(...rects.map((rect) => rect.x + rect.width)) + padding
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height)) + padding
  return { x: left, y: top, width: right - left, height: bottom - top }
}

/** Where a ray from the centre of `rect` toward `target` leaves the box, plus a gap. */
function exitPoint(rect: Rect, target: Point, gap: number): Point {
  const centre = centreOf(rect)
  const deltaX = target.x - centre.x
  const deltaY = target.y - centre.y
  if (deltaX === 0 && deltaY === 0) return centre
  const scaleX = deltaX === 0 ? Infinity : rect.width / 2 / Math.abs(deltaX)
  const scaleY = deltaY === 0 ? Infinity : rect.height / 2 / Math.abs(deltaY)
  const scale = Math.min(scaleX, scaleY)
  const length = Math.hypot(deltaX, deltaY)
  return {
    x: centre.x + deltaX * scale + (deltaX / length) * gap,
    y: centre.y + deltaY * scale + (deltaY / length) * gap,
  }
}

/** The point on the border of `rect` closest to `point` (which lies outside it). */
function nearestBorderPoint(rect: Rect, point: Point): Point {
  return {
    x: Math.min(rect.x + rect.width, Math.max(rect.x, point.x)),
    y: Math.min(rect.y + rect.height, Math.max(rect.y, point.y)),
  }
}

function pushAway(point: Point, from: Point, gap: number): Point {
  const deltaX = point.x - from.x
  const deltaY = point.y - from.y
  const length = Math.hypot(deltaX, deltaY)
  if (length === 0) return point
  return { x: point.x - (deltaX / length) * gap, y: point.y - (deltaY / length) * gap }
}

interface Endpoint {
  rect: Rect
  isGroup: boolean
}

/**
 * Start and end of the line between two endpoints. A node connects from its
 * border toward the other endpoint. A group frame is met at the point on its
 * border nearest the node, so the line stays straight and short.
 */
export function edgeLine(from: Endpoint, to: Endpoint, gap: number): { start: Point; end: Point } {
  if (to.isGroup && !from.isGroup) {
    const anchor = nearestBorderPoint(to.rect, centreOf(from.rect))
    return { start: exitPoint(from.rect, anchor, gap), end: pushAway(anchor, centreOf(from.rect), gap) }
  }
  if (from.isGroup && !to.isGroup) {
    const anchor = nearestBorderPoint(from.rect, centreOf(to.rect))
    return { start: pushAway(anchor, centreOf(to.rect), gap), end: exitPoint(to.rect, anchor, gap) }
  }
  return {
    start: exitPoint(from.rect, centreOf(to.rect), gap),
    end: exitPoint(to.rect, centreOf(from.rect), gap),
  }
}

/**
 * Greedy word wrap using an estimated character width. SVG text cannot wrap
 * on its own, and measuring every label in the DOM is not worth a layout
 * pass, so an estimate of 0.58em per character (a little wide, on purpose)
 * keeps labels inside their boxes.
 */
export function wrapLabel(label: string, maxWidth: number, fontSize: number, maxLines: number): string[] {
  const maxChars = Math.max(4, Math.floor(maxWidth / (fontSize * 0.58)))
  const lines: string[] = []
  for (const word of label.split(' ')) {
    const current = lines[lines.length - 1]
    if (current !== undefined && `${current} ${word}`.length <= maxChars) {
      lines[lines.length - 1] = `${current} ${word}`
    } else if (lines.length < maxLines) {
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${current} ${word}`
    }
  }
  return lines
}

/** True when a single line of mono text fits the given width. */
export function monoFits(text: string, maxWidth: number, fontSize: number): boolean {
  return text.length * fontSize * 0.64 <= maxWidth
}
