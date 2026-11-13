import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listAnswers, replaceAnswers } from '@/features/answers/api/answers'
import type { AnswerChoiceInput } from '@/lib/validations/answer'

export const answersQueryKeys = {
  list: (questionId: string) => ['answers', questionId] as const,
}

export function useAnswers(questionId: string | undefined) {
  return useQuery({
    queryKey: answersQueryKeys.list(questionId ?? ''),
    queryFn: () => listAnswers(questionId!),
    enabled: Boolean(questionId),
  })
}

export function useReplaceAnswers(questionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (choices: AnswerChoiceInput[]) => replaceAnswers(questionId, choices),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: answersQueryKeys.list(questionId) })
    },
  })
}
