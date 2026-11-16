import type { ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

interface ContainerProps {
  children: ReactNode
  className?: string
}

/** Page container: 1280px max, centred, with the spec's horizontal padding. */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12', className)}>{children}</div>
}
