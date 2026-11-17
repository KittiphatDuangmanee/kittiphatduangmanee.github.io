import { motion } from 'framer-motion'
import { FileText, X } from 'lucide-react'
import { useEffect, useId, useRef, type MouseEvent } from 'react'

import { site } from '../data/site.ts'
import type { CertificateItem } from '../data/types.ts'
import { useScrollLock } from '../hooks/useScrollLock.ts'
import { asset } from '../lib/asset.ts'
import { duration, ease } from '../styles/tokens.ts'

interface CertificateLightboxProps {
  /** The certificate to show, or null when the lightbox is closed. */
  certificate: CertificateItem | null
  onClose: () => void
}

const copy = site.certifications

/**
 * Lightbox for one certificate: the high resolution preview, who issued it
 * and when, and a link to the original PDF.
 *
 * Built on the native dialog element opened with showModal(), which gives a
 * real focus trap, makes the page behind it inert, closes on Escape and
 * returns focus to the card that opened it. It renders in the top layer, so
 * the 3D stage it was opened from cannot trap or clip it.
 */
export function CertificateLightbox({ certificate, onClose }: CertificateLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const open = certificate !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useScrollLock(open)

  // A click on the backdrop reports the dialog itself as its target.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onDialogClick}
      className="m-auto w-[min(56rem,calc(100vw-1.5rem))] max-w-4xl overflow-visible bg-transparent p-0 text-ink"
    >
      {certificate ? (
        <motion.div
          key={certificate.id}
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: duration.state, ease }}
          className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-modal"
        >
          <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="meta-tag text-ink-2">{certificate.kind}</p>
              <h2 id={titleId} className="mt-1 text-h3 text-ink">
                {certificate.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.lightbox.close}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-hairline text-ink transition-colors duration-200 ease-editorial hover:bg-well"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="bg-well p-3 sm:p-5">
              <img
                src={asset(certificate.preview.full.src)}
                width={certificate.preview.full.width}
                height={certificate.preview.full.height}
                alt={certificate.preview.full.alt}
                decoding="async"
                className="mx-auto h-auto max-h-[58dvh] w-auto max-w-full rounded-[4px] border border-hairline bg-surface object-contain"
              />
            </div>

            <div className="grid gap-5 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="min-w-0">
                <dl className="flex flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <dt className="meta-tag text-ink-2">{copy.lightbox.issuer}</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{certificate.issuer}</dd>
                  </div>
                  <div>
                    <dt className="meta-tag text-ink-2">{copy.lightbox.issued}</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{certificate.issued.label}</dd>
                  </div>
                </dl>
                <p className="mt-3 max-w-measure text-small text-ink-2">{certificate.summary}</p>
              </div>
              <a
                href={asset(certificate.document.href)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-small font-semibold text-canvas transition-colors duration-200 ease-editorial hover:bg-ink-2"
              >
                <FileText aria-hidden="true" className="size-4" />
                {certificate.document.label}
              </a>
            </div>
          </div>
        </motion.div>
      ) : null}
    </dialog>
  )
}
