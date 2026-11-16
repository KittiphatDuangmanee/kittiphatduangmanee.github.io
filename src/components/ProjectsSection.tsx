import { ArrowUpRight, Lock } from 'lucide-react'
import { useEffect, useMemo, useRef, type CSSProperties } from 'react'

import { projects } from '../data/projects.ts'
import { site } from '../data/site.ts'
import type { ProjectVolume } from '../data/types.ts'
import { useActiveSection } from '../hooks/useActiveSection.ts'
import { cn } from '../lib/cn.ts'
import { activeSectionRootMargin } from '../styles/tokens.ts'
import { MonographCard } from './MonographCard.tsx'
import { Container } from './primitives/Container.tsx'
import { SectionHeading } from './primitives/SectionHeading.tsx'
import { StackTag } from './primitives/StackTag.tsx'

const copy = site.projects

function accentVariables(project: ProjectVolume): CSSProperties {
  return { '--vol-accent-paper': project.theme.accentOnPaper } as CSSProperties
}

/**
 * Selected works. On desktop a sticky index rail tracks the volume in view;
 * below the lg breakpoint the rail becomes a row of horizontal jump pills.
 * Each volume is a monograph card followed by its editorial breakdown.
 */
export function ProjectsSection() {
  const anchors = useMemo(() => projects.map((project) => project.anchor), [])
  const activeAnchor = useActiveSection(anchors, activeSectionRootMargin)
  const pillsRef = useRef<HTMLOListElement>(null)

  // Keep the active pill in view inside its own scroller. scrollTo on the
  // list, never scrollIntoView, so the page itself does not move.
  useEffect(() => {
    const list = pillsRef.current
    const active = list?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!list || !active) return
    const target = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2
    list.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [activeAnchor])

  return (
    <section id={copy.id} aria-labelledby="projects-heading" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <SectionHeading
          headingId="projects-heading"
          eyebrow={copy.eyebrow}
          heading={copy.heading}
          lede={copy.lede}
        />
      </Container>

      {/* Below lg: horizontal jump pills, pinned under the navigation bar. */}
      <nav
        aria-label={copy.pillsLabel}
        className="sticky top-16 z-(--z-rail) border-y border-hairline bg-canvas/90 backdrop-blur-md lg:hidden"
      >
        <div className="relative mx-auto max-w-7xl">
          <ol ref={pillsRef} className="scrollbar-none flex gap-2 overflow-x-auto px-5 py-2 sm:px-8">
            {projects.map((project) => {
              const active = project.anchor === activeAnchor
              return (
                <li key={project.id} className="shrink-0" style={accentVariables(project)}>
                  <a
                    href={`#${project.anchor}`}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-full border px-4 transition-colors duration-200 ease-monograph',
                      active ? 'border-ink bg-ink text-canvas' : 'border-hairline bg-surface text-ink-2',
                    )}
                  >
                    <span className="meta-tag">{project.volume.label}</span>
                    <span className="text-small font-medium">{project.shortTitle}</span>
                  </a>
                </li>
              )
            })}
          </ol>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-canvas to-transparent"
          />
        </div>
      </nav>

      <Container className="pb-20 pt-12 lg:pb-28 lg:pt-0">
        <div className="grid gap-10 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label={copy.railLabel} className="sticky top-28">
              <p className="meta-tag text-ink-2">{copy.railHint}</p>
              <ol className="mt-4 grid gap-1">
                {projects.map((project) => {
                  const active = project.anchor === activeAnchor
                  return (
                    <li key={project.id} style={accentVariables(project)}>
                      <a
                        href={`#${project.anchor}`}
                        aria-current={active ? 'true' : undefined}
                        className="group flex min-h-11 items-center gap-3"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'h-px shrink-0 transition-all duration-300 ease-monograph',
                            active ? 'w-10 bg-(--vol-accent-paper)' : 'w-5 bg-ink-3 group-hover:w-7 group-hover:bg-ink-2',
                          )}
                        />
                        <span className="min-w-0">
                          <span
                            className={cn(
                              'meta-tag block transition-colors duration-300 ease-monograph',
                              active ? 'text-(--vol-accent-paper)' : 'text-ink-2',
                            )}
                          >
                            {project.volume.label}
                          </span>
                          <span
                            className={cn(
                              'block truncate text-small transition-colors duration-300 ease-monograph',
                              active ? 'font-semibold text-ink' : 'text-ink-2 group-hover:text-ink',
                            )}
                          >
                            {project.shortTitle}
                          </span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </aside>

          <div className="grid min-w-0 gap-20 lg:col-span-9 lg:gap-28">
            {projects.map((project) => (
              <ProjectArticle key={project.id} project={project} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

interface ProjectArticleProps {
  project: ProjectVolume
}

/** One volume: heading, the 3D monograph card, then the editorial breakdown. */
function ProjectArticle({ project }: ProjectArticleProps) {
  const titleId = `${project.anchor}-title`
  const context = [project.context.role, project.context.organisation, project.context.period].filter(Boolean)

  return (
    <article
      id={project.anchor}
      aria-labelledby={titleId}
      className="min-w-0 scroll-mt-32 lg:scroll-mt-28"
      style={accentVariables(project)}
    >
      <header>
        <p className="meta-tag flex flex-wrap items-center gap-x-2.5 gap-y-1 text-ink-2">
          <span className="text-(--vol-accent-paper)">{project.volume.label}</span>
          {context.map((entry) => (
            <span key={entry} className="flex items-center gap-2.5">
              <span aria-hidden="true">·</span>
              {entry}
            </span>
          ))}
        </p>
        <h3 id={titleId} className="mt-3 text-ink">
          {project.title}
        </h3>
        <p className="mt-3 max-w-measure text-lede text-ink-2">{project.summary}</p>
      </header>

      <div className="mt-8">
        <MonographCard project={project} />
      </div>

      <div className="mt-10 grid max-w-[780px] gap-x-10 gap-y-9 md:grid-cols-2">
        <section aria-labelledby={`${project.anchor}-problem`}>
          <h4 id={`${project.anchor}-problem`} className="meta-tag border-b border-hairline pb-2.5 text-ink">
            {copy.sections.problem}
          </h4>
          <div className="mt-4 grid gap-3">
            {project.problem.map((paragraph) => (
              <p key={paragraph} className="text-ink-2">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby={`${project.anchor}-decisions`}>
          <h4 id={`${project.anchor}-decisions`} className="meta-tag border-b border-hairline pb-2.5 text-ink">
            {copy.sections.decisions}
          </h4>
          <ol className="mt-4 grid gap-4">
            {project.decisions.map((decision, index) => (
              <li key={decision.heading} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
                <span aria-hidden="true" className="pt-0.5 font-mono text-meta text-(--vol-accent-paper)">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-semibold text-ink">{decision.heading}</p>
                  <p className="mt-1 text-small text-ink-2">{decision.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`${project.anchor}-stack`}>
          <h4 id={`${project.anchor}-stack`} className="meta-tag border-b border-hairline pb-2.5 text-ink">
            {copy.sections.stack}
          </h4>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <StackTag key={item} label={item} />
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${project.anchor}-links`}>
          <h4 id={`${project.anchor}-links`} className="meta-tag border-b border-hairline pb-2.5 text-ink">
            {copy.sections.links}
          </h4>
          {project.links.length > 0 ? (
            <ul className="mt-4 grid gap-1">
              {project.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex min-h-11 items-center gap-2 font-medium text-ink underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-200 ease-monograph hover:decoration-(--vol-accent-paper)"
                  >
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-ink-2 transition-transform duration-300 ease-monograph group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                    <span className="sr-only">({copy.opensInNewTab})</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {project.linkNote ? (
            <p className="mt-4 flex items-start gap-2 text-small text-ink-2">
              <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {project.linkNote}
            </p>
          ) : null}
        </section>
      </div>
    </article>
  )
}
