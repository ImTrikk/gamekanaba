import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useCurrentQuestion } from '@/features/gameplay/hooks/useGameplay'
import { useMyParticipant } from '@/features/sessions/hooks/useParticipants'

export function PlayerLobbyPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: participant, isLoading, error } = useMyParticipant(sessionId)
  const { data: question } = useCurrentQuestion(participant ? sessionId : undefined)

  useEffect(() => {
    if (question && question.sessionStatus !== 'lobby') {
      navigate(`/play/${sessionId}`, { replace: true })
    }
  }, [question, sessionId, navigate])

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>

  if (!participant) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <p className="text-muted-foreground">You haven't joined this session yet.</p>
        <button
          type="button"
          className="mt-4 text-sm underline"
          onClick={() => navigate('/join')}
        >
          Join a game
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <h1 className="mb-2 text-2xl font-medium">You're in!</h1>
      <p className="text-muted-foreground">
        Playing as <span className="font-medium text-foreground">{participant.displayName}</span>
      </p>
      <p className="mt-6 text-sm text-muted-foreground">Waiting for the host to start…</p>
    </div>
  )
}
