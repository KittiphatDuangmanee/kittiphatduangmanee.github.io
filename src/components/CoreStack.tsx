import { profile } from '../data/profile.ts'
import { site } from '../data/site.ts'
import { TechBadge } from './primitives/TechBadge.tsx'

/**
 * The personal core stack: four categories in a two by two grid, each
 * technology a small badge with its mark. Hands-on skills only.
 */
export function CoreStack() {
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
                  <TechBadge key={item.id} item={item} />
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
