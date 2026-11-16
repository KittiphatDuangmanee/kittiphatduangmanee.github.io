import { useEffect } from 'react'

/**
 * Stops the page behind a modal from scrolling. The stylesheet keeps
 * `scrollbar-gutter: stable` on the root, so locking never shifts the layout.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    const root = document.documentElement
    root.setAttribute('data-scroll-lock', '')
    return () => root.removeAttribute('data-scroll-lock')
  }, [locked])
}
