import { supabase } from '@/lib/supabase/client'
import type { QuestionType } from '@/lib/validations/question'
import type { SessionStatus } from '@/features/sessions/api/sessions'

export interface CurrentQuestionAnswer {
  id: string
  answerText: string
  position: number
  isCorrect: boolean | null
}

export interface CurrentQuestion {
  sessionStatus: SessionStatus
  questionId: string | null
  questionText?: string
  questionType?: QuestionType
  points?: number
  deadlineAt?: string | null
  isLocked?: boolean
  isRevealed?: boolean
  showLeaderboardAfterQuestion: boolean
  answers?: CurrentQuestionAnswer[]
}

export async function getCurrentQuestion(sessionId: string): Promise<CurrentQuestion> {
  const { data, error } = await supabase.rpc('get_current_question', {
    p_session_id: sessionId,
  })
  if (error) throw error
  return data as unknown as CurrentQuestion
}

export async function submitAnswer(sessionId: string, answerId: string): Promise<void> {
  const { error } = await supabase.rpc('submit_answer', {
    p_session_id: sessionId,
    p_answer_id: answerId,
  })
  if (error) throw error
}

type SessionControlFn =
  | 'start_session'
  | 'lock_answers'
  | 'reveal_answer'
  | 'advance_question'
  | 'pause_session'
  | 'resume_session'
  | 'end_session'

async function callSessionControl(fn: SessionControlFn, sessionId: string): Promise<void> {
  const { error } = await supabase.rpc(fn, { p_session_id: sessionId })
  if (error) throw error
}

export const startSession = (sessionId: string) => callSessionControl('start_session', sessionId)
export const lockAnswers = (sessionId: string) => callSessionControl('lock_answers', sessionId)
export const revealAnswer = (sessionId: string) => callSessionControl('reveal_answer', sessionId)
export const advanceQuestion = (sessionId: string) =>
  callSessionControl('advance_question', sessionId)
export const pauseSession = (sessionId: string) => callSessionControl('pause_session', sessionId)
export const resumeSession = (sessionId: string) =>
  callSessionControl('resume_session', sessionId)
export const endSession = (sessionId: string) => callSessionControl('end_session', sessionId)

export async function countAnswersForQuestion(
  sessionId: string,
  questionId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('participant_answers')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)

  if (error) throw error
  return count ?? 0
}
