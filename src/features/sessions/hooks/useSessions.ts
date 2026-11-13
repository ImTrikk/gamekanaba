import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSession, getSession } from '@/features/sessions/api/sessions'

export const sessionsQueryKeys = {
  detail: (sessionId: string) => ['sessions', sessionId] as const,
}

// Named useGameSession (not useSession) to avoid confusion with
// features/auth/hooks/useSession, which tracks the Supabase Auth session.
export function useGameSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionsQueryKeys.detail(sessionId ?? ''),
    queryFn: () => getSession(sessionId!),
    enabled: Boolean(sessionId),
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKeys.detail(session.id) })
    },
  })
}
