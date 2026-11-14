import { useState } from 'react'
import { useNavigate } from 'react-router'
import { signOutHost } from '@/features/auth/api/auth'
import { useCreateGame, useDeleteGame } from '@/features/games/hooks/useGameMutations'
import { useGames } from '@/features/games/hooks/useGames'
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
import { Input } from '@/components/ui/input'

export function HostDashboardPage() {
  const navigate = useNavigate()
  const { data: games, isLoading, error } = useGames()
  const createGame = useCreateGame()
  const deleteGame = useDeleteGame()
  const [newTitle, setNewTitle] = useState('')

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!newTitle.trim()) return
    createGame.mutate(
      { title: newTitle.trim() },
      {
        onSuccess: (game) => {
          setNewTitle('')
          navigate(`/host/games/${game.id}/edit`)
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Your games</h1>
        <Button
          variant="outline"
          onClick={() => {
            void signOutHost().then(() => navigate('/host/sign-in'))
          }}
        >
          Sign out
        </Button>
      </div>

      <form onSubmit={handleCreate} className="mb-8 flex gap-2">
        <Input
          placeholder="New game title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button type="submit" disabled={createGame.isPending}>
          Create game
        </Button>
      </form>

      {isLoading && <p className="text-muted-foreground">Loading games…</p>}
      {error && <p className="text-destructive">{error.message}</p>}

      {games && games.length === 0 && (
        <p className="text-muted-foreground">No games yet. Create your first one above.</p>
      )}

      <div className="flex flex-col gap-2">
        {games?.map((game) => (
          <Card key={game.id} className="flex-row items-center justify-between p-3">
            <button
              type="button"
              className="text-left font-medium hover:underline"
              onClick={() => navigate(`/host/games/${game.id}/edit`)}
            >
              {game.title}
            </button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="sm" disabled={deleteGame.isPending}>
                    Delete
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{game.title}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes the game and its questions. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteGame.mutate(game.id)}>
                    Delete
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
