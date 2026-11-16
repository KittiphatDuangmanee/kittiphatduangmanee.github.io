import { motion } from 'framer-motion'
import { Check, Flame } from 'lucide-react'
import { useState } from 'react'

import type { XpTrackerPreview } from '../data/types.ts'
import { cn } from '../lib/cn.ts'
import { duration, ease } from '../styles/tokens.ts'

interface RealWorldXpPreviewProps {
  preview: XpTrackerPreview
}

interface Progress {
  level: number
  xp: number
  streak: number
  daysDone: number
  logged: boolean
}

/**
 * VOL. IV visual: an interactive preview of the check-in loop on sample
 * data. Choose a survey, read the class the TabNet model predicts for it,
 * then log the check-in and watch XP, level and streak respond.
 */
export function RealWorldXpPreview({ preview }: RealWorldXpPreviewProps) {
  const initial: Progress = { ...preview.start, daysDone: preview.daysDone, logged: false }
  const [profileId, setProfileId] = useState(preview.profiles[0].id)
  const [progress, setProgress] = useState<Progress>(initial)

  const profile = preview.profiles.find((candidate) => candidate.id === profileId) ?? preview.profiles[0]
  const xpShare = Math.min(1, progress.xp / preview.xpPerLevel)
  const weekComplete = progress.daysDone >= preview.weekDays.length

  const logCheckIn = () => {
    setProgress((current) => {
      const total = current.xp + profile.xpAward
      return {
        level: current.level + Math.floor(total / preview.xpPerLevel),
        xp: total % preview.xpPerLevel,
        streak: current.streak + 1,
        daysDone: Math.min(preview.weekDays.length, current.daysDone + 1),
        logged: true,
      }
    })
  }

  return (
    <div className="@container h-full text-(--cover-ink)">
      <div className="flex h-full min-h-0 flex-col gap-2.5 p-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="font-mono text-micro font-medium uppercase tracking-wider text-(--vol-accent-ink)">
              {preview.notice}
            </p>
            <p className="font-mono text-micro text-(--cover-ink-2)">{preview.hint}</p>
          </div>
          <div
            role="group"
            aria-label={preview.labels.profileSwitcher}
            className="flex rounded-full border border-(--cover-line) bg-(--cover-fill) p-0.5"
          >
            {preview.profiles.map((candidate) => {
              const pressed = candidate.id === profile.id
              return (
                <button
                  key={candidate.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setProfileId(candidate.id)}
                  className={cn(
                    'min-h-8 rounded-full px-3 font-mono text-micro font-medium transition-colors duration-200 ease-monograph',
                    pressed ? 'bg-(--cover-ink) text-(--vol-cover)' : 'text-(--cover-ink-2) hover:text-(--cover-ink)',
                  )}
                >
                  {candidate.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-2.5 @lg:grid-cols-3">
          <section className="flex flex-col rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2.5">
            <p className="font-mono text-micro font-medium uppercase tracking-wider text-(--cover-ink-2)">
              {preview.labels.survey}
            </p>
            <dl className="mt-2 grid gap-1.5">
              {profile.survey.map((answer) => (
                <div key={answer.label} className="flex items-baseline justify-between gap-3">
                  <dt className="min-w-0 truncate text-small text-(--cover-ink-2)">{answer.label}</dt>
                  <dd className="shrink-0 font-mono text-small font-medium">{answer.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-auto pt-3 font-mono text-micro text-(--cover-ink-2)">
              {preview.labels.award}{' '}
              <span className="font-medium text-(--vol-accent-ink)">
                +{profile.xpAward} {preview.labels.xp}
              </span>
            </p>
          </section>

          <section
            aria-live="polite"
            className="flex flex-col rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2.5"
          >
            <p className="font-mono text-micro font-medium uppercase tracking-wider text-(--cover-ink-2)">
              {preview.labels.prediction}
            </p>
            <p className="mt-1 font-display text-h3 leading-none">{profile.prediction.classLabel}</p>
            <ul className="mt-3 grid gap-1.5">
              {profile.prediction.probabilities.map((entry) => {
                const top = entry.label === profile.prediction.classLabel
                return (
                  <li key={entry.label} className="grid grid-cols-[4.75rem_minmax(0,1fr)_2.25rem] items-center gap-2">
                    <span className={cn('truncate font-mono text-micro', top ? 'text-(--cover-ink)' : 'text-(--cover-ink-2)')}>
                      {entry.label}
                    </span>
                    <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-(--cover-line)">
                      <motion.span
                        className={cn('block h-full origin-left rounded-full', top ? 'bg-(--vol-accent)' : 'bg-(--cover-line-strong)')}
                        initial={false}
                        animate={{ width: `${Math.round(entry.value * 100)}%` }}
                        transition={{ duration: duration.state, ease }}
                      />
                    </span>
                    <span className="text-right font-mono text-micro">{Math.round(entry.value * 100)}%</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-auto pt-3 font-mono text-micro text-(--cover-ink-2)">{preview.labels.model}</p>
          </section>

          <section className="flex flex-col rounded-md border border-(--cover-line) bg-(--vol-tint) px-3 py-2.5">
            <div className="flex items-end justify-between gap-3">
              <p>
                <span className="block font-mono text-micro font-medium uppercase tracking-wider text-(--cover-ink-2)">
                  {preview.labels.level}
                </span>
                <span className="font-display text-h3 leading-none">{progress.level}</span>
              </p>
              <p className="flex items-center gap-1.5 font-mono text-micro">
                <Flame aria-hidden="true" className="size-3.5 text-(--vol-accent-ink)" />
                <span className="sr-only">{preview.labels.streak}</span>
                <span className="font-medium">{progress.streak}</span>
                <span className="text-(--cover-ink-2)">{preview.labels.streakUnit}</span>
              </p>
            </div>

            <div className="mt-2">
              <div
                role="progressbar"
                aria-label={preview.labels.xp}
                aria-valuemin={0}
                aria-valuemax={preview.xpPerLevel}
                aria-valuenow={progress.xp}
                className="h-2 overflow-hidden rounded-full bg-(--cover-line)"
              >
                <motion.div
                  className="h-full rounded-full bg-(--vol-accent)"
                  initial={false}
                  animate={{ width: `${Math.round(xpShare * 100)}%` }}
                  transition={{ duration: duration.state * 1.4, ease }}
                />
              </div>
              <p className="mt-1 font-mono text-micro text-(--cover-ink-2)">
                {progress.xp} / {preview.xpPerLevel} {preview.labels.xp}
              </p>
            </div>

            <ol aria-label={preview.labels.streak} className="mt-2 flex gap-1">
              {preview.weekDays.map((day, index) => {
                const done = index < progress.daysDone
                return (
                  <li
                    key={`${index}-${day}`}
                    className={cn(
                      'grid h-6 min-w-0 flex-1 place-items-center rounded-sm border font-mono text-micro',
                      done
                        ? 'border-(--vol-accent) bg-(--vol-accent-wash) text-(--cover-ink)'
                        : 'border-(--cover-line) text-(--cover-ink-2)',
                    )}
                  >
                    {day}
                  </li>
                )
              })}
            </ol>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
              {progress.logged ? (
                <>
                  <p className="flex min-h-9 items-center gap-1.5 font-mono text-micro text-status-ok">
                    <Check aria-hidden="true" className="size-3.5" />
                    {weekComplete ? preview.labels.weekComplete : preview.labels.logged}
                  </p>
                  <button
                    type="button"
                    onClick={() => setProgress(initial)}
                    className="min-h-9 rounded-full border border-(--cover-line-strong) px-3 font-mono text-micro text-(--cover-ink-2) transition-colors duration-200 ease-monograph hover:text-(--cover-ink)"
                  >
                    {preview.labels.reset}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={logCheckIn}
                  className="min-h-9 rounded-full bg-(--cover-ink) px-3.5 font-mono text-micro font-medium text-(--vol-cover) transition-opacity duration-200 ease-monograph hover:opacity-85"
                >
                  {preview.labels.log}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
