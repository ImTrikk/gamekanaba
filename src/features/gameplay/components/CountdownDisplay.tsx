import { cn } from 'cn'
import type { CountdownUrgency } from '@/features/gameplay/hooks/useCountdown'

const urgencyClasses: Record<CountdownUrgency, string> = {
  neutral: 'text-foreground',
  warning: 'text-accent-foreground',
  urgent: 'text-destructive motion-safe:animate-pulse',
}

export function CountdownDisplay({
  secondsLeft,
  urgency,
  className,
}: {
  secondsLeft: number | null
  urgency: CountdownUrgency
  className?: string
}) {
  return (
    <span
      role="timer"
      aria-live="polite"
      className={cn('text-countdown tabular-nums transition-colors', urgencyClasses[urgency], className)}
    >
      {secondsLeft ?? '—'}s
    </span>
  )
}
