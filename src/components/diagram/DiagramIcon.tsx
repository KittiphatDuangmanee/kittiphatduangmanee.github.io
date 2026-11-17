import type { ReactNode } from 'react'

import type { DiagramGlyphId, DiagramIcon as DiagramIconData } from '../../data/types.ts'
import { TechIcon } from '../primitives/TechIcon.tsx'

interface DiagramIconProps {
  icon: DiagramIconData
  /** Edge length in px. */
  size?: number
}

// Glyphs drawn for this site on a 32 unit grid, for the components that have
// no brand mark. Each takes one hue from the diagram tokens.
const glyphs: Record<DiagramGlyphId, ReactNode> = {
  'solar-array': (
    <>
      <circle cx="24" cy="7" r="3.2" className="fill-diagram-solar" />
      <path
        d="M24 1.2v1.4M18.2 7h1.4M28.4 7h1.4M19.9 2.9l1 1M28.1 2.9l-1 1M19.9 11.1l1-1"
        className="stroke-diagram-solar"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M8 14.5h16L27.5 26h-23z" className="fill-diagram-panel" />
      <path
        d="M16 14.5V26M12 14.5 10.25 26M20 14.5 21.75 26M6.25 20.25h19.5"
        className="stroke-surface"
        strokeWidth="1.2"
        fill="none"
      />
      <path d="M16 26v3M11.5 29.5h9" className="stroke-diagram-browser" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
  scheduler: (
    <>
      <circle cx="16" cy="16" r="11.5" className="fill-diagram-scheduler/12 stroke-diagram-scheduler" strokeWidth="2.2" />
      <path
        d="M16 9v7l4.4 2.7"
        className="stroke-diagram-scheduler"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  'anomaly-engine': (
    <>
      <rect x="4" y="4" width="24" height="24" rx="6" className="fill-diagram-engine/12 stroke-diagram-engine" strokeWidth="2.2" />
      <path
        d="M7.5 17.5h3.6l2.6-6.5 4.2 11 2.4-4.5h4.2"
        className="stroke-diagram-engine"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  alerting: (
    <>
      <path
        d="M16 5a7 7 0 0 0-7 7v4.1c0 1.3-.5 2.5-1.3 3.4l-1 1.1c-.8.9-.2 2.4 1 2.4h16.6c1.2 0 1.8-1.5 1-2.4l-1-1.1a5.1 5.1 0 0 1-1.3-3.4V12a7 7 0 0 0-7-7z"
        className="fill-diagram-alert"
      />
      <path d="M12.8 25a3.2 3.2 0 0 0 6.4 0z" className="fill-diagram-alert" />
      <path
        d="M4.6 10.2a11 11 0 0 1 3-5.6M27.4 10.2a11 11 0 0 0-3-5.6"
        className="stroke-diagram-alert"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="5" width="26" height="22" rx="4" className="fill-surface stroke-diagram-browser" strokeWidth="2" />
      <path d="M3 11.5h26" className="stroke-diagram-browser" strokeWidth="2" fill="none" />
      <circle cx="7.4" cy="8.3" r="1.1" className="fill-diagram-browser" />
      <circle cx="10.9" cy="8.3" r="1.1" className="fill-diagram-browser" />
      <circle cx="14.4" cy="8.3" r="1.1" className="fill-diagram-browser" />
      <path d="M8 16.5h9M8 21.5h14" className="stroke-diagram-edge" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  'sales-chart': (
    <>
      <rect x="5" y="17" width="5.5" height="10" rx="1.2" className="fill-diagram-chart" opacity="0.45" />
      <rect x="13.25" y="11" width="5.5" height="16" rx="1.2" className="fill-diagram-chart" opacity="0.7" />
      <rect x="21.5" y="5.5" width="5.5" height="21.5" rx="1.2" className="fill-diagram-chart" />
      <path d="M3.5 28.5h25" className="stroke-diagram-browser" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </>
  ),
}

/**
 * The icon of one architecture node: the technology's own mark where it has
 * one, a drawn glyph otherwise. Decorative, the node's name sits beside it.
 */
export function DiagramIcon({ icon, size = 28 }: DiagramIconProps) {
  if (icon.kind === 'tech') return <TechIcon tech={icon.id} size={size} />
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false" className="shrink-0">
      {glyphs[icon.id]}
    </svg>
  )
}
