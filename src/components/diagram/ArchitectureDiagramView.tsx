import { motion } from 'framer-motion'
import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

import type { ArchitectureDiagram, ArchitectureFlow, ArchitectureNode } from '../../data/types.ts'
import { useElementSize } from '../../hooks/useElementSize.ts'
import { useMotionPreference } from '../../hooks/useMotionPreference.ts'
import { cn } from '../../lib/cn.ts'
import { cellRect, centreOf, edgeLine, monoFits, unionRect, wrapLabel, type BoxLimits, type Rect } from './geometry.ts'

interface ArchitectureDiagramViewProps {
  diagram: ArchitectureDiagram
  /** Optional strip rendered beside the provenance notice. */
  aside?: ReactNode
}

type NodeState = 'focus' | 'linked' | 'idle'
type Layout = 'wide' | 'narrow'

const NARROW_BELOW = 520
const NARROW_ROW_HEIGHT = 62
const LIMITS: Record<Layout, BoxLimits> = {
  wide: { maxWidth: 132, maxHeight: 54, gapX: 14, gapY: 14 },
  narrow: { maxWidth: 112, maxHeight: 46, gapX: 10, gapY: 16 },
}
const GROUP_PADDING = 7
const EDGE_GAP = 4
const LINE_HEIGHT = 12.5
const TECH_SIZE = 8.5

/**
 * A data driven, interactive SVG architecture diagram. Hover, focus or tap a
 * node to light up the requests and events that touch it and read its
 * figures. Flow buttons trace a whole path at once. It lays itself out from
 * its own width: a wide grid on desktop with the detail panel in an empty
 * block of the grid, a narrow grid on phones with the panel underneath, so
 * labels are always drawn at reading size.
 */
export function ArchitectureDiagramView({ diagram, aside }: ArchitectureDiagramViewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const rootSize = useElementSize(rootRef)
  const stageSize = useElementSize(stageRef)
  const { reduced } = useMotionPreference()
  const markerId = useId().replace(/[^a-zA-Z0-9]/g, '')

  const [selectedId, setSelectedId] = useState(diagram.defaultNodeId)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [flowId, setFlowId] = useState<string | null>(null)

  const layout: Layout = rootSize.width > 0 && rootSize.width < NARROW_BELOW ? 'narrow' : 'wide'
  const grid = diagram.grid[layout]
  const measured = stageSize.width > 0 && stageSize.height > 0

  const geometry = useMemo(() => {
    const nodeRects = new Map<string, Rect>()
    for (const node of diagram.nodes) {
      nodeRects.set(node.id, cellRect(node.position[layout], grid, stageSize, LIMITS[layout]))
    }
    const groupRects = new Map<string, Rect>()
    for (const group of diagram.groups) {
      const members = group.nodeIds.map((id) => nodeRects.get(id)).filter((rect): rect is Rect => rect !== undefined)
      if (members.length > 0) groupRects.set(group.id, unionRect(members, GROUP_PADDING))
    }
    return { nodeRects, groupRects }
  }, [diagram, layout, grid, stageSize])

  const nodeById = useMemo(() => new Map(diagram.nodes.map((node) => [node.id, node])), [diagram])
  const flow = flowId && !hoveredId ? diagram.flows.find((candidate) => candidate.id === flowId) : undefined
  const focusId = hoveredId ?? (flow ? null : selectedId)

  const highlight = useMemo(() => {
    const groupsOf = (nodeId: string) =>
      diagram.groups.filter((group) => group.nodeIds.includes(nodeId)).map((group) => group.id)

    const ownIds = focusId ? new Set([focusId, ...groupsOf(focusId)]) : new Set<string>()
    const activeEdges = flow
      ? diagram.edges.filter((edge) => flow.edgeIds.includes(edge.id))
      : diagram.edges.filter((edge) => ownIds.has(edge.from) || ownIds.has(edge.to))

    const linkedNodes = new Set<string>()
    const activeGroups = new Set<string>()
    for (const edge of activeEdges) {
      for (const endpoint of [edge.from, edge.to]) {
        const group = diagram.groups.find((candidate) => candidate.id === endpoint)
        if (!group) {
          linkedNodes.add(endpoint)
          continue
        }
        activeGroups.add(group.id)
        // A group reached from outside lights all of its members. A group
        // reached from one of its own members only lights the frame.
        if (!focusId || !group.nodeIds.includes(focusId)) {
          for (const member of group.nodeIds) linkedNodes.add(member)
        }
      }
    }
    return { activeEdgeIds: new Set(activeEdges.map((edge) => edge.id)), linkedNodes, activeGroups }
  }, [diagram, flow, focusId])

  const stateOf = (nodeId: string): NodeState => {
    if (nodeId === focusId) return 'focus'
    if (highlight.linkedNodes.has(nodeId)) return 'linked'
    return 'idle'
  }

  const select = (nodeId: string) => {
    setSelectedId(nodeId)
    setFlowId(null)
  }

  const onNodeKeyDown = (event: KeyboardEvent<SVGGElement>, nodeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(nodeId)
    }
  }

  const inspected = focusId ? nodeById.get(focusId) : undefined
  const fontSize = layout === 'narrow' || grid.cols > 5 ? 10.5 : 11

  // In the wide layout the detail panel occupies an empty block of the grid.
  const area = diagram.inspectorArea
  const inspectorStyle =
    layout === 'wide' && measured
      ? {
          left: ((area.col - 1) / grid.cols) * stageSize.width + 4,
          top: ((area.row - 1) / grid.rows) * stageSize.height + 6,
          width: (area.colSpan / grid.cols) * stageSize.width - 12,
          height: (area.rowSpan / grid.rows) * stageSize.height - 10,
        }
      : undefined

  const inspector = (
    <Inspector diagram={diagram} node={inspected} flow={flow} compact={inspectorStyle !== undefined} />
  )

  return (
    <div ref={rootRef} className="flex h-full min-h-0 flex-col gap-2 p-3 text-(--cover-ink)">
      {/* Top row: the flow tracer, with any volume specific strip beside it. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div role="group" aria-label={diagram.labels.flows} className="flex flex-wrap items-center gap-1.5">
          <span aria-hidden="true" className="mr-0.5 font-mono text-micro uppercase tracking-wider text-(--cover-ink-2)">
            {diagram.labels.flows}
          </span>
          {diagram.flows.map((candidate) => {
            const pressed = flowId === candidate.id
            return (
              <button
                key={candidate.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFlowId(pressed ? null : candidate.id)}
                className={cn(
                  'min-h-8 rounded-full border px-3 font-mono text-micro font-medium transition-colors duration-200 ease-monograph',
                  pressed
                    ? 'border-(--vol-accent) bg-(--vol-accent-wash) text-(--cover-ink)'
                    : 'border-(--cover-line) bg-(--cover-fill) text-(--cover-ink-2) hover:border-(--cover-line-strong) hover:text-(--cover-ink)',
                )}
              >
                {candidate.label}
              </button>
            )
          })}
        </div>
        {aside}
      </div>

      <div
        ref={stageRef}
        className={cn('relative', layout === 'wide' && 'min-h-[200px] flex-1')}
        style={layout === 'narrow' ? { height: grid.rows * NARROW_ROW_HEIGHT } : undefined}
      >
        {measured ? (
          <svg
            width={stageSize.width}
            height={stageSize.height}
            viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
            role="group"
            aria-label={diagram.ariaSummary}
            className="absolute inset-0 block select-none"
          >
            <defs>
              <marker id={`${markerId}-idle`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0.8 L7.2 4 L0 7.2 Z" className="dg-arrow" />
              </marker>
              <marker id={`${markerId}-active`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0.8 L7.2 4 L0 7.2 Z" className="dg-arrow-active" />
              </marker>
            </defs>

            {diagram.groups.map((group) => {
              const rect = geometry.groupRects.get(group.id)
              if (!rect) return null
              return (
                <g key={group.id}>
                  <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    rx={10}
                    className="dg-group"
                    data-active={highlight.activeGroups.has(group.id)}
                  />
                  <text x={rect.x + rect.width * group.labelAt[layout]} y={rect.y + 3} fontSize={9} className="dg-group-label">
                    {group.label}
                  </text>
                </g>
              )
            })}

            {diagram.edges.map((edge) => {
              const fromRect = geometry.nodeRects.get(edge.from) ?? geometry.groupRects.get(edge.from)
              const toRect = geometry.nodeRects.get(edge.to) ?? geometry.groupRects.get(edge.to)
              if (!fromRect || !toRect) return null
              const { start, end } = edgeLine(
                { rect: fromRect, isGroup: geometry.groupRects.has(edge.from) },
                { rect: toRect, isGroup: geometry.groupRects.has(edge.to) },
                EDGE_GAP,
              )
              const active = highlight.activeEdgeIds.has(edge.id)
              const path = `M${start.x.toFixed(1)} ${start.y.toFixed(1)} L${end.x.toFixed(1)} ${end.y.toFixed(1)}`
              return active && !reduced ? (
                <motion.path
                  key={`${edge.id}-active`}
                  d={path}
                  className="dg-edge"
                  data-active="true"
                  strokeDasharray="6 5"
                  markerEnd={`url(#${markerId}-active)`}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -22 }}
                  transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
                />
              ) : (
                <path
                  key={edge.id}
                  d={path}
                  className="dg-edge"
                  data-active={active}
                  data-dim={!active}
                  markerEnd={`url(#${markerId}-${active ? 'active' : 'idle'})`}
                />
              )
            })}

            {diagram.nodes.map((node) => {
              const rect = geometry.nodeRects.get(node.id)
              if (!rect) return null
              const centre = centreOf(rect)
              const innerWidth = rect.width - 14
              const lines = wrapLabel(node.label, innerWidth, fontSize, 2)
              const showTech =
                rect.height >= lines.length * LINE_HEIGHT + TECH_SIZE + 12 && monoFits(node.tech, innerWidth, TECH_SIZE)
              const blockHeight = lines.length * LINE_HEIGHT + (showTech ? TECH_SIZE + 4 : 0)
              const firstBaseline = centre.y - blockHeight / 2 + fontSize * 0.82
              return (
                <g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={node.id === selectedId}
                  aria-label={`${node.label}, ${diagram.labels.kinds[node.kind]}, ${node.tech}`}
                  className="dg-node"
                  data-state={stateOf(node.id)}
                  onClick={() => select(node.id)}
                  onKeyDown={(event) => onNodeKeyDown(event, node.id)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setHoveredId(node.id)
                  }}
                  onPointerLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(node.id)}
                  onBlur={() => setHoveredId(null)}
                >
                  <rect x={rect.x - 3} y={rect.y - 3} width={rect.width + 6} height={rect.height + 6} rx={10} className="dg-focus-ring" />
                  <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={7} className="dg-box" />
                  {lines.map((line, index) => (
                    <text
                      key={`${index}-${line}`}
                      x={centre.x}
                      y={firstBaseline + index * LINE_HEIGHT}
                      textAnchor="middle"
                      fontSize={fontSize}
                      className="dg-label"
                    >
                      {line}
                    </text>
                  ))}
                  {showTech ? (
                    <text
                      x={centre.x}
                      y={firstBaseline + lines.length * LINE_HEIGHT + 1}
                      textAnchor="middle"
                      fontSize={TECH_SIZE}
                      className="dg-tech"
                    >
                      {node.tech}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>
        ) : null}

        {inspectorStyle ? (
          <div className="absolute" style={inspectorStyle}>
            {inspector}
          </div>
        ) : null}
      </div>

      {/* Bottom row: what this drawing is, and how to use it, in words. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-micro">
        <p className="font-medium uppercase tracking-wider text-(--vol-accent-ink)">{diagram.notice}</p>
        <p className="text-(--cover-ink-2)">{diagram.hint}</p>
      </div>

      {layout === 'narrow' ? inspector : null}
    </div>
  )
}

interface InspectorProps {
  diagram: ArchitectureDiagram
  node: ArchitectureNode | undefined
  flow: ArchitectureFlow | undefined
  /** Wide layout: fill the grid block and fit the description to it. */
  compact: boolean
}

const DESCRIPTION_LINE = 15

/**
 * Detail panel: the node (or the traced flow) in words and figures.
 *
 * In the wide layout the panel has a fixed block to fill. The description
 * takes whatever height is left after the title and the figures, and is
 * clamped to the number of WHOLE lines that fit, measured from the DOM. A
 * line cut through the middle reads as a rendering bug.
 */
function Inspector({ diagram, node, flow, compact }: InspectorProps) {
  const descriptionRef = useRef<HTMLDivElement>(null)
  const descriptionSize = useElementSize(descriptionRef)
  const wholeLines = Math.max(1, Math.floor(descriptionSize.height / DESCRIPTION_LINE))
  const clamp: CSSProperties | undefined = compact
    ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: wholeLines, overflow: 'hidden' }
    : undefined

  const flowEdges = flow ? diagram.edges.filter((edge) => flow.edgeIds.includes(edge.id)).slice(0, 4) : []
  const eyebrow = node ? `${diagram.labels.kinds[node.kind]} · ${node.tech}` : diagram.labels.flows
  const title = node?.label ?? flow?.label
  const description = node?.description ?? flow?.description

  if (!title || !description) return null

  return (
    <div
      aria-live="polite"
      className={cn(
        'flex flex-col gap-1.5 overflow-hidden rounded-md border border-(--cover-line) bg-(--cover-fill) px-3 py-2.5',
        compact && 'h-full',
      )}
    >
      <p className="shrink-0 truncate font-mono text-micro uppercase tracking-wider text-(--vol-accent-ink)">{eyebrow}</p>
      <p className="shrink-0 truncate font-display text-lede leading-tight text-(--cover-ink)">{title}</p>
      <div ref={descriptionRef} className={cn(compact && 'min-h-0 flex-1 overflow-hidden')}>
        <p
          className={cn('text-(--cover-ink-2)', compact ? 'text-micro leading-[15px]' : 'text-small leading-snug')}
          style={clamp}
        >
          {description}
        </p>
      </div>
      {node ? (
        <dl className="grid shrink-0 gap-0.5 border-t border-(--cover-line) pt-1.5">
          {node.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <dt className="font-mono text-micro text-(--cover-ink-2)">{metric.label}</dt>
              <dd className="ml-auto text-right font-mono text-micro font-medium text-(--cover-ink)">{metric.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <ol className="grid shrink-0 gap-0.5 border-t border-(--cover-line) pt-1.5">
          {flowEdges.map((edge, index) => (
            <li key={edge.id} className="flex items-baseline gap-2 font-mono text-micro text-(--cover-ink-2)">
              <span className="text-(--vol-accent-ink)">{index + 1}</span>
              <span className="min-w-0 truncate">{edge.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
