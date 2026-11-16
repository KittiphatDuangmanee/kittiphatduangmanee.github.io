import { useEffect, useState } from 'react'

/**
 * Tracks which of the given element ids currently sits in a band of the
 * viewport (set by rootMargin). Used to sync the sticky volume index with
 * scroll position. The last active id is kept while nothing intersects, so
 * the indicator never blanks between two sections.
 */
export function useActiveSection(ids: readonly string[], rootMargin: string): string {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const intersecting = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id)
          else intersecting.delete(entry.target.id)
        }
        // With two sections in the band at once, the earlier one in the
        // document wins.
        const first = ids.find((id) => intersecting.has(id))
        if (first) setActiveId(first)
      },
      { rootMargin, threshold: 0 },
    )
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [ids, rootMargin])

  return activeId
}
