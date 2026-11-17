#!/usr/bin/env node
// Runs the prom-design-pro design gates against this project.
//
//   node scripts/gates.mjs tokens     no raw colours, numeric z-index or dashes in src/
//   node scripts/gates.mjs contrast   every text token clears 4.5:1 on its surfaces
//
// The gate scripts belong to the installed skill and are not copied into this
// repository. On a machine without the skill (for example CI) the gate is
// skipped with a notice, and the typecheck, data and asset checks still run.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const skillScripts = join(homedir(), '.claude', 'skills', 'prom-design-pro', 'scripts')
const gate = process.argv[2]

// The paper surfaces of the page, and the cool canvas of the architecture diagram.
const surfaces = ['color-canvas', 'color-surface', 'color-well', 'color-diagram-canvas']

const gates = {
  tokens: {
    script: 'token-gate.mjs',
    args: ['--src', 'src', '--src', 'index.html', '--tokens', 'tokens.css,tokens.ts'],
  },
  contrast: {
    script: 'contrast-fixture.mjs',
    args: [
      'src/styles/tokens.css',
      '--text', 'color-ink,color-ink-2',
      '--surface', surfaces.join(','),
      '--ground', 'color-canvas',
      // Inside the diagram: the selected flow filter, and a live connector label.
      '--pair', 'color-surface:color-diagram-active',
      '--pair', 'color-diagram-active:color-surface',
      '--quiet',
    ],
  },
}

const selected = gates[gate]
if (!selected) {
  console.error('usage: node scripts/gates.mjs <tokens|contrast>')
  process.exit(2)
}

const script = join(skillScripts, selected.script)
if (!existsSync(script)) {
  console.log(`gate:${gate} skipped: ${selected.script} not found (prom-design-pro skill is not installed here)`)
  process.exit(0)
}

const result = spawnSync(process.execPath, [script, ...selected.args], { stdio: 'inherit' })
process.exit(result.status ?? 1)
