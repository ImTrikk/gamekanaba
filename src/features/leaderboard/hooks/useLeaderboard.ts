import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getLeaderboard } from '@/features/leaderboard/api/leaderboard'
import { supabase } from '@/lib/supabase/client'

export const leaderboardQueryKeys = {
  detail: (sessionId: string) => ['leaderboard', sessionId] as const,
}

export function useLeaderboard(sessionId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`leaderboard:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participant_answers',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: leaderboardQueryKeys.detail(sessionId) })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [sessionId, queryClient])

  return useQuery({
    queryKey: leaderboardQueryKeys.detail(sessionId ?? ''),
    queryFn: () => getLeaderboard(sessionId!),
    enabled: Boolean(sessionId),
  })
}
