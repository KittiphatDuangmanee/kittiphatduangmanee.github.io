import { useEffect } from 'react'

interface ScopedArrowKeys {
  /** Listen only while this is true. */
  enabled: boolean
  onPrevious: () => void
  onNext: () => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * ArrowLeft and ArrowRight for one region of the page. The listener exists
 * only while `enabled` is true, so the keys never fire for a region the
 * reader is not looking at, and never while a dialog owns the keyboard.
 */
export function useScopedArrowKeys({ enabled, onPrevious, onNext }: ScopedArrowKeys): void {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onPrevious, onNext])
}
