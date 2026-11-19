import { useEffect, useRef, useState } from 'react'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { Card } from '@/components/ui/card'
import { cn } from 'cn'

interface PrevEntry {
  rank: number
  totalScore: number
}

// Highlights rows whose rank improved or score increased since the previous
// render. This is a presentational-only diff computed in an effect after
// data arrives — it never delays or gates the underlying realtime render
// (docs/design/MECHVIBES_DESIGN_DIRECTION.md §4.2).
function useChangedEntryIds(entries: { participantId: string; rank: number; totalScore: number }[] | undefined) {
  const prevRef = useRef<Map<string, PrevEntry>>(new Map())
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!entries) return

    const prev = prevRef.current
    const changed = new Set<string>()
    for (const entry of entries) {
      const before = prev.get(entry.participantId)
      if (before && (entry.rank < before.rank || entry.totalScore > before.totalScore)) {
        changed.add(entry.participantId)
      }
    }
    prevRef.current = new Map(
      entries.map((entry) => [entry.participantId, { rank: entry.rank, totalScore: entry.totalScore }]),
    )

    if (changed.size === 0) return
    setChangedIds(changed)
    const timeout = setTimeout(() => setChangedIds(new Set()), 1200)
    return () => clearTimeout(timeout)
  }, [entries])

  return changedIds
}

export function LeaderboardList({ sessionId }: { sessionId: string }) {
  const { data: entries, isLoading, error } = useLeaderboard(sessionId)
  const changedIds = useChangedEntryIds(entries)

  if (isLoading) return <p className="text-muted-foreground">Loading leaderboard…</p>
  if (error) return <p className="text-destructive">{error.message}</p>
  if (!entries || entries.length === 0) {
    return <p className="text-muted-foreground">No participants yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isChanged = changedIds.has(entry.participantId)
        return (
          <Card
            key={entry.participantId}
            className={cn(
              'flex-row items-center justify-between border p-3 transition-colors motion-safe:duration-300',
              isChanged && 'border-success bg-success/10',
            )}
          >
            <span className="flex items-center gap-3">
              <span className="w-8 text-right font-mono text-muted-foreground">#{entry.rank}</span>
              <span className="font-medium">{entry.displayName}</span>
            </span>
            <span className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {entry.correctAnswers} correct
              </span>
              <span
                className={cn(
                  'font-semibold transition-transform motion-safe:duration-300',
                  isChanged && 'motion-safe:scale-110 text-success',
                )}
              >
                {entry.totalScore} pts
              </span>
            </span>
          </Card>
        )
      })}
    </div>
  )
}
