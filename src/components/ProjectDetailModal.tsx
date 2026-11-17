import { Check, X } from 'lucide-react'
import { useId, useState } from 'react'

import { site } from '../data/site.ts'
import type { Project } from '../data/types.ts'
import { DrawioArchitectureDiagram } from './DrawioArchitectureDiagram.tsx'
import { ModalDialog } from './primitives/ModalDialog.tsx'
import { TechBadge } from './primitives/TechBadge.tsx'

interface ProjectDetailModalProps {
  /** The project to show, or null when the modal is closed. */
  project: Project | null
  onClose: () => void
}

const copy = site.projects.modal

/**
 * The long form of one project: what it does and the problem behind it,
 * what I built, and the system architecture as an interactive diagram.
 * A centred modal from the md breakpoint, a bottom sheet on phones.
 */
export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const titleId = useId()
  // The last project shown stays rendered while the modal animates out.
  const [shown, setShown] = useState(project)
  if (project && project !== shown) setShown(project)

  const meta = shown ? [shown.context.organisation, shown.context.role, shown.context.period].filter(Boolean) : []

  return (
    <ModalDialog
      open={project !== null}
      onClose={onClose}
      labelledBy={titleId}
      variant="sheet"
      // overflow-clip, not overflow-hidden: a clipped box cannot be scrolled by focus, so the header always stays put.
      className="flex h-[calc(100dvh-0.75rem)] w-full max-w-5xl flex-col overflow-clip rounded-t-2xl border border-hairline bg-canvas shadow-modal md:h-auto md:max-h-full md:rounded-2xl"
    >
      {shown ? (
        <>
          <header className="border-b border-hairline bg-surface pb-4 pl-5 pr-3 pt-4 sm:pl-8 sm:pr-5 md:pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-h3 text-ink">
                  {shown.title}
                </h2>
                {/* A no-break space keeps each middot on the line of the item before it. */}
                <p className="mt-1.5 text-small text-ink-2">{meta.join(' · ')}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.close}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-[background-color,scale] duration-150 ease-editorial hover:bg-well active:scale-[0.97]"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            {/* Fixed in the header from md. On a phone the badges would fill a third of the sheet, so they scroll instead. */}
            <ul aria-label={copy.stack} className="mt-4 hidden flex-wrap gap-2 pr-3 md:flex">
              {shown.stack.map((item) => (
                <TechBadge key={item.id} item={item} />
              ))}
            </ul>
          </header>

          {/* Keyed by project, so a second project opens scrolled to the top with a fresh diagram. */}
          <div key={shown.id} className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ul aria-label={copy.stack} className="flex flex-wrap gap-2 border-b border-hairline bg-surface px-5 py-4 md:hidden">
              {shown.stack.map((item) => (
                <TechBadge key={item.id} item={item} />
              ))}
            </ul>

            <div className="grid gap-x-12 gap-y-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <section aria-labelledby={`${titleId}-overview`}>
                <h3 id={`${titleId}-overview`} className="font-sans text-lede font-semibold tracking-normal text-ink">
                  {copy.overview}
                </h3>
                <div className="mt-4 grid gap-3.5">
                  {shown.detail.overview.map((paragraph) => (
                    <p key={paragraph} className="max-w-measure text-ink-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              <section aria-labelledby={`${titleId}-built`}>
                <h3 id={`${titleId}-built`} className="font-sans text-lede font-semibold tracking-normal text-ink">
                  {copy.contributions}
                </h3>
                <ul className="mt-4 grid gap-3.5">
                  {shown.detail.contributions.map((item) => (
                    <li key={item} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 text-ink-2">
                      <Check aria-hidden="true" strokeWidth={2.5} className="mt-1 size-4 text-ink" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section aria-labelledby={`${titleId}-architecture`} className="px-5 pb-8 sm:px-8 sm:pb-10">
              <h3 id={`${titleId}-architecture`} className="font-sans text-lede font-semibold tracking-normal text-ink">
                {copy.architecture}
              </h3>
              <div className="mt-4">
                <DrawioArchitectureDiagram diagram={shown.detail.diagram} />
              </div>
            </section>
          </div>
        </>
      ) : null}
    </ModalDialog>
  )
}
