import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCountdown } from '@/features/gameplay/hooks/useCountdown'
import { useAnswerProgress, useCurrentQuestion, useHostControls } from '@/features/gameplay/hooks/useGameplay'
import { LeaderboardList } from '@/features/leaderboard/components/LeaderboardList'
import { useParticipants } from '@/features/sessions/hooks/useParticipants'
import { Button } from '@/components/ui/button'

export function HostGameScreenPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: question, isLoading, error } = useCurrentQuestion(sessionId)
  const { data: participants } = useParticipants(sessionId)
  const { data: answerCount } = useAnswerProgress(sessionId, question?.questionId ?? undefined)
  const controls = useHostControls(sessionId ?? '')

  const secondsLeft = useCountdown(question?.deadlineAt)

  useEffect(() => {
    if (question?.sessionStatus === 'completed') {
      navigate(`/sessions/${sessionId}/results`, { replace: true })
    }
  }, [question?.sessionStatus, sessionId, navigate])

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>
  if (!question || question.sessionStatus === 'completed') return null

  if (!question.questionId) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-muted-foreground">No active question yet.</p>
        <Button
          className="mt-6"
          disabled={controls.start.isPending}
          onClick={() => controls.start.mutate()}
        >
          Start session
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground uppercase">{question.sessionStatus}</span>
        <span className="text-2xl font-semibold">{secondsLeft ?? '—'}s</span>
      </div>

      <h1 className="mb-6 text-2xl font-medium">{question.questionText}</h1>

      <ul className="mb-6 flex flex-col gap-2">
        {question.answers?.map((answer) => (
          <li
            key={answer.id}
            className={`rounded-md border p-3 ${
              question.isRevealed && answer.isCorrect ? 'border-green-500 bg-green-50' : ''
            }`}
          >
            {answer.answerText}
          </li>
        ))}
      </ul>

      <p className="mb-6 text-sm text-muted-foreground">
        {answerCount ?? 0} of {participants?.length ?? 0} answered
      </p>

      {question.isRevealed && question.showLeaderboardAfterQuestion && sessionId && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-medium">Leaderboard</h2>
          <LeaderboardList sessionId={sessionId} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {question.sessionStatus === 'in_progress' && !question.isLocked && (
          <Button disabled={controls.lock.isPending} onClick={() => controls.lock.mutate()}>
            Lock answers
          </Button>
        )}
        {question.isLocked && !question.isRevealed && (
          <Button disabled={controls.reveal.isPending} onClick={() => controls.reveal.mutate()}>
            Reveal answer
          </Button>
        )}
        {question.isRevealed && (
          <Button disabled={controls.advance.isPending} onClick={() => controls.advance.mutate()}>
            Next question
          </Button>
        )}
        {question.sessionStatus === 'in_progress' && (
          <Button
            variant="outline"
            disabled={controls.pause.isPending}
            onClick={() => controls.pause.mutate()}
          >
            Pause
          </Button>
        )}
        {question.sessionStatus === 'paused' && (
          <Button
            variant="outline"
            disabled={controls.resume.isPending}
            onClick={() => controls.resume.mutate()}
          >
            Resume
          </Button>
        )}
        <Button
          variant="destructive"
          disabled={controls.end.isPending}
          onClick={() => controls.end.mutate()}
        >
          End session
        </Button>
      </div>
    </div>
  )
}
