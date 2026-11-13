import { supabase } from '@/lib/supabase/client'

export interface LeaderboardEntry {
  participantId: string
  displayName: string
  totalScore: number
  correctAnswers: number
  rank: number
}

export async function getLeaderboard(sessionId: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_leaderboard', { p_session_id: sessionId })
  if (error) throw error

  return data.map((row) => ({
    participantId: row.participant_id,
    displayName: row.display_name,
    totalScore: row.total_score,
    correctAnswers: Number(row.correct_answers),
    rank: Number(row.rank),
  }))
}
