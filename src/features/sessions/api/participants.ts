import { supabase } from '@/lib/supabase/client'
import type { ParticipantNameInput } from '@/lib/validations/participant'

export interface Participant {
  id: string
  sessionId: string
  userId: string
  fullName: string
  displayName: string
  totalScore: number
  isConnected: boolean
}

function toParticipant(row: {
  id: string
  session_id: string
  user_id: string
  full_name: string
  display_name: string
  total_score: number
  is_connected: boolean
}): Participant {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    fullName: row.full_name,
    displayName: row.display_name,
    totalScore: row.total_score,
    isConnected: row.is_connected,
  }
}

export async function joinSession(
  pin: string,
  input: ParticipantNameInput,
): Promise<Participant> {
  // Guests are unauthenticated until they join; give them an anonymous Supabase
  // Auth session first so auth.uid() resolves inside the join_session RPC.
  const { data: existing } = await supabase.auth.getUser()
  if (!existing.user) {
    const { error: anonError } = await supabase.auth.signInAnonymously()
    if (anonError) throw anonError
  }

  const { data, error } = await supabase.rpc('join_session', {
    p_pin: pin,
    p_full_name: input.fullName,
    p_display_name: input.displayName,
  })

  if (error) throw error
  return toParticipant(data)
}

export async function listParticipants(sessionId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, session_id, user_id, full_name, display_name, total_score, is_connected')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data.map(toParticipant)
}

export async function getMyParticipant(sessionId: string): Promise<Participant | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data, error } = await supabase
    .from('participants')
    .select('id, session_id, user_id, full_name, display_name, total_score, is_connected')
    .eq('session_id', sessionId)
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (error) throw error
  return data ? toParticipant(data) : null
}

export async function removeParticipant(participantId: string): Promise<void> {
  const { error } = await supabase.from('participants').delete().eq('id', participantId)
  if (error) throw error
}
