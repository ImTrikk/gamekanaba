import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { CurrentQuestion } from '@/features/gameplay/api/gameplay'
import { useCountdown } from '@/features/gameplay/hooks/useCountdown'
import { useCurrentQuestion, useSubmitAnswer } from '@/features/gameplay/hooks/useGameplay'
import { Button } from '@/components/ui/button'

function ActiveQuestion({
  sessionId,
  question,
}: {
  sessionId: string
  question: CurrentQuestion
}) {
  const submitAnswer = useSubmitAnswer(sessionId)
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const secondsLeft = useCountdown(question.deadlineAt)

  const hasSubmitted = selectedAnswerId !== null && submitAnswer.isSuccess

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground uppercase">
          {question.isRevealed ? 'Revealed' : question.isLocked ? 'Locked' : 'Answer now'}
        </span>
        <span className="text-xl font-semibold">{secondsLeft ?? '—'}s</span>
      </div>

      <h1 className="mb-6 text-xl font-medium">{question.questionText}</h1>

      <div className="flex flex-col gap-3">
        {question.answers?.map((answer) => {
          const isSelected = selectedAnswerId === answer.id
          const showCorrectness = question.isRevealed
          return (
            <button
              key={answer.id}
              type="button"
              disabled={question.isLocked || submitAnswer.isPending}
              onClick={() => {
                setSelectedAnswerId(answer.id)
                submitAnswer.mutate(answer.id)
              }}
              className={`rounded-md border p-4 text-left text-lg disabled:opacity-60 ${
                isSelected ? 'border-primary ring-2 ring-primary' : ''
              } ${showCorrectness && answer.isCorrect ? 'border-green-500 bg-green-50' : ''}`}
            >
              {answer.answerText}
            </button>
          )
        })}
      </div>

      {submitAnswer.isError && (
        <p className="mt-4 text-sm text-destructive">{submitAnswer.error.message}</p>
      )}
      {hasSubmitted && !question.isLocked && (
        <p className="mt-4 text-sm text-muted-foreground">Answer submitted — waiting…</p>
      )}
      {question.isLocked && !question.isRevealed && (
        <p className="mt-4 text-sm text-muted-foreground">
          Answers are locked. Waiting for reveal…
        </p>
      )}
    </div>
  )
}

export function PlayerGameScreenPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: question, isLoading, error } = useCurrentQuestion(sessionId)

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>
  if (!question) return null

  if (question.sessionStatus === 'completed') {
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <h1 className="text-2xl font-medium">Game over!</h1>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Done
        </Button>
      </div>
    )
  }

  if (question.sessionStatus === 'paused') {
    return <p className="p-8 text-center text-muted-foreground">Game paused…</p>
  }

  if (!question.questionId) {
    return <p className="p-8 text-center text-muted-foreground">Waiting for the host…</p>
  }

  return <ActiveQuestion key={question.questionId} sessionId={sessionId!} question={question} />
}
