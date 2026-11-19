import { useEffect, useState } from 'react'

// Display-only countdown. The server's question_deadline_at is authoritative;
// this never enforces anything, it just renders a number that ticks down.
//
// `urgency` is a presentational derivation only (per docs/design/MECHVIBES_DESIGN_DIRECTION.md §3.2):
// thresholds are percentages of the question's own timer window (captured from
// the first tick after a new deadline arrives), not fixed seconds, so a 10s
// question doesn't spend its entire duration in the "urgent" tier.
export type CountdownUrgency = 'neutral' | 'warning' | 'urgent'

export interface CountdownState {
  secondsLeft: number | null
  urgency: CountdownUrgency
}

export function useCountdown(deadlineAt: string | null | undefined): CountdownState {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!deadlineAt) {
      setSecondsLeft(null)
      setTotalSeconds(null)
      return
    }

    const deadline = new Date(deadlineAt).getTime()
    let captured = false

    function tick() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (!captured) {
        captured = true
        setTotalSeconds(remaining)
      }
    }

    tick()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [deadlineAt])

  return { secondsLeft, urgency: getCountdownUrgency(secondsLeft, totalSeconds) }
}

function getCountdownUrgency(
  secondsLeft: number | null,
  totalSeconds: number | null,
): CountdownUrgency {
  if (secondsLeft == null || totalSeconds == null || totalSeconds <= 0) return 'neutral'

  const destructiveAt = Math.max(3, Math.round(totalSeconds * 0.25))
  const accentAt = Math.round(totalSeconds * 0.5)

  if (secondsLeft <= destructiveAt) return 'urgent'
  if (secondsLeft <= accentAt) return 'warning'
  return 'neutral'
}
