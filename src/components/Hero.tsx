import { motion } from 'framer-motion'
import { ArrowDown, Briefcase, GraduationCap, MapPin, type LucideIcon } from 'lucide-react'

import { profile } from '../data/profile.ts'
import { site } from '../data/site.ts'
import { asset } from '../lib/asset.ts'
import { duration, ease } from '../styles/tokens.ts'
import { CoreStack } from './CoreStack.tsx'
import { InteractiveBackground } from './InteractiveBackground.tsx'
import { Container } from './primitives/Container.tsx'

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0 },
}

const riseTransition = { duration: duration.state * 1.8, ease }

interface Fact {
  label: string
  Icon: LucideIcon
  value: string
  detail: string
}

const facts: readonly Fact[] = [
  {
    label: site.hero.educationLabel,
    Icon: GraduationCap,
    value: profile.education.degree,
    detail: `${profile.education.institution}, ${profile.education.year}`,
  },
  {
    label: site.hero.experienceLabel,
    Icon: Briefcase,
    value: profile.experience.role,
    detail: `${profile.experience.organisation} (${profile.experience.period})`,
  },
  {
    label: site.hero.locationLabel,
    Icon: MapPin,
    value: profile.location.place,
    detail: profile.location.detail,
  },
]

/** Asymmetric hero: name, role and one action on the left, portrait on the right. */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative">
      <InteractiveBackground />
      <Container className="relative grid gap-12 py-20 lg:grid-cols-12 lg:items-start lg:gap-10 lg:py-28">
        <motion.div
          className="min-w-0 lg:col-span-7"
          initial="hidden"
          animate="shown"
          transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
        >
          <motion.h1 id="hero-title" variants={rise} transition={riseTransition} className="text-ink">
            {profile.name.full}
          </motion.h1>

          <motion.p
            variants={rise}
            transition={riseTransition}
            className="mt-3 text-2xl font-semibold tracking-tight text-ink-2 sm:text-3xl"
          >
            {profile.role}
          </motion.p>

          <motion.p
            variants={rise}
            transition={riseTransition}
            className="mt-6 max-w-xl text-base leading-relaxed text-ink-2 sm:text-[17px]"
          >
            {profile.bio}
          </motion.p>

          <motion.div variants={rise} transition={riseTransition} className="mt-8">
            <a
              href={site.hero.cta.href}
              className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 text-small font-semibold text-canvas transition-[background-color,scale] duration-150 ease-monograph hover:bg-ink-2 active:scale-[0.97]"
            >
              {site.hero.cta.label}
              <ArrowDown
                aria-hidden="true"
                className="size-4 transition-transform duration-300 ease-monograph group-hover:translate-y-0.5"
              />
            </a>
          </motion.div>

          <motion.dl
            variants={rise}
            transition={riseTransition}
            className="mt-12 grid gap-x-8 gap-y-6 border-t border-hairline pt-6 sm:grid-cols-[1.35fr_1.25fr_1fr]"
          >
            {facts.map(({ label, Icon, value, detail }) => (
              <div key={label} className="min-w-0">
                <dt className="meta-tag flex items-center gap-2 text-ink-2">
                  <Icon aria-hidden="true" strokeWidth={1.75} className="size-3.5 shrink-0" />
                  {label}
                </dt>
                <dd className="mt-2 text-small font-semibold text-ink">{value}</dd>
                <dd className="text-small text-ink-2">{detail}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div variants={rise} transition={riseTransition} className="mt-8 border-t border-hairline pt-6">
            <CoreStack />
          </motion.div>
        </motion.div>

        {/* On wide screens the portrait starts level with the name and stays beside the column as it scrolls. */}
        <motion.figure
          className="mx-auto w-full max-w-[360px] rounded-2xl border border-hairline bg-surface p-2.5 shadow-portrait lg:sticky lg:top-24 lg:col-span-5 lg:justify-self-end"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.state * 2.2, ease, delay: 0.15 }}
        >
          {/* The inner radius is the card radius minus its padding, so the corners stay concentric. */}
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-well">
            <img
              src={asset(profile.avatar.src)}
              width={profile.avatar.width}
              height={profile.avatar.height}
              alt={profile.avatar.alt}
              fetchPriority="high"
              decoding="async"
              className="size-full object-cover object-bottom"
            />
          </div>
          <figcaption className="px-1.5 pb-1.5 pt-3.5">
            <span className="block font-semibold leading-snug text-ink">{profile.name.display}</span>
            <span className="mt-1 block text-xs text-ink-2">
              {profile.education.degree}, {profile.education.institution}
            </span>
          </figcaption>
        </motion.figure>
      </Container>
    </section>
  )
}
