import { motion } from 'framer-motion'

import { profile } from '../data/profile.ts'
import { site } from '../data/site.ts'
import { useMotionPreference } from '../hooks/useMotionPreference.ts'
import { badgeHover } from '../styles/tokens.ts'
import { TechIcon } from './primitives/TechIcon.tsx'

/**
 * The personal core stack: four categories in a two by two grid, each
 * technology a small badge with its mark. Hands-on skills only.
 */
export function CoreStack() {
  const { reduced } = useMotionPreference()

  return (
    <div>
      <h2 className="font-sans text-small font-semibold tracking-normal text-ink">{site.hero.stackLabel}</h2>
      <dl className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {profile.stackGroups.map((group) => (
          <div key={group.id} className="min-w-0">
            <dt className="meta-tag mb-3 text-ink-2">{group.label}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <motion.li
                    key={item.id}
                    // Reduced motion keeps the border change and drops the lift.
                    whileHover={reduced ? undefined : { y: badgeHover.lift }}
                    transition={badgeHover.spring}
                    className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-[13px] font-medium text-ink shadow-badge transition-colors hover:border-hairline-strong"
                  >
                    <TechIcon tech={item.id} />
                    {item.label}
                  </motion.li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
