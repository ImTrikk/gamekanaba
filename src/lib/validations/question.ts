import { z } from 'zod'

// Mirrors the check constraint on public.questions.question_type.
export const questionTypeSchema = z.enum(['multiple_choice', 'true_false'])
export type QuestionType = z.infer<typeof questionTypeSchema>

export const questionInputSchema = z.object({
  questionText: z.string().trim().min(1).max(500),
  questionType: questionTypeSchema,
  points: z.number().int().min(0).max(10_000),
})

export type QuestionInput = z.infer<typeof questionInputSchema>
