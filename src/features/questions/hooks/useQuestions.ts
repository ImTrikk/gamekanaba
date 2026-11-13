import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  reorderQuestion,
  updateQuestion,
} from '@/features/questions/api/questions'
import type { QuestionInput } from '@/lib/validations/question'

export const questionsQueryKeys = {
  list: (gameId: string) => ['questions', gameId] as const,
}

export function useQuestions(gameId: string | undefined) {
  return useQuery({
    queryKey: questionsQueryKeys.list(gameId ?? ''),
    queryFn: () => listQuestions(gameId!),
    enabled: Boolean(gameId),
  })
}

export function useCreateQuestion(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: QuestionInput) => createQuestion(gameId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKeys.list(gameId) })
    },
  })
}

export function useUpdateQuestion(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, input }: { questionId: string; input: QuestionInput }) =>
      updateQuestion(questionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKeys.list(gameId) })
    },
  })
}

export function useDeleteQuestion(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKeys.list(gameId) })
    },
  })
}

export function useReorderQuestion(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, direction }: { questionId: string; direction: 'up' | 'down' }) =>
      reorderQuestion(gameId, questionId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKeys.list(gameId) })
    },
  })
}
