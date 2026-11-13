import { useEffect, useState } from 'react'

// Display-only countdown. The server's question_deadline_at is authoritative;
// this never enforces anything, it just renders a number that ticks down.
export function useCountdown(deadlineAt: string | null | undefined): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!deadlineAt) {
      setSecondsLeft(null)
      return
    }

    const deadline = new Date(deadlineAt).getTime()

    function tick() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [deadlineAt])

  return secondsLeft
}
