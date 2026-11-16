import { cn } from '../../lib/cn.ts'

interface SectionHeadingProps {
  headingId: string
  eyebrow: string
  heading: string
  lede?: string
  className?: string
}

/** The section header triple: ruled eyebrow, serif heading, short lede. */
export function SectionHeading({ headingId, eyebrow, heading, lede, className }: SectionHeadingProps) {
  return (
    <header className={cn('max-w-3xl', className)}>
      <p className="meta-tag flex items-center gap-3 text-ink-2">
        <span aria-hidden="true" className="h-px w-10 bg-ink-2/60" />
        {eyebrow}
      </p>
      <h2 id={headingId} className="mt-4 text-ink">
        {heading}
      </h2>
      {lede ? <p className="mt-4 max-w-measure text-lede text-ink-2">{lede}</p> : null}
    </header>
  )
}
