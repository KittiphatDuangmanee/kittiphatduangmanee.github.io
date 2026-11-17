import { motion } from 'framer-motion'

import type { StackItem } from '../../data/types.ts'
import { useMotionPreference } from '../../hooks/useMotionPreference.ts'
import { badgeHover } from '../../styles/tokens.ts'
import { TechIcon } from './TechIcon.tsx'

interface TechBadgeProps {
  item: StackItem
}

/**
 * One technology as a badge: its 16px mark beside its name. Rendered as a
 * list item. The hero core stack and every project stack use this one
 * component, so the two always look the same.
 */
export function TechBadge({ item }: TechBadgeProps) {
  const { reduced } = useMotionPreference()

  return (
    <motion.li
      // Reduced motion keeps the border change and drops the lift.
      whileHover={reduced ? undefined : { y: badgeHover.lift }}
      transition={badgeHover.spring}
      className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-badge transition-colors hover:border-hairline-strong"
    >
      <TechIcon tech={item.id} />
      {item.label}
    </motion.li>
  )
}
