import { z } from 'zod'
import type { QuestionType } from '@/lib/validations/question'

const answerChoiceSchema = z.object({
  answerText: z.string().trim().min(1).max(200),
  isCorrect: z.boolean(),
})

export type AnswerChoiceInput = z.infer<typeof answerChoiceSchema>

// Project Plan 4.2: Multiple Choice has four choices, True/False has two.
// Exactly one correct answer for both initial question types.
const expectedChoiceCount: Record<QuestionType, number> = {
  multiple_choice: 4,
  true_false: 2,
}

export function answerSetSchema(questionType: QuestionType) {
  return z
    .array(answerChoiceSchema)
    .length(expectedChoiceCount[questionType])
    .refine((choices) => choices.filter((c) => c.isCorrect).length === 1, {
      message: 'Exactly one answer choice must be marked correct.',
    })
}
