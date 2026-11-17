import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Lock } from 'lucide-react'

import { site } from '../data/site.ts'
import type { Project } from '../data/types.ts'
import { cn } from '../lib/cn.ts'
import { reveal } from '../styles/tokens.ts'
import { ProjectUiCarousel } from './ProjectUiCarousel.tsx'
import { TechBadge } from './primitives/TechBadge.tsx'

interface ProjectShowcaseCardProps {
  project: Project
  /** True while this project's detail modal is open. */
  detailsOpen: boolean
  onOpenDetails: () => void
}

const copy = site.projects

/**
 * One project on the page: its real screens on the left, and on the right
 * what a visitor needs to decide whether to read on. The long form lives in
 * the detail modal.
 */
export function ProjectShowcaseCard({ project, detailsOpen, onOpenDetails }: ProjectShowcaseCardProps) {
  const titleId = `${project.anchor}-title`
  // Until a project's screens are exported, its summary stands alone rather than beside an empty frame.
  const hasScreens = project.screens.length > 0

  return (
    <motion.article
      id={project.anchor}
      aria-labelledby={titleId}
      initial={reveal.initial}
      whileInView={reveal.visible}
      viewport={reveal.viewport}
      transition={reveal.transition}
      className="grid min-w-0 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12"
    >
      {hasScreens ? (
        <div className="min-w-0 lg:col-span-7">
          <ProjectUiCarousel screens={project.screens} projectTitle={project.title} suspended={detailsOpen} />
        </div>
      ) : null}

      <div className={cn('min-w-0', hasScreens ? 'lg:col-span-5 lg:pt-2' : 'lg:col-span-7')}>
        <h3 id={titleId} className="text-ink">
          {project.title}
        </h3>
        {project.subtitle ? <p className="mt-1.5 text-lede text-ink-2">{project.subtitle}</p> : null}

        {/* A no-break space keeps each middot on the line of the part before it. */}
        <p className="mt-4 inline-block rounded-lg border border-hairline bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-2">
          {project.badge.join(' · ')}
        </p>

        <p className="mt-5 max-w-measure text-ink-2">{project.summary}</p>

        <ul aria-label={copy.modal.stack} className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <TechBadge key={item.id} item={item} />
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
          <button
            type="button"
            onClick={onOpenDetails}
            aria-haspopup="dialog"
            className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 text-left text-small font-semibold text-canvas transition-[background-color,scale] duration-150 ease-editorial hover:bg-ink-2 active:scale-[0.97]"
          >
            {copy.detailsCta}
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5"
            />
          </button>

          {project.live ? (
            <a
              href={project.live.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-6 text-small font-semibold text-ink transition-[background-color,scale] duration-150 ease-editorial hover:bg-well active:scale-[0.97]"
            >
              {project.live.label}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 text-ink-2 transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
              <span className="sr-only">({copy.opensInNewTab})</span>
            </a>
          ) : null}
        </div>

        {project.note ? (
          <p className="mt-4 flex items-start gap-2 text-small text-ink-2">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {project.note}
          </p>
        ) : null}
      </div>
    </motion.article>
  )
}
