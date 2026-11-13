import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AddQuestionForm } from '@/features/questions/components/AddQuestionForm'
import { QuestionList } from '@/features/questions/components/QuestionList'
import type { Game } from '@/features/games/api/games'
import { useUpdateGameDetails } from '@/features/games/hooks/useGameMutations'
import { useGame } from '@/features/games/hooks/useGames'
import { useCreateSession } from '@/features/sessions/hooks/useSessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { gameDetailsSchema } from '@/lib/validations/game'

function GameDetailsForm({ game }: { game: Game }) {
  const updateDetails = useUpdateGameDetails(game.id)
  const [title, setTitle] = useState(game.title)
  const [description, setDescription] = useState(game.description ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const result = gameDetailsSchema.safeParse({ title, description })
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setValidationError(null)
    updateDetails.mutate(result.data)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {validationError && <p className="text-sm text-destructive">{validationError}</p>}
      {updateDetails.isError && (
        <p className="text-sm text-destructive">{updateDetails.error.message}</p>
      )}
      <Button type="submit" disabled={updateDetails.isPending}>
        Save
      </Button>
    </form>
  )
}

export function GameBuilderPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { data: game, isLoading, error } = useGame(gameId)
  const createSession = useCreateSession()

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading game…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>
  if (!game) return null

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Edit game</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/host/games/${gameId}/settings`)}>
            Settings
          </Button>
          <Button
            disabled={createSession.isPending}
            onClick={() =>
              createSession.mutate(gameId!, {
                onSuccess: (session) => navigate(`/host/sessions/${session.id}/lobby`),
              })
            }
          >
            Start session
          </Button>
        </div>
      </div>
      {createSession.isError && (
        <p className="mb-4 text-sm text-destructive">{createSession.error.message}</p>
      )}

      <GameDetailsForm key={game.id} game={game} />

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-medium">Questions</h2>
        <QuestionList gameId={gameId!} />
        <AddQuestionForm gameId={gameId!} />
      </div>
    </div>
  )
}
