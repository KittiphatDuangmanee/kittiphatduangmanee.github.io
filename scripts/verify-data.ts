// Structural checks on the content in src/data: diagram graphs are well
// formed, ids are unique, previews reference real items, and no copy contains
// an em dash or an en dash (the house style uses commas, colons and middots).

import { certificates } from '../src/data/certificates.ts'
import { profile } from '../src/data/profile.ts'
import { projects } from '../src/data/projects.ts'
import { site } from '../src/data/site.ts'
import type { ArchitectureDiagram, GridPos, GridSize } from '../src/data/types.ts'

const problems: string[] = []

function unique(values: readonly string[], what: string): void {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) problems.push(`duplicate ${what}: ${value}`)
    seen.add(value)
  }
}

function checkLayout(
  diagram: ArchitectureDiagram,
  layout: 'wide' | 'narrow',
  grid: GridSize,
): void {
  const taken = new Map<string, string>()
  for (const node of diagram.nodes) {
    const position: GridPos = node.position[layout]
    if (position.col < 1 || position.col > grid.cols || position.row < 1 || position.row > grid.rows) {
      problems.push(`${diagram.id}: node ${node.id} is outside the ${layout} grid`)
    }
    const cell = `${position.col},${position.row}`
    const other = taken.get(cell)
    if (other) problems.push(`${diagram.id}: ${node.id} and ${other} share ${layout} cell ${cell}`)
    taken.set(cell, node.id)
  }
}

function checkDiagram(diagram: ArchitectureDiagram): void {
  const nodeIds = diagram.nodes.map((node) => node.id)
  const groupIds = diagram.groups.map((group) => group.id)
  unique([...nodeIds, ...groupIds], `${diagram.id} node or group id`)
  unique(diagram.edges.map((edge) => edge.id), `${diagram.id} edge id`)
  const endpoints = new Set([...nodeIds, ...groupIds])
  const edgeIds = new Set(diagram.edges.map((edge) => edge.id))

  for (const edge of diagram.edges) {
    if (!endpoints.has(edge.from)) problems.push(`${diagram.id}: edge ${edge.id} starts at unknown ${edge.from}`)
    if (!endpoints.has(edge.to)) problems.push(`${diagram.id}: edge ${edge.id} ends at unknown ${edge.to}`)
  }
  for (const group of diagram.groups) {
    for (const nodeId of group.nodeIds) {
      if (!nodeIds.includes(nodeId)) problems.push(`${diagram.id}: group ${group.id} lists unknown node ${nodeId}`)
    }
  }
  for (const flow of diagram.flows) {
    for (const edgeId of flow.edgeIds) {
      if (!edgeIds.has(edgeId)) problems.push(`${diagram.id}: flow ${flow.id} lists unknown edge ${edgeId}`)
    }
  }
  if (!nodeIds.includes(diagram.defaultNodeId)) {
    problems.push(`${diagram.id}: default node ${diagram.defaultNodeId} does not exist`)
  }
  checkLayout(diagram, 'wide', diagram.grid.wide)
  checkLayout(diagram, 'narrow', diagram.grid.narrow)
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

unique(projects.map((project) => project.id), 'volume id')
unique(projects.map((project) => project.anchor), 'volume anchor')
unique(certificates.map((certificate) => certificate.id), 'certificate id')
if (projects.length !== 4) problems.push(`expected 4 project volumes, found ${projects.length}`)
if (certificates.length !== 4) problems.push(`expected 4 certificates, found ${certificates.length}`)

for (const project of projects) {
  const visual = project.visual
  if (visual.kind === 'solar-architecture' || visual.kind === 'microservices') {
    checkDiagram(visual.diagram)
  } else if (visual.kind === 'order-board') {
    const menuIds = new Set(visual.preview.menu.map((item) => item.id))
    for (const table of visual.preview.tables) {
      for (const line of table.lines) {
        if (!menuIds.has(line.itemId)) problems.push(`orderdi: table ${table.id} orders unknown item ${line.itemId}`)
      }
    }
  } else {
    for (const surveyProfile of visual.preview.profiles) {
      const total = surveyProfile.prediction.probabilities.reduce((sum, entry) => sum + entry.value, 0)
      if (Math.abs(total - 1) > 0.001) {
        problems.push(`realworld-xp: probabilities of ${surveyProfile.id} sum to ${total.toFixed(3)}`)
      }
    }
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
  `data ok: ${projects.length} volumes, ${certificates.length} certificates, diagrams well formed, no dash characters in copy`,
)
