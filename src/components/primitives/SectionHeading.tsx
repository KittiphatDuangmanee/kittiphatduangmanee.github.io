import { cn } from '../../lib/cn.ts'

interface SectionHeadingProps {
  headingId: string
  /** Small ruled label above the heading. Left out where the heading stands on its own. */
  eyebrow?: string
  heading: string
  lede?: string
  className?: string
}

/** The section header: serif heading and a short lede, with an optional ruled eyebrow. */
export function SectionHeading({ headingId, eyebrow, heading, lede, className }: SectionHeadingProps) {
  return (
    <header className={cn('max-w-3xl', className)}>
      {eyebrow ? (
        <p className="meta-tag mb-4 flex items-center gap-3 text-ink-2">
          <span aria-hidden="true" className="h-px w-10 bg-ink-2/60" />
          {eyebrow}
        </p>
      ) : null}
      <h2 id={headingId} className="text-ink">
        {heading}
      </h2>
      {lede ? <p className="mt-4 max-w-measure text-lede text-ink-2">{lede}</p> : null}
    </header>
  )
}
