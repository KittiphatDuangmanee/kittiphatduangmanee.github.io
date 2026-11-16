import type { ArchitectureDiagram } from '../data/types.ts'
import { ArchitectureDiagramView } from './diagram/ArchitectureDiagramView.tsx'

interface MicroservicesDiagramProps {
  diagram: ArchitectureDiagram
}

/**
 * VOL. III visual: the service topology and the event driven booking and
 * payment flow, as an interactive SVG diagram. The eight services share one
 * dashed frame, so the gateway, the registry and the databases each need a
 * single edge to it instead of eight.
 */
export function MicroservicesDiagram({ diagram }: MicroservicesDiagramProps) {
  return <ArchitectureDiagramView diagram={diagram} />
}
