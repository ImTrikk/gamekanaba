import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  getMyParticipant,
  joinSession,
  listParticipants,
  removeParticipant,
} from '@/features/sessions/api/participants'
import { supabase } from '@/lib/supabase/client'
import type { ParticipantNameInput } from '@/lib/validations/participant'

export const participantsQueryKeys = {
  list: (sessionId: string) => ['participants', sessionId] as const,
  mine: (sessionId: string) => ['participants', sessionId, 'me'] as const,
}

// Live participant list (Project Plan section 8: "Participant joined" /
// "Participant connection changed"). Postgres Changes still respects RLS, so
// this only ever delivers rows the current user is allowed to SELECT.
export function useParticipants(sessionId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: participantsQueryKeys.list(sessionId) })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [sessionId, queryClient])

  return useQuery({
    queryKey: participantsQueryKeys.list(sessionId ?? ''),
    queryFn: () => listParticipants(sessionId!),
    enabled: Boolean(sessionId),
  })
}

export function useMyParticipant(sessionId: string | undefined) {
  return useQuery({
    queryKey: participantsQueryKeys.mine(sessionId ?? ''),
    queryFn: () => getMyParticipant(sessionId!),
    enabled: Boolean(sessionId),
  })
}

export function useJoinSession() {
  return useMutation({
    mutationFn: ({ pin, input }: { pin: string; input: ParticipantNameInput }) =>
      joinSession(pin, input),
  })
}

export function useRemoveParticipant(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantsQueryKeys.list(sessionId) })
    },
  })
}
