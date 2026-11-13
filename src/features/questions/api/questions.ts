import { supabase } from '@/lib/supabase/client'
import type { QuestionInput, QuestionType } from '@/lib/validations/question'

export interface Question {
  id: string
  gameId: string
  questionText: string
  questionType: QuestionType
  points: number
  position: number
}

function toQuestion(row: {
  id: string
  game_id: string
  question_text: string
  question_type: string
  points: number
  position: number
}): Question {
  return {
    id: row.id,
    gameId: row.game_id,
    questionText: row.question_text,
    questionType: row.question_type as QuestionType,
    points: row.points,
    position: row.position,
  }
}

export async function listQuestions(gameId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, game_id, question_text, question_type, points, position')
    .eq('game_id', gameId)
    .order('position', { ascending: true })

  if (error) throw error
  return data.map(toQuestion)
}

export async function createQuestion(gameId: string, input: QuestionInput): Promise<Question> {
  const { data: existing, error: countError } = await supabase
    .from('questions')
    .select('position')
    .eq('game_id', gameId)
    .order('position', { ascending: false })
    .limit(1)

  if (countError) throw countError
  const nextPosition = (existing[0]?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('questions')
    .insert({
      game_id: gameId,
      question_text: input.questionText,
      question_type: input.questionType,
      points: input.points,
      position: nextPosition,
    })
    .select('id, game_id, question_text, question_type, points, position')
    .single()

  if (error) throw error
  return toQuestion(data)
}

export async function updateQuestion(questionId: string, input: QuestionInput): Promise<Question> {
  const { data, error } = await supabase
    .from('questions')
    .update({
      question_text: input.questionText,
      question_type: input.questionType,
      points: input.points,
    })
    .eq('id', questionId)
    .select('id, game_id, question_text, question_type, points, position')
    .single()

  if (error) throw error
  return toQuestion(data)
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) throw error
}

export async function reorderQuestion(
  gameId: string,
  questionId: string,
  direction: 'up' | 'down',
): Promise<void> {
  const questions = await listQuestions(gameId)
  const index = questions.findIndex((q) => q.id === questionId)
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || swapIndex < 0 || swapIndex >= questions.length) return

  const current = questions[index]
  const swapWith = questions[swapIndex]

  // A unique (game_id, position) constraint means both rows must swap within a
  // single statement (Postgres checks non-deferred unique constraints at the end
  // of the statement, not per row) — two sequential updates would collide.
  // Upsert full rows (not just id/position) so the proposed INSERT row for the
  // ON CONFLICT path still satisfies NOT NULL columns.
  const { error } = await supabase.from('questions').upsert(
    [
      {
        id: current.id,
        game_id: current.gameId,
        question_text: current.questionText,
        question_type: current.questionType,
        points: current.points,
        position: swapWith.position,
      },
      {
        id: swapWith.id,
        game_id: swapWith.gameId,
        question_text: swapWith.questionText,
        question_type: swapWith.questionType,
        points: swapWith.points,
        position: current.position,
      },
    ],
    { onConflict: 'id' },
  )
  if (error) throw error
}
