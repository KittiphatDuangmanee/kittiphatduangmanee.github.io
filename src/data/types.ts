// The typed contract for every piece of portfolio content. Components read
// these shapes; no copy, metric or list is written inside JSX.

/** Path under public/, without the base path. Lowercase, no leading slash. */
export type AssetPath = string

export interface ImageAsset {
  src: AssetPath
  width: number
  height: number
  alt: string
}

export type LinkKind = 'github' | 'linkedin' | 'leetcode' | 'email' | 'repo' | 'demo'

export interface ExternalLink {
  label: string
  href: string
  kind: LinkKind
}

// ------------------------------------------------------------- technology ---

/** Every technology in the personal core stack: verified hands-on skills. */
export type CoreTechId =
  | 'python'
  | 'fastapi'
  | 'java'
  | 'spring-boot'
  | 'spring-cloud-gateway'
  | 'rabbitmq'
  | 'typescript'
  | 'react'
  | 'angular'
  | 'tailwind-css'
  | 'postgresql'
  | 'timescaledb'
  | 'mysql'
  | 'redis'
  | 'docker'
  | 'aws'
  | 'git'

/** Tools used in a single project. They never appear in the core stack. */
export type ProjectTechId =
  | 'hono'
  | 'drizzle-orm'
  | 'cockroachdb'
  | 'cloudflare-workers'
  | 'line-messaging-api'
  | 'smtp'

/** Every technology with a mark in TechIcon. */
export type TechId = CoreTechId | ProjectTechId

export interface StackItem<Id extends TechId = TechId> {
  id: Id
  label: string
}

// ---------------------------------------------------------------- profile ---

export interface StackGroup {
  id: string
  label: string
  /** Typed to the core stack, so a project-only tool cannot be listed here. */
  items: readonly StackItem<CoreTechId>[]
}

export interface ProfileData {
  name: {
    full: string
    nickname: string
    /** Full name with the nickname in parentheses after it. Never quoted mid name. */
    display: string
    monogram: string
  }
  role: string
  bio: string
  focus: readonly string[]
  education: { degree: string; institution: string; year: number }
  experience: { role: string; organisation: string; period: string }
  location: { place: string; detail: string }
  stackGroups: readonly StackGroup[]
  avatar: ImageAsset
  email: string
  links: readonly ExternalLink[]
}

// ----------------------------------------------------------- architecture ---

/** Icons drawn for the diagram, for components that have no brand mark. */
export type DiagramGlyphId = 'solar-array' | 'scheduler' | 'anomaly-engine' | 'alerting' | 'browser' | 'sales-chart'

export type DiagramIcon = { kind: 'tech'; id: TechId } | { kind: 'glyph'; id: DiagramGlyphId }

/** One based grid cell. */
export interface GridPos {
  col: number
  row: number
}

export interface GridSize {
  cols: number
  rows: number
}

export type NodeSide = 'top' | 'right' | 'bottom' | 'left'

export interface ArchitectureNode {
  id: string
  label: string
  /** Compact technology line under the label. */
  tech: string
  icon: DiagramIcon
  /** What flows into the component. */
  input: string
  /** What it hands on. */
  output: string
  /** The engineering decision behind it. */
  decision: string
  /** Cell in the wide layout. Narrow layouts transpose the grid. */
  position: GridPos
}

export interface ArchitectureEdge {
  id: string
  from: string
  to: string
  label: string
  /**
   * Which side the connector leaves and which it enters, in the wide layout.
   * `fromAt` and `toAt` place it along that side (0 to 1, 0.5 by default) so
   * two connectors on one side never share a point.
   */
  route: { from: NodeSide; to: NodeSide; fromAt?: number; toAt?: number }
}

export interface ArchitectureFlow {
  id: string
  label: string
  description: string
  edgeIds: readonly string[]
}

export interface ArchitectureDiagram {
  id: string
  title: string
  /** One sentence shown in the inspector until a component is selected. */
  summary: string
  /** Read by screen readers in place of the drawing. */
  ariaSummary: string
  /** Grid of the wide layout. */
  grid: GridSize
  nodes: readonly ArchitectureNode[]
  edges: readonly ArchitectureEdge[]
  flows: readonly ArchitectureFlow[]
}

// --------------------------------------------------------------- projects ---

export type ProjectId = 'solar' | 'orderdi'

/** One real screen of the product: a capture or an exported design frame. */
export interface ProjectScreen {
  id: string
  /** Short name shown in the window chrome. */
  title: string
  /** One sentence on what the screen shows. */
  caption: string
  /** 16:10 crop for the carousel. */
  card: ImageAsset
  /** The whole frame at full resolution, for the zoom view. */
  full: ImageAsset
}

export interface Project {
  id: ProjectId
  /** DOM id of the article. */
  anchor: string
  title: string
  subtitle?: string
  /** Role or context, as parts the page joins with a middot. Never a dash. */
  badge: readonly string[]
  context: { role: string; organisation?: string; period?: string }
  /** Two or three plain sentences for the card. */
  summary: string
  stack: readonly StackItem[]
  screens: readonly ProjectScreen[]
  /** The deployed application, when there is one to visit. */
  live?: ExternalLink
  /** Shown in place of a link when the system is not public. */
  note?: string
  detail: {
    overview: readonly string[]
    contributions: readonly string[]
    diagram: ArchitectureDiagram
  }
}

// ----------------------------------------------------------- certificates ---

export interface CertificateItem {
  id: string
  title: string
  issuer: string
  /** What kind of document this is, stated honestly. */
  kind: string
  issued: { year: number; label: string }
  summary: string
  preview: { thumb: ImageAsset; full: ImageAsset }
  document: { href: AssetPath; label: string }
}
