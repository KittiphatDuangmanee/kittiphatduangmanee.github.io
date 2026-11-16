import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion'
import { useRef, type CSSProperties } from 'react'

import { site } from '../data/site.ts'
import type { ProjectVolume } from '../data/types.ts'
import { useCoarsePointer } from '../hooks/useCoarsePointer.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { usePointerTilt } from '../hooks/usePointerTilt.ts'
import { depth, entrance, parallax, perspective, sheen, tilt } from '../styles/tokens.ts'
import { MonographVisual } from './monograph/MonographVisual.tsx'

interface MonographCardProps {
  project: ProjectVolume
}

/**
 * The wide 3D monograph: a landscape book cover (16:10 from the md
 * breakpoint, never a portrait ratio) with a spine, a page block and three
 * depth layers.
 *
 * Structure, outermost first. The order matters: opacity, overflow and
 * filters on a preserve-3d element flatten its children, so each concern
 * sits on its own element.
 *   1. root            scroll target, carries the volume's colour variables
 *   2. entrance        whileInView opacity, y and rotateX
 *   3. perspective     exactly card sized, owns the pointer listeners
 *   4. tilt surface    preserve-3d, rotation only, paints nothing itself
 *   5. layers          page block, cover (0px), viewport (24px), chrome (36px), sheen
 */
export function MonographCard({ project }: MonographCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionPreference()
  const coarsePointer = useCoarsePointer()
  const pointerTilt = usePointerTilt({ max: tilt.maxMonograph, disabled: reduced || coarsePointer })

  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start end', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [parallax.from, parallax.to])

  const sheenBackground = useMotionTemplate`radial-gradient(${sheen.radius}px circle at ${pointerTilt.pointerX}px ${pointerTilt.pointerY}px, var(--sheen-highlight), transparent ${sheen.falloff}%)`

  const { theme } = project
  const coverVariables = {
    '--vol-cover': theme.cover,
    '--vol-accent': theme.accent,
    '--vol-tint': theme.tint,
    '--vol-accent-ink': theme.accentOnCover,
  } as CSSProperties

  return (
    <div ref={rootRef} data-cover="" className="w-full max-w-[780px]" style={coverVariables}>
      <motion.div
        initial={entrance.initial}
        whileInView={entrance.visible}
        viewport={entrance.viewport}
        transition={entrance.transition}
        style={{ transformPerspective: perspective.monograph }}
      >
        <div
          className="relative min-h-[340px] md:aspect-[16/10] md:min-h-0"
          style={{ perspective: perspective.monograph }}
          onPointerMove={pointerTilt.handlers.onPointerMove}
          onPointerLeave={pointerTilt.handlers.onPointerLeave}
        >
          <motion.div
            className="relative flex min-h-[340px] flex-col gap-2.5 py-3 pl-9 pr-3 sm:py-3.5 sm:pl-12 sm:pr-4 md:absolute md:inset-0 md:min-h-0"
            style={{ transformStyle: 'preserve-3d', rotateX: pointerTilt.rotateX, rotateY: pointerTilt.rotateY }}
          >
            {/* Page block: the fore-edge of the book, peeking out behind the cover. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-1.5 -right-1.5 left-3 top-3 rounded-r-2xl"
              style={{ backgroundImage: 'var(--gradient-page-block)', transform: `translateZ(${depth.pageBlock}px)` }}
            />

            {/* Layer 0: cover colour, coordinate grid, spine crease, paper grain. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden rounded-l-[4px] rounded-r-2xl bg-(--vol-cover) shadow-monograph"
              style={{ transform: `translateZ(${depth.cover}px)` }}
            >
              <div className="cover-grid absolute inset-0 opacity-70" />
              <div className="absolute inset-0" style={{ backgroundImage: 'var(--gradient-cover-vignette)' }} />
              {/* Spine: the left edge of the book, with the crease and the title running down it. */}
              <div className="absolute inset-y-0 left-0 w-6 rounded-l-[4px] bg-(--vol-cover) sm:w-8">
                <div className="absolute inset-0 rounded-l-[4px]" style={{ backgroundImage: 'var(--gradient-spine-crease)' }} />
                <p className="absolute inset-x-0 bottom-9 top-4 flex items-center font-mono text-micro font-medium uppercase tracking-[0.18em] text-(--cover-ink-2) [writing-mode:vertical-rl]">
                  <span className="truncate">{project.title}</span>
                </p>
                <span className="absolute bottom-4 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-(--vol-accent)" />
              </div>
              <div className="paper-grain pointer-events-none absolute inset-0 opacity-[0.035]" />
            </div>

            {/* Layer 2, top: volume tag and domain label. */}
            <div
              className="pointer-events-none relative flex items-center justify-between gap-3"
              style={{ transform: `translateZ(${depth.chrome}px)` }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="meta-tag shrink-0 rounded-[4px] border border-(--cover-line-strong) bg-(--vol-cover) px-2 py-1 text-(--cover-ink)">
                  {project.volume.label}
                </span>
                <span className="meta-tag truncate text-(--vol-accent-ink)">{project.domainBadge}</span>
              </div>
              <span aria-hidden="true" className="hidden truncate font-display text-body italic text-(--cover-ink-2) md:block">
                {project.title}
              </span>
            </div>

            {/* Layer 1: the interactive viewport. Parallax and depth share one element. */}
            <motion.div
              className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-white/15 bg-(--vol-viewport) shadow-xl"
              style={{ y: parallaxY, z: depth.viewport }}
            >
              <MonographVisual visual={project.visual} />
            </motion.div>

            {/* Layer 2, bottom: quick metric callout and the subtitle. */}
            <div
              className="pointer-events-none relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5"
              style={{ transform: `translateZ(${depth.chrome}px)` }}
            >
              <p className="inline-flex min-h-7 items-center gap-2 rounded-full border border-(--cover-line-strong) bg-(--vol-cover) px-3 font-mono text-micro uppercase tracking-wider">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-(--vol-accent)" />
                <span className="text-(--cover-ink-2)">{project.quickMetric.label}</span>
                <span className="font-medium text-(--cover-ink)">{project.quickMetric.value}</span>
                {project.quickMetric.synthetic ? (
                  <span className="text-(--vol-accent-ink)">· {site.projects.syntheticTag}</span>
                ) : null}
              </p>
              <p className="min-w-0 truncate font-display text-small italic text-(--cover-ink-2)">{project.subtitle}</p>
            </div>

            {/* Pointer following specular sheen. */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-l-[4px] rounded-r-2xl"
              style={{ backgroundImage: sheenBackground, opacity: pointerTilt.presence, z: depth.sheen }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
