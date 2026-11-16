import type { MonographTheme, VolumeId } from './types.ts'

// Each volume carries its own cover, accent and tint. The colour values live
// in exactly one place, src/styles/tokens.css, with the exact values from
// design/reference/spec.md. This file only names which tokens a volume uses.
export const monographThemes: Readonly<Record<VolumeId, MonographTheme>> = {
  'vol-1': {
    id: 'vol-1',
    cover: 'var(--color-vol1-cover)',
    accent: 'var(--color-vol1-accent)',
    tint: 'var(--color-vol1-tint)',
    accentOnCover: 'var(--color-vol1-accent-on-cover)',
    accentOnPaper: 'var(--color-vol1-accent-on-paper)',
  },
  'vol-2': {
    id: 'vol-2',
    cover: 'var(--color-vol2-cover)',
    accent: 'var(--color-vol2-accent)',
    tint: 'var(--color-vol2-tint)',
    accentOnCover: 'var(--color-vol2-accent-on-cover)',
    accentOnPaper: 'var(--color-vol2-accent-on-paper)',
  },
  'vol-3': {
    id: 'vol-3',
    cover: 'var(--color-vol3-cover)',
    accent: 'var(--color-vol3-accent)',
    tint: 'var(--color-vol3-tint)',
    accentOnCover: 'var(--color-vol3-accent-on-cover)',
    accentOnPaper: 'var(--color-vol3-accent-on-paper)',
  },
  'vol-4': {
    id: 'vol-4',
    cover: 'var(--color-vol4-cover)',
    accent: 'var(--color-vol4-accent)',
    tint: 'var(--color-vol4-tint)',
    accentOnCover: 'var(--color-vol4-accent-on-cover)',
    accentOnPaper: 'var(--color-vol4-accent-on-paper)',
  },
}
