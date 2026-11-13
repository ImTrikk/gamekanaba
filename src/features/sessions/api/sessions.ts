import { supabase } from '@/lib/supabase/client'

export type SessionStatus = 'lobby' | 'in_progress' | 'paused' | 'completed' | 'cancelled'

export interface GameSession {
  id: string
  gameId: string
  hostId: string
  pin: string
  status: SessionStatus
}

function toSession(row: {
  id: string
  game_id: string
  host_id: string
  pin: string
  status: string
}): GameSession {
  return {
    id: row.id,
    gameId: row.game_id,
    hostId: row.host_id,
    pin: row.pin,
    status: row.status as SessionStatus,
  }
}

function generatePin(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000))
}

const MAX_PIN_ATTEMPTS = 5

export async function createSession(gameId: string): Promise<GameSession> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) throw new Error('No authenticated host session.')

  for (let attempt = 0; attempt < MAX_PIN_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        game_id: gameId,
        host_id: userData.user.id,
        pin: generatePin(),
      })
      .select('id, game_id, host_id, pin, status')
      .single()

    if (!error) return toSession(data)
    // 23505 = unique_violation; the active-session PIN index collided, retry with a new PIN.
    if (error.code !== '23505') throw error
  }

  throw new Error('Could not generate a unique session PIN. Please try again.')
}

export async function getSession(sessionId: string): Promise<GameSession> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('id, game_id, host_id, pin, status')
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return toSession(data)
}
