import { supabase } from '@/lib/supabase/client'
import type { AnswerChoiceInput } from '@/lib/validations/answer'

export interface Answer {
  id: string
  questionId: string
  answerText: string
  isCorrect: boolean
  position: number
}

function toAnswer(row: {
  id: string
  question_id: string
  answer_text: string
  is_correct: boolean
  position: number
}): Answer {
  return {
    id: row.id,
    questionId: row.question_id,
    answerText: row.answer_text,
    isCorrect: row.is_correct,
    position: row.position,
  }
}

export async function listAnswers(questionId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from('answers')
    .select('id, question_id, answer_text, is_correct, position')
    .eq('question_id', questionId)
    .order('position', { ascending: true })

  if (error) throw error
  return data.map(toAnswer)
}

// Replaces every answer choice for a question. Safe to call for a question still
// being authored (not yet used in a live session); live-session answer-choice
// editing protections are out of scope for this phase.
export async function replaceAnswers(
  questionId: string,
  choices: AnswerChoiceInput[],
): Promise<Answer[]> {
  const { error: deleteError } = await supabase
    .from('answers')
    .delete()
    .eq('question_id', questionId)
  if (deleteError) throw deleteError

  const { data, error: insertError } = await supabase
    .from('answers')
    .insert(
      choices.map((choice, index) => ({
        question_id: questionId,
        answer_text: choice.answerText,
        is_correct: choice.isCorrect,
        position: index,
      })),
    )
    .select('id, question_id, answer_text, is_correct, position')

  if (insertError) throw insertError
  return data.map(toAnswer)
}
