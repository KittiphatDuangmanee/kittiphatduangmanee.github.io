import { useId } from 'react'

import type { TechId } from '../../data/types.ts'
import { cn } from '../../lib/cn.ts'
import { techIconPaths } from './tech-icon-paths.ts'

interface TechIconProps {
  tech: TechId
  /** Edge length in px. 16 in a badge, larger on an architecture diagram node. */
  size?: number
  className?: string
}

/**
 * How a mark is coloured. Most take one brand colour. A few logos are two
 * tone with a clean horizontal break, so they are split at a height on the
 * 24 unit grid: `upper` above the line, `lower` below it.
 */
type TechTone =
  | { fill: string }
  | { upper: string; lower: string; splitAt: number }

// Class names are written out in full so Tailwind emits each brand token.
const tones: Record<TechId, TechTone> = {
  python: { fill: 'fill-brand-python' },
  fastapi: { fill: 'fill-brand-fastapi' },
  java: { upper: 'text-brand-java', lower: 'text-brand-java-cup', splitAt: 10 },
  'spring-boot': { fill: 'fill-brand-spring' },
  'spring-cloud-gateway': { fill: 'fill-brand-spring' },
  rabbitmq: { fill: 'fill-brand-rabbitmq' },
  typescript: { fill: 'fill-brand-typescript' },
  react: { fill: 'fill-brand-react' },
  angular: { fill: 'fill-brand-angular' },
  'tailwind-css': { fill: 'fill-brand-tailwind' },
  postgresql: { fill: 'fill-brand-postgresql' },
  timescaledb: { fill: 'fill-brand-timescale' },
  // The dolphin is drawn in fine lines, so a hairline stroke keeps it legible at 16px.
  mysql: { fill: 'fill-brand-mysql stroke-brand-mysql [stroke-width:0.3]' },
  redis: { fill: 'fill-brand-redis' },
  docker: { fill: 'fill-brand-docker' },
  aws: { upper: 'text-brand-aws-ink', lower: 'text-brand-aws', splitAt: 13 },
  git: { fill: 'fill-brand-git' },
  // Tools used in a single project.
  hono: { fill: 'fill-brand-hono' },
  // Drizzle's own lime cannot be seen on white, so its mark is set in ink.
  'drizzle-orm': { fill: 'fill-ink' },
  cockroachdb: { fill: 'fill-brand-cockroachdb' },
  'cloudflare-workers': { fill: 'fill-brand-cloudflare' },
  'line-messaging-api': { fill: 'fill-brand-line' },
  smtp: { fill: 'fill-ink-2' },
}

// Marks that fill only part of the 24 unit grid are cropped to their artwork.
const viewBoxes: Partial<Record<TechId, string>> = {
  mysql: '13.8 3.3 10.4 10.4',
}

/**
 * A technology mark in its brand colour. Decorative: the name always sits
 * beside it as text, so the icon is hidden from assistive technology.
 */
export function TechIcon({ tech, size = 16, className }: TechIconProps) {
  const gradientId = useId()
  const tone = tones[tech]

  return (
    <svg
      viewBox={viewBoxes[tech] ?? '0 0 24 24'}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      {'fill' in tone ? (
        <path d={techIconPaths[tech]} className={tone.fill} />
      ) : (
        <>
          <defs>
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="24">
              <stop offset={tone.splitAt / 24} stopColor="currentColor" className={tone.upper} />
              <stop offset={tone.splitAt / 24} stopColor="currentColor" className={tone.lower} />
            </linearGradient>
          </defs>
          <path d={techIconPaths[tech]} fill={`url(#${gradientId})`} />
        </>
      )}
    </svg>
  )
}
