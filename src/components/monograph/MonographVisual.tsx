import type { ProjectVisual } from '../../data/types.ts'
import { MicroservicesDiagram } from '../MicroservicesDiagram.tsx'
import { OrderDiPreview } from '../OrderDiPreview.tsx'
import { RealWorldXpPreview } from '../RealWorldXpPreview.tsx'
import { SolarArchitectureDiagram } from '../SolarArchitectureDiagram.tsx'

interface MonographVisualProps {
  visual: ProjectVisual
}

/** Picks the interactive visual that fills a monograph's viewport layer. */
export function MonographVisual({ visual }: MonographVisualProps) {
  switch (visual.kind) {
    case 'solar-architecture':
      return <SolarArchitectureDiagram diagram={visual.diagram} strings={visual.strings} />
    case 'microservices':
      return <MicroservicesDiagram diagram={visual.diagram} />
    case 'order-board':
      return <OrderDiPreview preview={visual.preview} />
    case 'xp-tracker':
      return <RealWorldXpPreview preview={visual.preview} />
  }
}
