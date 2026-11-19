import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { Game } from '@/features/games/api/games'
import { useUpdateGameSettings } from '@/features/games/hooks/useGameMutations'
import { useGame } from '@/features/games/hooks/useGames'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GameSettings } from '@/lib/validations/game'

function GameSettingsForm({ game }: { game: Game }) {
  const updateSettings = useUpdateGameSettings(game.id)
  const [settings, setSettings] = useState<GameSettings>(game.settings)

  function handleSave(event: React.FormEvent) {
    event.preventDefault()
    updateSettings.mutate(settings)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="timer" className="text-sm font-medium">
          Question timer
        </label>
        <Select
          value={String(settings.timerSeconds)}
          onValueChange={(value) =>
            setSettings((s) => ({ ...s, timerSeconds: Number(value) as 10 | 20 | 30 }))
          }
        >
          <SelectTrigger id="timer" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 seconds</SelectItem>
            <SelectItem value="20">20 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Label htmlFor="shuffle-answers">
        <Checkbox
          id="shuffle-answers"
          checked={settings.shuffleAnswers}
          onCheckedChange={(checked) => setSettings((s) => ({ ...s, shuffleAnswers: checked }))}
        />
        Shuffle answer choices
      </Label>

      <Label htmlFor="show-leaderboard">
        <Checkbox
          id="show-leaderboard"
          checked={settings.showLeaderboardAfterQuestion}
          onCheckedChange={(checked) =>
            setSettings((s) => ({ ...s, showLeaderboardAfterQuestion: checked }))
          }
        />
        Show leaderboard after each question
      </Label>

      {updateSettings.isError && (
        <p className="text-sm text-destructive">{updateSettings.error.message}</p>
      )}

      <Button type="submit" disabled={updateSettings.isPending}>
        Save settings
      </Button>
    </form>
  )
}

export function GameSettingsPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { data: game, isLoading, error } = useGame(gameId)

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading settings…</p>
  if (error) return <p className="p-8 text-destructive">{error.message}</p>
  if (!game) return null

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Game settings</h1>
        <Button variant="outline" onClick={() => navigate(`/host/games/${gameId}/edit`)}>
          Back to questions
        </Button>
      </div>

      <GameSettingsForm key={game.id} game={game} />
    </div>
  )
}
