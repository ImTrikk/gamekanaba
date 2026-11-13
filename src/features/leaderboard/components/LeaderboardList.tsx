import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'

export function LeaderboardList({ sessionId }: { sessionId: string }) {
  const { data: entries, isLoading, error } = useLeaderboard(sessionId)

  if (isLoading) return <p className="text-muted-foreground">Loading leaderboard…</p>
  if (error) return <p className="text-destructive">{error.message}</p>
  if (!entries || entries.length === 0) {
    return <p className="text-muted-foreground">No participants yet.</p>
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.participantId}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <span className="flex items-center gap-3">
            <span className="w-8 text-right font-mono text-muted-foreground">#{entry.rank}</span>
            <span className="font-medium">{entry.displayName}</span>
          </span>
          <span className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {entry.correctAnswers} correct
            </span>
            <span className="font-semibold">{entry.totalScore} pts</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
