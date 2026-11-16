import { useReducedMotion } from 'framer-motion'

import { forcedReducedMotion } from '../lib/motion-preference.ts'

/**
 * MotionConfig reducedMotion="user" only quiets Framer's own animations.
 * Anything driven directly by motion values (pointer tilt, the sheen, scroll
 * parallax) has to check this hook and hold still when it returns true.
 */
export function useMotionPreference(): { reduced: boolean } {
  const systemPrefersReduced = useReducedMotion()
  return { reduced: forcedReducedMotion || Boolean(systemPrefersReduced) }
}
