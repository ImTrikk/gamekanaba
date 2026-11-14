import { useNavigate, useParams } from 'react-router'
import { useHostControls } from '@/features/gameplay/hooks/useGameplay'
import { SessionQrCode } from '@/features/sessions/components/SessionQrCode'
import { useRemoveParticipant, useParticipants } from '@/features/sessions/hooks/useParticipants'
import { useGameSession } from '@/features/sessions/hooks/useSessions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function HostLobbyPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: session, isLoading, error } = useGameSession(sessionId)
  const { data: participants } = useParticipants(sessionId)
  const removeParticipant = useRemoveParticipant(sessionId ?? '')
  const controls = useHostControls(sessionId ?? '')

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading lobby…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>
  if (!session) return null

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Lobby</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/host/dashboard')}>
            Back to dashboard
          </Button>
          <Button
            disabled={controls.start.isPending || (participants?.length ?? 0) === 0}
            onClick={() =>
              controls.start.mutate(undefined, {
                onSuccess: () => navigate(`/host/sessions/${sessionId}/play`),
              })
            }
          >
            Start game
          </Button>
        </div>
      </div>
      {controls.start.isError && (
        <p className="mb-4 text-sm text-destructive">{controls.start.error.message}</p>
      )}

      <Card className="mb-8 flex-col items-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">Game PIN</p>
        <p className="text-5xl font-semibold tracking-widest">{session.pin}</p>
        <SessionQrCode pin={session.pin} />
      </Card>

      <h2 className="mb-3 text-lg font-medium">
        Participants ({participants?.length ?? 0})
      </h2>
      {participants && participants.length === 0 && (
        <p className="text-muted-foreground">Waiting for players to join…</p>
      )}
      <div className="flex flex-col gap-2">
        {participants?.map((participant) => (
          <Card key={participant.id} className="flex-row items-center justify-between p-3">
            <span>{participant.displayName}</span>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="sm" disabled={removeParticipant.isPending}>
                    Remove
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove {participant.displayName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    They'll be removed from this session and can rejoin with the PIN if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeParticipant.mutate(participant.id)}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        ))}
      </div>
    </div>
  )
}
