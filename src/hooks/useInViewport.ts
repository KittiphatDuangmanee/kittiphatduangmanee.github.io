import { useEffect, useState, type RefObject } from 'react'

/** True while at least `threshold` of the element is inside the viewport. */
export function useInViewport(ref: RefObject<HTMLElement | null>, threshold = 0.5): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= threshold),
      { threshold: [0, threshold, 1] },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}
