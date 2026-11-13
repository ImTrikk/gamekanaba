import { useNavigate, useParams } from 'react-router'
import { SessionQrCode } from '@/features/sessions/components/SessionQrCode'
import { useRemoveParticipant, useParticipants } from '@/features/sessions/hooks/useParticipants'
import { useGameSession } from '@/features/sessions/hooks/useSessions'
import { Button } from '@/components/ui/button'

export function HostLobbyPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: session, isLoading, error } = useGameSession(sessionId)
  const { data: participants } = useParticipants(sessionId)
  const removeParticipant = useRemoveParticipant(sessionId ?? '')

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading lobby…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>
  if (!session) return null

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Lobby</h1>
        <Button variant="outline" onClick={() => navigate('/host/dashboard')}>
          Back to dashboard
        </Button>
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 rounded-md border p-6">
        <p className="text-sm text-muted-foreground">Game PIN</p>
        <p className="text-5xl font-semibold tracking-widest">{session.pin}</p>
        <SessionQrCode pin={session.pin} />
      </div>

      <h2 className="mb-3 text-lg font-medium">
        Participants ({participants?.length ?? 0})
      </h2>
      {participants && participants.length === 0 && (
        <p className="text-muted-foreground">Waiting for players to join…</p>
      )}
      <ul className="flex flex-col gap-2">
        {participants?.map((participant) => (
          <li
            key={participant.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <span>{participant.displayName}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={removeParticipant.isPending}
              onClick={() => removeParticipant.mutate(participant.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
