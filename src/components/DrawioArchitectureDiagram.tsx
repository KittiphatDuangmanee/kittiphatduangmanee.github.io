import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { useId, useMemo, useRef, useState, type FocusEvent, type MouseEvent } from 'react'

import { site } from '../data/site.ts'
import type { ArchitectureDiagram, ArchitectureNode } from '../data/types.ts'
import { useElementSize } from '../hooks/useElementSize.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { cn } from '../lib/cn.ts'
import { diagram as sizes } from '../styles/tokens.ts'
import { DiagramIcon } from './diagram/DiagramIcon.tsx'
import {
  cellRect,
  connectorPath,
  labelAnchor,
  routeConnector,
  transposeGrid,
  transposePos,
  transposeSide,
  type Point,
  type Rect,
} from './diagram/geometry.ts'

interface DrawioArchitectureDiagramProps {
  diagram: ArchitectureDiagram
}

type NodeState = 'focus' | 'linked' | 'dimmed'

interface Connector {
  id: string
  label: string
  path: string
  /** Where the label chip sits, or null when the connector has no room for it. */
  labelAt: Point | null
}

const copy = site.projects.diagram

/**
 * An interactive system diagram in the manner of a Draw.io canvas: white
 * icon cards on a light engineering grid, joined by orthogonal connectors
 * with arrowheads and labels.
 *
 * Nodes are real buttons laid over one SVG layer of connectors. Hovering or
 * selecting a node keeps it, its connectors and its neighbours at full
 * strength and dims the rest; the flow filters do the same for one path
 * through the system. The inspector underneath reads out the selected
 * component. The grid comes from the data: wide stages use it as written,
 * narrow stages transpose it so the drawing reads top to bottom and never
 * scrolls sideways.
 */
export function DrawioArchitectureDiagram({ diagram }: DrawioArchitectureDiagramProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const stage = useElementSize(stageRef)
  const { reduced } = useMotionPreference()
  const markerId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const inspectorId = useId()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [flowId, setFlowId] = useState<string | null>(null)

  const measured = stage.width > 0
  const wide = stage.width >= sizes.wideFrom
  const grid = useMemo(() => (wide ? diagram.grid : transposeGrid(diagram.grid)), [diagram.grid, wide])
  const height = grid.rows * sizes.rowHeight

  const layout = useMemo(() => {
    const nodeSize = {
      width: Math.max(0, Math.min(sizes.nodeWidth, stage.width / grid.cols - sizes.cellGap)),
      height: sizes.nodeHeight,
    }
    const rects = new Map<string, Rect>()
    for (const node of diagram.nodes) {
      const position = wide ? node.position : transposePos(node.position)
      rects.set(node.id, cellRect(position, grid, { width: stage.width, height }, nodeSize))
    }

    const connectors: Connector[] = []
    for (const edge of diagram.edges) {
      const from = rects.get(edge.from)
      const to = rects.get(edge.to)
      if (!from || !to) continue
      const points = routeConnector(
        { rect: from, side: wide ? edge.route.from : transposeSide(edge.route.from), at: edge.route.fromAt ?? 0.5 },
        { rect: to, side: wide ? edge.route.to : transposeSide(edge.route.to), at: edge.route.toAt ?? 0.5 },
        sizes.arrowGap,
      )
      const chip = { width: edge.label.length * sizes.labelCharWidth + sizes.labelPadding, height: sizes.labelHeight }
      connectors.push({
        id: edge.id,
        label: edge.label,
        path: connectorPath(points, sizes.cornerRadius),
        labelAt: labelAnchor(points, chip, sizes.labelMargin, rects.values()),
      })
    }
    return { rects, connectors }
  }, [diagram, grid, height, stage.width, wide])

  const nodeById = useMemo(() => new Map(diagram.nodes.map((node) => [node.id, node])), [diagram])
  const flow = flowId ? diagram.flows.find((candidate) => candidate.id === flowId) : undefined
  const focusId = hoveredId ?? selectedId

  // The flow filter sets the scope; a focused node narrows it to its own connectors.
  const highlight = useMemo(() => {
    const inScope = flow ? new Set(flow.edgeIds) : null
    const live = diagram.edges.filter(
      (edge) => (!inScope || inScope.has(edge.id)) && (!focusId || edge.from === focusId || edge.to === focusId),
    )
    const linked = new Set<string>()
    for (const edge of live) {
      linked.add(edge.from)
      linked.add(edge.to)
    }
    return { liveEdges: new Set(live.map((edge) => edge.id)), linked, filtered: Boolean(flow || focusId) }
  }, [diagram, flow, focusId])

  const stateOf = (nodeId: string): NodeState => {
    if (nodeId === focusId) return 'focus'
    if (!highlight.filtered || highlight.linked.has(nodeId)) return 'linked'
    return 'dimmed'
  }

  const inspected = focusId ? nodeById.get(focusId) : undefined
  const resettable = flowId !== null || selectedId !== null

  const reset = () => {
    setFlowId(null)
    setSelectedId(null)
  }

  // A click on the bare canvas lets go of the selection.
  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setSelectedId(null)
  }

  const onNodeFocus = (event: FocusEvent<HTMLButtonElement>, nodeId: string) => {
    // Preview on keyboard focus only; a mouse press is handled by the click.
    if (event.currentTarget.matches(':focus-visible')) setHoveredId(nodeId)
  }

  return (
    // Positioned, so the visually hidden list below stays inside whatever scrolls this diagram.
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-diagram-border">
        {/* Toolbar: one filter per flow through the system, and a reset. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-diagram-border bg-surface px-3 py-2.5">
          <div role="group" aria-label={copy.flowsLabel} className="flex flex-wrap items-center gap-1.5">
            <FlowPill label={copy.allFlows} pressed={flowId === null} onClick={() => setFlowId(null)} />
            {diagram.flows.map((candidate) => (
              <FlowPill
                key={candidate.id}
                label={candidate.label}
                pressed={flowId === candidate.id}
                onClick={() => setFlowId(candidate.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={!resettable}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-2 transition-[color,background-color,scale] duration-150 ease-editorial hover:bg-well hover:text-ink active:scale-[0.97] disabled:text-ink-3 disabled:hover:bg-transparent pointer-coarse:min-h-11"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            {copy.reset}
          </button>
        </div>

        <div className="diagram-grid p-2">
          <div
            ref={stageRef}
            role="group"
            aria-label={diagram.ariaSummary}
            className="relative w-full"
            style={{ height }}
            onClick={onStageClick}
          >
            {measured ? (
              <>
                <svg
                  width={stage.width}
                  height={height}
                  viewBox={`0 0 ${stage.width} ${height}`}
                  aria-hidden="true"
                  focusable="false"
                  className="pointer-events-none absolute inset-0 block"
                >
                  <defs>
                    <marker id={`${markerId}-idle`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
                      <path d="M0.6 0.9 7.4 4 0.6 7.1Z" className="fill-diagram-edge" />
                    </marker>
                    <marker id={`${markerId}-live`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
                      <path d="M0.6 0.9 7.4 4 0.6 7.1Z" className="fill-diagram-active" />
                    </marker>
                  </defs>
                  {layout.connectors.map((connector) => {
                    const live = highlight.liveEdges.has(connector.id)
                    const emphasised = live && highlight.filtered
                    return (
                      <path
                        key={connector.id}
                        d={connector.path}
                        fill="none"
                        strokeLinejoin="round"
                        markerEnd={`url(#${markerId}-${emphasised ? 'live' : 'idle'})`}
                        className={cn(
                          'transition-opacity duration-200 ease-editorial',
                          emphasised ? 'stroke-diagram-active [stroke-width:1.75]' : 'stroke-diagram-edge [stroke-width:1.5]',
                          !live && 'opacity-30',
                        )}
                      />
                    )
                  })}
                </svg>

                {/* Dots travelling along the live connectors. Left out under reduced motion. */}
                {reduced
                  ? null
                  : layout.connectors.map((connector, index) =>
                      highlight.liveEdges.has(connector.id) ? (
                        <motion.span
                          key={`${connector.id}:${connector.path}`}
                          aria-hidden="true"
                          className="pointer-events-none absolute left-0 top-0 size-[7px] rounded-full bg-diagram-active"
                          style={{ offsetPath: `path("${connector.path}")`, offsetRotate: '0deg' }}
                          initial={{ offsetDistance: '0%', opacity: 0 }}
                          animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
                          transition={{
                            duration: sizes.dotSeconds,
                            ease: 'linear',
                            times: [0, 0.12, 0.86, 1],
                            repeat: Infinity,
                            delay: (index % 4) * 0.22,
                          }}
                        />
                      ) : null,
                    )}

                {layout.connectors.map((connector) => {
                  if (!connector.labelAt) return null
                  const live = highlight.liveEdges.has(connector.id)
                  return (
                    <span
                      key={connector.id}
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[5px] border bg-surface px-1.5 font-mono text-[10px] leading-4 transition-opacity duration-200 ease-editorial',
                        live && highlight.filtered ? 'border-diagram-active text-diagram-active' : 'border-diagram-border text-ink-2',
                        !live && 'opacity-30',
                      )}
                      style={{ left: connector.labelAt.x, top: connector.labelAt.y }}
                    >
                      {connector.label}
                    </span>
                  )
                })}

                {diagram.nodes.map((node) => {
                  const rect = layout.rects.get(node.id)
                  if (!rect) return null
                  const state = stateOf(node.id)
                  return (
                    <button
                      key={node.id}
                      type="button"
                      aria-pressed={node.id === selectedId}
                      aria-controls={inspectorId}
                      aria-label={`${node.label}, ${node.tech}`}
                      title={node.tech}
                      onClick={() => setSelectedId((current) => (current === node.id ? null : node.id))}
                      onPointerEnter={(event) => {
                        if (event.pointerType === 'mouse') setHoveredId(node.id)
                      }}
                      onPointerLeave={() => setHoveredId(null)}
                      onFocus={(event) => onNodeFocus(event, node.id)}
                      onBlur={() => setHoveredId(null)}
                      className={cn(
                        'absolute flex flex-col items-center justify-center rounded-xl border-2 bg-surface px-1.5 text-center transition-[border-color,box-shadow,opacity,scale] duration-200 ease-editorial active:scale-[0.97]',
                        state === 'focus'
                          ? 'border-diagram-active shadow-node-active'
                          : 'border-diagram-border shadow-node hover:border-diagram-edge',
                        state === 'dimmed' && 'opacity-40',
                      )}
                      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                    >
                      <DiagramIcon icon={node.icon} size={28} />
                      <span className="mt-1.5 block max-w-full text-[12px] font-bold leading-[15px] text-ink">{node.label}</span>
                      {/* Too narrow for the technology line without cutting it mid-word: the inspector carries it. */}
                      {rect.width >= sizes.techLineFrom ? (
                        <span className="mt-0.5 block max-w-full truncate font-mono text-[9.5px] leading-[13px] text-ink-2">
                          {node.tech}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* For screen readers the connectors are a list, since the drawing itself is hidden from them. */}
      <ul className="sr-only" aria-label={copy.connectionsLabel}>
        {diagram.edges.map((edge) => (
          <li key={edge.id}>
            {nodeById.get(edge.from)?.label} {copy.connects} {nodeById.get(edge.to)?.label}: {edge.label}
          </li>
        ))}
      </ul>

      <Inspector
        id={inspectorId}
        node={inspected}
        title={flow?.label ?? diagram.title}
        description={flow?.description ?? diagram.summary}
      />
    </div>
  )
}

interface FlowPillProps {
  label: string
  pressed: boolean
  onClick: () => void
}

function FlowPill({ label, pressed, onClick }: FlowPillProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'min-h-9 rounded-full border px-3 text-[13px] font-medium transition-[color,background-color,border-color,scale] duration-150 ease-editorial active:scale-[0.97] pointer-coarse:min-h-11',
        pressed
          ? 'border-diagram-active bg-diagram-active text-surface'
          : 'border-diagram-border bg-surface text-ink-2 hover:border-diagram-edge hover:text-ink',
      )}
    >
      {label}
    </button>
  )
}

interface InspectorProps {
  id: string
  /** The focused component, if any. */
  node: ArchitectureNode | undefined
  /** Shown while no component is focused: the active flow or the whole diagram. */
  title: string
  description: string
}

/** The node inspector: the focused component in words, or the flow when none is focused. */
function Inspector({ id, node, title, description }: InspectorProps) {
  return (
    <div id={id} aria-live="polite" className="mt-3 rounded-xl border border-hairline bg-surface p-4 sm:min-h-44 sm:p-5">
      {node ? (
        <>
          <div className="flex items-center gap-3">
            <DiagramIcon icon={node.icon} size={32} />
            <p className="min-w-0 font-semibold leading-snug text-ink">{node.label}</p>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1fr_1.5fr]">
            <InspectorField label={copy.technology} value={node.tech} />
            <InspectorField label={copy.input} value={node.input} />
            <InspectorField label={copy.output} value={node.output} />
            <InspectorField label={copy.decision} value={node.decision} />
          </dl>
        </>
      ) : (
        <>
          <p className="font-semibold leading-snug text-ink">{title}</p>
          <p className="mt-2 max-w-measure text-small text-ink-2">{description}</p>
          <p className="mt-3 text-small text-ink-2">{copy.hint}</p>
        </>
      )}
    </div>
  )
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="meta-tag text-ink-2">{label}</dt>
      <dd className="mt-1 text-small text-ink">{value}</dd>
    </div>
  )
}
