// Structural checks on the content in src/data: the two projects are
// complete, diagram graphs are well formed, ids are unique, project-only
// tools stay out of the core stack, and no copy contains an em dash or an en
// dash (the house style uses commas, colons and middots).

import { certificates } from '../src/data/certificates.ts'
import { profile } from '../src/data/profile.ts'
import { projects } from '../src/data/projects.ts'
import { site } from '../src/data/site.ts'
import type { ArchitectureDiagram, Project } from '../src/data/types.ts'

const problems: string[] = []

const PROJECT_ONLY_TECH = ['hono', 'drizzle-orm', 'cockroachdb', 'cloudflare-workers', 'line-messaging-api', 'smtp']
const SCREENS = { min: 3, max: 5 }

function unique(values: readonly string[], what: string): void {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) problems.push(`duplicate ${what}: ${value}`)
    seen.add(value)
  }
}

function checkDiagram(diagram: ArchitectureDiagram): void {
  const nodeIds = diagram.nodes.map((node) => node.id)
  unique(nodeIds, `${diagram.id} node id`)
  unique(diagram.edges.map((edge) => edge.id), `${diagram.id} edge id`)
  unique(diagram.flows.map((flow) => flow.id), `${diagram.id} flow id`)
  const nodes = new Set(nodeIds)
  const edgeIds = new Set(diagram.edges.map((edge) => edge.id))

  const taken = new Map<string, string>()
  for (const node of diagram.nodes) {
    const { col, row } = node.position
    if (col < 1 || col > diagram.grid.cols || row < 1 || row > diagram.grid.rows) {
      problems.push(`${diagram.id}: node ${node.id} is outside the grid`)
    }
    const cell = `${col},${row}`
    const other = taken.get(cell)
    if (other) problems.push(`${diagram.id}: ${node.id} and ${other} share cell ${cell}`)
    taken.set(cell, node.id)
    for (const field of ['label', 'tech', 'input', 'output', 'decision'] as const) {
      if (node[field].trim() === '') problems.push(`${diagram.id}: node ${node.id} has an empty ${field}`)
    }
  }

  const connected = new Set<string>()
  for (const edge of diagram.edges) {
    if (!nodes.has(edge.from)) problems.push(`${diagram.id}: edge ${edge.id} starts at unknown ${edge.from}`)
    if (!nodes.has(edge.to)) problems.push(`${diagram.id}: edge ${edge.id} ends at unknown ${edge.to}`)
    if (edge.label.trim() === '') problems.push(`${diagram.id}: edge ${edge.id} has no label`)
    for (const at of [edge.route.fromAt, edge.route.toAt]) {
      if (at !== undefined && (at <= 0 || at >= 1)) problems.push(`${diagram.id}: edge ${edge.id} has an offset outside 0 to 1`)
    }
    connected.add(edge.from)
    connected.add(edge.to)
  }
  for (const nodeId of nodeIds) {
    if (!connected.has(nodeId)) problems.push(`${diagram.id}: node ${nodeId} has no connector`)
  }
  if (diagram.flows.length === 0) problems.push(`${diagram.id}: no flows to filter by`)
  for (const flow of diagram.flows) {
    for (const edgeId of flow.edgeIds) {
      if (!edgeIds.has(edgeId)) problems.push(`${diagram.id}: flow ${flow.id} lists unknown edge ${edgeId}`)
    }
  }
}

function checkProject(project: Project): void {
  const count = project.screens.length
  if (count < SCREENS.min || count > SCREENS.max) {
    problems.push(`${project.id}: has ${count} screens, expected ${SCREENS.min} to ${SCREENS.max} real ones`)
  }
  unique(project.screens.map((screen) => screen.id), `${project.id} screen id`)
  const cards = new Set(project.screens.map((screen) => `${screen.card.width}x${screen.card.height}`))
  if (cards.size > 1) problems.push(`${project.id}: carousel cards differ in size (${[...cards].join(', ')})`)
  for (const screen of project.screens) {
    if (screen.title.trim() === '' || screen.caption.trim() === '' || screen.card.alt.trim() === '') {
      problems.push(`${project.id}: screen ${screen.id} is missing a title, caption or alt text`)
    }
  }

  unique(project.stack.map((item) => item.id), `${project.id} stack id`)
  if (project.stack.length === 0) problems.push(`${project.id}: empty stack`)
  if (project.badge.length === 0) problems.push(`${project.id}: empty badge`)
  if (project.detail.overview.length === 0) problems.push(`${project.id}: no overview`)
  if (project.detail.contributions.length === 0) problems.push(`${project.id}: no contributions`)
  if (!project.live && !project.note) problems.push(`${project.id}: needs a live link or a note saying why there is none`)
  if (project.live && !project.live.href.startsWith('https://')) problems.push(`${project.id}: live link is not https`)

  const sentences = project.summary.split(/(?<=[.!?])\s+/).filter(Boolean).length
  if (sentences > 3) problems.push(`${project.id}: summary runs to ${sentences} sentences, the card allows 3`)

  checkDiagram(project.detail.diagram)
}

function checkNoDashes(value: unknown, path: string): void {
  if (typeof value === 'string') {
    if (/[–—]/.test(value)) problems.push(`dash character in copy at ${path}`)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkNoDashes(item, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) checkNoDashes(item, `${path}.${key}`)
  }
}

unique(projects.map((project) => project.id), 'project id')
unique(projects.map((project) => project.anchor), 'project anchor')
unique(certificates.map((certificate) => certificate.id), 'certificate id')
if (projects.length !== 2) problems.push(`expected 2 projects, found ${projects.length}`)
if (certificates.length !== 4) problems.push(`expected 4 certificates, found ${certificates.length}`)

for (const project of projects) checkProject(project)

// The core stack lists verified hands-on skills. The types already forbid a
// project-only tool there; this catches it in plain data as well.
for (const group of profile.stackGroups) {
  for (const item of group.items) {
    if (PROJECT_ONLY_TECH.includes(item.id)) problems.push(`core stack lists a project-only tool: ${item.id}`)
  }
}

checkNoDashes(profile, 'profile')
checkNoDashes(projects, 'projects')
checkNoDashes(certificates, 'certificates')
checkNoDashes(site, 'site')

if (problems.length > 0) {
  for (const problem of problems) console.error(`FAIL  ${problem}`)
  console.error(`\n${problems.length} data problem(s)`)
  process.exit(1)
}
console.log(
  `data ok: ${projects.length} projects, ${certificates.length} certificates, diagrams well formed, no dash characters in copy`,
)
