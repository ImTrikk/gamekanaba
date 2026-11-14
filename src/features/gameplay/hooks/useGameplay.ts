import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  advanceQuestion,
  countAnswersForQuestion,
  endSession,
  getCurrentQuestion,
  lockAnswers,
  pauseSession,
  resumeSession,
  revealAnswer,
  startSession,
  submitAnswer,
} from '@/features/gameplay/api/gameplay'
import { supabase } from '@/lib/supabase/client'

export const gameplayQueryKeys = {
  currentQuestion: (sessionId: string) => ['currentQuestion', sessionId] as const,
  answerProgress: (sessionId: string, questionId: string) =>
    ['answerProgress', sessionId, questionId] as const,
}

// Polls while a question is active and unlocked, both to keep the client's
// countdown display fresh and to drive the lazy deadline check (every call to
// get_current_question re-evaluates whether the deadline has passed). A
// Realtime subscription on the session row makes host actions (lock/reveal/
// advance) show up immediately rather than waiting for the next poll.
export function useCurrentQuestion(sessionId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`game_sessions:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: gameplayQueryKeys.currentQuestion(sessionId) })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [sessionId, queryClient])

  return useQuery({
    queryKey: gameplayQueryKeys.currentQuestion(sessionId ?? ''),
    queryFn: () => getCurrentQuestion(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 2000
      if (data.sessionStatus !== 'in_progress' || data.isLocked) return false
      return 2000
    },
  })
}

export function useSubmitAnswer(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answerId: string) => submitAnswer(sessionId, answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameplayQueryKeys.currentQuestion(sessionId) })
    },
  })
}

export function useAnswerProgress(sessionId: string | undefined, questionId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`participant_answers:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'participant_answers',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          if (questionId) {
            queryClient.invalidateQueries({
              queryKey: gameplayQueryKeys.answerProgress(sessionId, questionId),
            })
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [sessionId, questionId, queryClient])

  return useQuery({
    queryKey: gameplayQueryKeys.answerProgress(sessionId ?? '', questionId ?? ''),
    queryFn: () => countAnswersForQuestion(sessionId!, questionId!),
    enabled: Boolean(sessionId && questionId),
  })
}

export function useHostControls(sessionId: string) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: gameplayQueryKeys.currentQuestion(sessionId) })

  const start = useMutation({ mutationFn: () => startSession(sessionId), onSuccess: invalidate })
  const lock = useMutation({ mutationFn: () => lockAnswers(sessionId), onSuccess: invalidate })
  const reveal = useMutation({ mutationFn: () => revealAnswer(sessionId), onSuccess: invalidate })
  const advance = useMutation({
    mutationFn: () => advanceQuestion(sessionId),
    onSuccess: invalidate,
  })
  const pause = useMutation({ mutationFn: () => pauseSession(sessionId), onSuccess: invalidate })
  const resume = useMutation({ mutationFn: () => resumeSession(sessionId), onSuccess: invalidate })
  const end = useMutation({ mutationFn: () => endSession(sessionId), onSuccess: invalidate })

  return { start, lock, reveal, advance, pause, resume, end }
}
