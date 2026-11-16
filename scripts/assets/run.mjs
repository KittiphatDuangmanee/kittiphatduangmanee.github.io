#!/usr/bin/env node
// Runs the Python asset pipeline with the project local virtual environment,
// so `npm run assets` works the same on Windows, macOS and Linux.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const candidates = [
  join(root, '.venv', 'Scripts', 'python.exe'),
  join(root, '.venv', 'bin', 'python'),
]
const python = candidates.find((candidate) => existsSync(candidate))

if (!python) {
  console.error(
    [
      'No project virtual environment found. Create it once with:',
      '  python -m venv .venv',
      '  .venv/Scripts/python -m pip install -r scripts/assets/requirements.txt',
    ].join('\n'),
  )
  process.exit(2)
}

const result = spawnSync(python, [join(here, 'build_assets.py'), ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
