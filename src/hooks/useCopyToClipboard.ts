import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyStatus = 'idle' | 'copied' | 'failed'

/** Copies text to the clipboard and reports the outcome for a short while. */
export function useCopyToClipboard(resetAfterMs = 2400): { status: CopyStatus; copy: (text: string) => void } {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    (text: string) => {
      const finish = (next: CopyStatus) => {
        setStatus(next)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setStatus('idle'), resetAfterMs)
      }
      if (!navigator.clipboard) {
        finish('failed')
        return
      }
      navigator.clipboard.writeText(text).then(
        () => finish('copied'),
        () => finish('failed'),
      )
    },
    [resetAfterMs],
  )

  return { status, copy }
}
