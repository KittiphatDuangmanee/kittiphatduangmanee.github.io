// The typed contract for every piece of portfolio content. Components read
// these shapes; no copy, metric or list is written inside JSX.

export type VolumeId = 'vol-1' | 'vol-2' | 'vol-3' | 'vol-4'

/** Path under public/, without the base path. Lowercase, no leading slash. */
export type AssetPath = string

/** A reference to a design token defined in src/styles/tokens.css. */
export type CssVarRef = `var(--${string})`

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

// ---------------------------------------------------------------- profile ---

/** Every technology in the personal core stack. Each one has a mark in TechIcon. */
export type TechId =
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

export interface StackItem {
  id: TechId
  label: string
}

export interface StackGroup {
  id: string
  label: string
  items: readonly StackItem[]
}

export interface CaptionLine {
  label: string
  value: string
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

// ------------------------------------------------------------------ theme ---

export interface MonographTheme {
  id: VolumeId
  cover: CssVarRef
  accent: CssVarRef
  tint: CssVarRef
  /** Accent sibling that clears 4.5:1 as small text on the cover and the tint. */
  accentOnCover: CssVarRef
  /** Accent sibling that clears 4.5:1 as small text on paper surfaces. */
  accentOnPaper: CssVarRef
}

// ----------------------------------------------------------- architecture ---

export type NodeKind =
  | 'source'
  | 'service'
  | 'gateway'
  | 'registry'
  | 'datastore'
  | 'cache'
  | 'broker'
  | 'client'
  | 'channel'
  | 'external'

export type EdgeKind = 'request' | 'event' | 'write' | 'read' | 'alert' | 'discovery'

/** One based grid cell. */
export interface GridPos {
  col: number
  row: number
}

export interface NodeMetric {
  label: string
  value: string
}

export interface ArchitectureNode {
  id: string
  label: string
  kind: NodeKind
  tech: string
  description: string
  /** Illustrative figures only. Never production data. */
  metrics: readonly NodeMetric[]
  position: { wide: GridPos; narrow: GridPos }
}

export interface ArchitectureGroup {
  id: string
  label: string
  /** Where the label starts along the top border, as a share of the frame width, so it clears incoming arrows. */
  labelAt: { wide: number; narrow: number }
  nodeIds: readonly string[]
}

export interface ArchitectureEdge {
  id: string
  /** A node id or a group id. */
  from: string
  /** A node id or a group id. */
  to: string
  kind: EdgeKind
  label: string
}

export interface ArchitectureFlow {
  id: string
  label: string
  description: string
  edgeIds: readonly string[]
}

export interface GridSize {
  cols: number
  rows: number
}

export interface ArchitectureDiagram {
  id: string
  title: string
  /** Read by screen readers in place of the drawing. */
  ariaSummary: string
  /** Honest provenance label shown on the visual. */
  notice: string
  /** Words that tell a first time visitor the drawing is interactive. */
  hint: string
  labels: {
    flows: string
    kinds: Readonly<Record<NodeKind, string>>
  }
  grid: { wide: GridSize; narrow: GridSize }
  /**
   * Empty block of the wide grid where the detail panel sits, so the drawing
   * keeps the whole viewport. On narrow layouts the panel goes underneath.
   */
  inspectorArea: GridPos & { colSpan: number; rowSpan: number }
  nodes: readonly ArchitectureNode[]
  groups: readonly ArchitectureGroup[]
  edges: readonly ArchitectureEdge[]
  flows: readonly ArchitectureFlow[]
  defaultNodeId: string
}

// --------------------------------------------------------------- previews ---

export type OrderStage = 'ordered' | 'cooking' | 'served' | 'paid'
export type OrderViewId = 'tables' | 'menu' | 'sales'

export interface OrderLine {
  itemId: string
  quantity: number
}

export interface OrderTable {
  id: string
  label: string
  guests: number
  stage: OrderStage
  lines: readonly OrderLine[]
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  available: boolean
}

export interface OrderBoardPreview {
  notice: string
  hint: string
  currencySymbol: string
  views: readonly { id: OrderViewId; label: string }[]
  stages: readonly { id: OrderStage; label: string }[]
  tables: readonly OrderTable[]
  menu: readonly MenuItem[]
  sales: {
    todayLabel: string
    todayBase: number
    days: readonly { day: string; total: number }[]
  }
  labels: {
    viewSwitcher: string
    tableList: string
    guests: string
    bill: string
    subtotal: string
    advance: string
    settled: string
    available: string
    unavailable: string
    toggleAvailability: string
    salesHeading: string
    salesCaption: string
    tablesOpen: string
    averageBill: string
  }
}

export interface XpProbability {
  label: string
  value: number
}

export interface XpSurveyProfile {
  id: string
  label: string
  survey: readonly CaptionLine[]
  prediction: {
    classLabel: string
    probabilities: readonly XpProbability[]
  }
  xpAward: number
}

export interface XpTrackerPreview {
  notice: string
  hint: string
  xpPerLevel: number
  start: { level: number; xp: number; streak: number }
  weekDays: readonly string[]
  /** How many days of the current week are already checked in. */
  daysDone: number
  profiles: readonly XpSurveyProfile[]
  labels: {
    profileSwitcher: string
    survey: string
    prediction: string
    model: string
    level: string
    xp: string
    streak: string
    streakUnit: string
    log: string
    logged: string
    reset: string
    award: string
    weekComplete: string
  }
}

/** A count of strings by state, shown beside the VOL. I diagram. Synthetic. */
export interface StringStatusSummary {
  label: string
  states: readonly { id: 'normal' | 'warning' | 'alarm'; label: string; count: number }[]
}

export type ProjectVisual =
  | { kind: 'solar-architecture'; diagram: ArchitectureDiagram; strings: StringStatusSummary }
  | { kind: 'microservices'; diagram: ArchitectureDiagram }
  | { kind: 'order-board'; preview: OrderBoardPreview }
  | { kind: 'xp-tracker'; preview: XpTrackerPreview }

// --------------------------------------------------------------- projects ---

export interface ProjectDecision {
  heading: string
  body: string
}

export interface ProjectVolume {
  id: VolumeId
  /** DOM id of the article, used by the index rail and the jump pills. */
  anchor: string
  volume: { numeral: 'I' | 'II' | 'III' | 'IV'; label: string }
  title: string
  /** Short form for the index rail and the jump pills. */
  shortTitle: string
  subtitle: string
  /** Kept as separate fields so the page never has to join them with a dash. */
  context: { role: string; organisation?: string; period?: string }
  domainBadge: string
  summary: string
  problem: readonly string[]
  decisions: readonly ProjectDecision[]
  stack: readonly string[]
  quickMetric: { label: string; value: string; synthetic: boolean }
  links: readonly ExternalLink[]
  /** Shown when there is no public repository to link to. */
  linkNote?: string
  theme: MonographTheme
  visual: ProjectVisual
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
