import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'

import { site } from '../data/site.ts'
import type { ProjectScreen } from '../data/types.ts'
import { asset } from '../lib/asset.ts'
import { ModalDialog } from './primitives/ModalDialog.tsx'

interface ScreenshotLightboxProps {
  screens: readonly ProjectScreen[]
  /** Index of the screen to show, or null when the lightbox is closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

const copy = site.projects

const roundButton =
  'grid size-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-ink transition-[background-color,scale] duration-150 ease-editorial hover:bg-well active:scale-[0.97]'

/**
 * One project screen at full resolution, with its caption. The arrow keys
 * and the two buttons step through the rest of the set.
 */
export function ScreenshotLightbox({ screens, index, onIndexChange, onClose }: ScreenshotLightboxProps) {
  const titleId = useId()
  // The last screen shown stays rendered while the dialog animates out.
  const [lastIndex, setLastIndex] = useState(index ?? 0)
  if (index !== null && index !== lastIndex) setLastIndex(index)

  const count = screens.length
  const current = index ?? lastIndex
  const shown = screens[current] ?? screens[0]

  const step = (delta: number) => onIndexChange((current + delta + count) % count)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2 || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  }

  return (
    <ModalDialog
      open={index !== null}
      onClose={onClose}
      labelledBy={titleId}
      className="flex max-h-full w-full max-w-[90rem] flex-col overflow-clip rounded-xl border border-hairline bg-surface shadow-modal"
    >
      <div onKeyDown={onKeyDown} className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-hairline py-3 pl-5 pr-3 sm:pl-6">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-sans text-body font-semibold tracking-normal text-ink">
              {shown.title}
            </h2>
            {count > 1 ? (
              <p className="text-small text-ink-2">
                {current + 1} {copy.carousel.counterSeparator} {count}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {count > 1 ? (
              <>
                <button type="button" onClick={() => step(-1)} aria-label={copy.carousel.previous} className={roundButton}>
                  <ArrowLeft aria-hidden="true" className="size-5" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label={copy.carousel.next} className={roundButton}>
                  <ArrowRight aria-hidden="true" className="size-5" />
                </button>
              </>
            ) : null}
            <button type="button" onClick={onClose} aria-label={copy.modal.close} className={roundButton}>
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
        </header>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto bg-well p-3 sm:p-5">
          <img
            key={shown.id}
            src={asset(shown.full.src)}
            width={shown.full.width}
            height={shown.full.height}
            alt={shown.full.alt}
            decoding="async"
            className="mx-auto h-auto max-h-[calc(100dvh-14.5rem)] w-auto max-w-full rounded-md border border-hairline bg-surface object-contain"
          />
        </div>

        <p aria-live="polite" className="border-t border-hairline px-5 py-3.5 text-small text-ink-2 sm:px-6">
          {shown.caption}
        </p>
      </div>
    </ModalDialog>
  )
}
