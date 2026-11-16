import type { ArchitectureDiagram, StringStatusSummary } from '../data/types.ts'
import { cn } from '../lib/cn.ts'
import { ArchitectureDiagramView } from './diagram/ArchitectureDiagramView.tsx'

interface SolarArchitectureDiagramProps {
  diagram: ArchitectureDiagram
  strings: StringStatusSummary
}

const dotColour: Record<StringStatusSummary['states'][number]['id'], string> = {
  normal: 'bg-status-ok',
  warning: 'bg-status-warn',
  alarm: 'bg-status-alarm',
}

/**
 * VOL. I visual: the telemetry and alarm pipeline as an interactive SVG
 * diagram, with a synthetic count of strings by state beside the notice.
 * Abstracted on purpose: no production data, names or hosts.
 */
export function SolarArchitectureDiagram({ diagram, strings }: SolarArchitectureDiagramProps) {
  return (
    <ArchitectureDiagramView
      diagram={diagram}
      aside={
        <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-micro text-(--cover-ink-2)">
          <dt className="sr-only">{strings.label}</dt>
          {strings.states.map((state) => (
            <dd key={state.id} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn('size-1.5 rounded-full', dotColour[state.id])} />
              <span className="font-medium text-(--cover-ink)">{state.count}</span>
              {state.label}
            </dd>
          ))}
        </dl>
      }
    />
  )
}
