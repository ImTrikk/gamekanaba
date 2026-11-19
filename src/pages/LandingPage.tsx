import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

type DemoTileState = 'default' | 'pressed' | 'selected' | 'correct'

const DEMO_ANSWERS = ['Paris', 'Berlin', 'Lisbon', 'Madrid'] as const
const CORRECT_ANSWER = 'Lisbon'

// Non-authoritative, tap-to-demo preview of the real answer tile (see
// docs/design/MECHVIBES_DESIGN_DIRECTION.md §2.1, §3.1). Plays its sequence
// once per tap and resets — it never advances on its own, and it never calls
// into gameplay/session APIs.
function DemoAnswerTile() {
  const [state, setState] = useState<DemoTileState>('default')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const pendingTimers = timers.current
    return () => {
      pendingTimers.forEach(clearTimeout)
    }
  }, [])

  function handleTap() {
    if (state !== 'default') return

    setState('pressed')
    timers.current.push(
      setTimeout(() => setState('selected'), 120),
      setTimeout(() => setState('correct'), 520),
      setTimeout(() => setState('default'), 1400),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {DEMO_ANSWERS.map((answer) => {
        const isCorrectAnswer = answer === CORRECT_ANSWER
        const isPressedTile = isCorrectAnswer && state === 'pressed'
        const isSelectedTile = isCorrectAnswer && state === 'selected'
        const isRevealedCorrect = isCorrectAnswer && state === 'correct'

        return (
          <button
            key={answer}
            type="button"
            onClick={isCorrectAnswer ? handleTap : undefined}
            aria-label={isCorrectAnswer ? `Tap to preview answering "${answer}"` : answer}
            className={[
              'rounded-md border p-4 text-left text-gameplay-answer transition-all motion-safe:duration-150',
              isPressedTile ? 'motion-safe:scale-[0.98] border-primary ring-2 ring-primary' : '',
              isSelectedTile ? 'border-primary ring-2 ring-primary bg-primary/5' : '',
              isRevealedCorrect
                ? 'border-success bg-success/10 motion-safe:duration-300'
                : '',
              !isCorrectAnswer && state === 'correct' ? 'text-muted-foreground border-border' : '',
              isCorrectAnswer ? 'cursor-pointer' : 'cursor-default border-border',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {answer}
            {isRevealedCorrect && <span className="ml-2 text-success">✓</span>}
          </button>
        )
      })}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-display">
            Live trivia,
            <br />
            played together.
          </h1>
          <p className="text-muted-foreground max-w-sm text-lg">
            Host a game from your dashboard, share a PIN, and watch answers,
            scores, and the leaderboard update in real time on every screen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" render={<Link to="/join" />}>
              Join a game
            </Button>
            <Button size="lg" variant="outline" render={<Link to="/host/sign-in" />}>
              Host sign-in
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground uppercase">Tap to try it</p>
          <h2 className="text-gameplay-question">What's the capital of Portugal?</h2>
          <DemoAnswerTile />
        </div>
      </section>
    </div>
  )
}
