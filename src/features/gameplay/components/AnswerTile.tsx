import { Check, X } from 'lucide-react'
import { cn } from 'cn'

// The seven answer-tile states from docs/design/MECHVIBES_DESIGN_DIRECTION.md §3.1.
// "pressed" and "hover" are pointer pseudo-classes layered on top (active:/hover:),
// not tracked as explicit state, since they're transient and CSS-only.
export type AnswerTileState =
  | 'default'
  | 'selected'
  | 'locked'
  | 'correct'
  | 'incorrect-selected'
  | 'incorrect-other'

export function AnswerTile({
  answerText,
  state,
  disabled,
  onClick,
}: {
  answerText: string
  state: AnswerTileState
  disabled?: boolean
  onClick?: () => void
}) {
  const isInteractive = state === 'default' && !disabled

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={state === 'selected' || state === 'incorrect-selected'}
      className={cn(
        'flex min-h-11 items-center justify-between gap-2 rounded-md border p-4 text-left text-gameplay-answer transition-all motion-safe:duration-150',
        isInteractive &&
          'cursor-pointer hover:border-primary/50 active:scale-[0.98] active:border-primary active:ring-2 active:ring-primary',
        state === 'default' && 'border-border bg-card',
        state === 'selected' && 'border-primary bg-primary/5 ring-2 ring-primary',
        state === 'locked' && 'cursor-not-allowed border-border opacity-60',
        state === 'correct' &&
          'border-success bg-success/10 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300',
        state === 'incorrect-selected' && 'border-border text-muted-foreground',
        state === 'incorrect-other' && 'border-border text-muted-foreground opacity-80',
      )}
    >
      <span>{answerText}</span>
      {state === 'correct' && (
        <Check className="size-4 shrink-0 text-success" aria-hidden="true" />
      )}
      {state === 'incorrect-selected' && (
        <X className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
    </button>
  )
}
