import { cn } from '../../lib/cn.ts'

interface StackTagProps {
  label: string
  className?: string
}

/** A technology name set as a small mono chip. Rendered as a list item. */
export function StackTag({ label, className }: StackTagProps) {
  return (
    <li
      className={cn(
        'rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-micro font-medium tracking-wide text-ink',
        className,
      )}
    >
      {label}
    </li>
  )
}
