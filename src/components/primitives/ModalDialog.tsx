import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react'

import { useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { useMotionPreference } from '../../hooks/useMotionPreference.ts'
import { useScrollLock } from '../../hooks/useScrollLock.ts'
import { cn } from '../../lib/cn.ts'
import { modal } from '../../styles/tokens.ts'

interface ModalDialogProps {
  open: boolean
  onClose: () => void
  /** Id of the element that titles the dialog. */
  labelledBy: string
  /**
   * `centered` is a panel in the middle of the screen at every size.
   * `sheet` is the same panel from the md breakpoint, and a sheet that rises
   * from the bottom edge on phones.
   */
  variant?: 'centered' | 'sheet'
  /** Size and shape of the panel. */
  className?: string
  children: ReactNode
}

const scrim: Variants = {
  closed: { opacity: 0, transition: modal.scrimExit },
  open: { opacity: 1, transition: modal.scrimEnter },
}

const centredPanel: Variants = {
  closed: { opacity: 0, scale: modal.scaleFrom, y: modal.offsetY, transition: modal.exit },
  open: { opacity: 1, scale: 1, y: 0, transition: modal.enter },
}

const sheetPanel: Variants = {
  closed: { y: '100%', transition: modal.sheetExit },
  open: { y: 0, transition: modal.sheetEnter },
}

// Reduced motion keeps the fade and drops the travel.
const fadePanel: Variants = {
  closed: { opacity: 0, transition: modal.exit },
  open: { opacity: 1, transition: modal.exit },
}

/**
 * An animated modal on the native dialog element. showModal() gives a real
 * focus trap, makes the page behind it inert and returns focus to the control
 * that opened it. The dialog fills the viewport and draws its own blurred
 * scrim, so Framer can fade it; Escape and a click on the scrim both ask the
 * owner to close, and the dialog only leaves the top layer once the exit
 * animation has finished.
 */
export function ModalDialog({ open, onClose, labelledBy, variant = 'centered', className, children }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { reduced } = useMotionPreference()
  const fromMd = useMediaQuery('(min-width: 48rem)')
  // True from the moment the dialog opens until its exit animation ends.
  const [mounted, setMounted] = useState(open)

  if (open && !mounted) setMounted(true)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && mounted && !dialog.open) dialog.showModal()
  }, [mounted])

  useScrollLock(mounted)

  const finishClosing = () => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
    setMounted(false)
  }

  // Escape arrives as a cancel event. Hold the dialog open and let the exit play.
  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    onClose()
  }

  // The browser can close a dialog on its own (a second Escape, for one). Keep the owner in step.
  const onNativeClose = () => {
    if (open) onClose()
  }

  const asSheet = variant === 'sheet' && !fromMd
  const panel = reduced ? fadePanel : asSheet ? sheetPanel : centredPanel

  return (
    <dialog
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onCancel={onCancel}
      onClose={onNativeClose}
      className="fixed inset-0 m-0 size-full overflow-hidden bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <AnimatePresence onExitComplete={finishClosing}>
        {open ? (
          <motion.div
            key="layer"
            initial="closed"
            animate="open"
            exit="closed"
            className={cn('absolute inset-0 flex justify-center', asSheet ? 'items-end' : 'items-center p-3 sm:p-6')}
          >
            <motion.div
              aria-hidden="true"
              variants={scrim}
              onClick={onClose}
              className="absolute inset-0 bg-(--scrim-soft) backdrop-blur-[6px]"
            />
            <motion.div variants={panel} className={cn('relative', className)}>
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  )
}
