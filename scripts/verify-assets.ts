// Asset integrity check. Every .webp and .pdf referenced from src/data must
// exist under public/ (or dist/ after a build), with the exact letter case
// GitHub Pages will serve, be non empty, and be the file type it claims.
//
//   node scripts/verify-assets.ts          checks public/
//   node scripts/verify-assets.ts dist     checks dist/

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { certificates } from '../src/data/certificates.ts'
import { profile } from '../src/data/profile.ts'

interface Reference {
  path: string
  owner: string
  width?: number
  height?: number
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const targetName = process.argv[2] ?? 'public'
const target = join(root, targetName)

const references: Reference[] = [
  { path: profile.avatar.src, owner: 'profile.avatar', width: profile.avatar.width, height: profile.avatar.height },
]
for (const certificate of certificates) {
  const { thumb, full } = certificate.preview
  references.push({ path: thumb.src, owner: `${certificate.id}.thumb`, width: thumb.width, height: thumb.height })
  references.push({ path: full.src, owner: `${certificate.id}.full`, width: full.width, height: full.height })
  references.push({ path: certificate.document.href, owner: `${certificate.id}.document` })
}

const problems: string[] = []

/** True only when every path segment matches a directory entry exactly. */
function existsWithExactCase(relativePath: string): boolean {
  let current = target
  for (const segment of relativePath.split('/')) {
    if (!existsSync(current) || !readdirSync(current).includes(segment)) return false
    current = join(current, segment)
  }
  return true
}

function webpSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') return null
  const chunk = bytes.toString('ascii', 12, 16)
  if (chunk === 'VP8X') {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) }
  }
  if (chunk === 'VP8 ') {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff }
  }
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21)
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
  }
  return null
}

for (const reference of references) {
  const { path, owner } = reference
  if (path !== path.toLowerCase()) problems.push(`${owner}: path is not lowercase: ${path}`)
  if (path.startsWith('/')) problems.push(`${owner}: path must not start with a slash: ${path}`)
  if (!existsWithExactCase(path)) {
    problems.push(`${owner}: missing in ${targetName}/ (exact case): ${path}`)
    continue
  }
  const file = join(target, path)
  if (statSync(file).size === 0) {
    problems.push(`${owner}: empty file: ${path}`)
    continue
  }
  const bytes = readFileSync(file)
  if (path.endsWith('.pdf')) {
    if (bytes.toString('ascii', 0, 5) !== '%PDF-') problems.push(`${owner}: not a PDF: ${path}`)
  } else if (path.endsWith('.webp')) {
    const size = webpSize(bytes)
    if (!size) {
      problems.push(`${owner}: not a WebP image: ${path}`)
    } else if (size.width !== reference.width || size.height !== reference.height) {
      problems.push(
        `${owner}: data says ${reference.width}x${reference.height}, file is ${size.width}x${size.height}: ${path}`,
      )
    }
  } else {
    problems.push(`${owner}: unexpected file type: ${path}`)
  }
}

// Files that sit in the published folders but that nothing references.
const referenced = new Set(references.map((reference) => reference.path))
for (const folder of ['images', 'images/certificates', 'certificates']) {
  const directory = join(target, folder)
  if (!existsSync(directory)) continue
  for (const name of readdirSync(directory)) {
    const relative = `${folder}/${name}`
    if (statSync(join(directory, name)).isFile() && !referenced.has(relative)) {
      problems.push(`orphan file, not referenced by src/data: ${relative}`)
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`FAIL  ${problem}`)
  console.error(`\n${problems.length} asset problem(s) in ${targetName}/`)
  process.exit(1)
}
console.log(`assets ok: ${references.length} referenced files present in ${targetName}/, exact case, right type and size`)
