import { supabase } from '@/lib/supabase/client'
import type { GameDetailsInput, GameSettings } from '@/lib/validations/game'
import { gameSettingsDefaults, gameSettingsSchema } from '@/lib/validations/game'

export interface Game {
  id: string
  hostId: string
  title: string
  description: string | null
  coverImagePath: string | null
  settings: GameSettings
  createdAt: string
  updatedAt: string
}

function toGame(row: {
  id: string
  host_id: string
  title: string
  description: string | null
  cover_image_path: string | null
  settings: unknown
  created_at: string
  updated_at: string
}): Game {
  const settingsResult = gameSettingsSchema.safeParse(row.settings)
  return {
    id: row.id,
    hostId: row.host_id,
    title: row.title,
    description: row.description,
    coverImagePath: row.cover_image_path,
    settings: settingsResult.success ? settingsResult.data : gameSettingsDefaults,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, host_id, title, description, cover_image_path, settings, created_at, updated_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data.map(toGame)
}

export async function getGame(gameId: string): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .select('id, host_id, title, description, cover_image_path, settings, created_at, updated_at')
    .eq('id', gameId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return toGame(data)
}

export async function createGame(input: GameDetailsInput): Promise<Game> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) throw new Error('No authenticated host session.')

  const { data, error } = await supabase
    .from('games')
    .insert({
      host_id: userData.user.id,
      title: input.title,
      description: input.description || null,
      settings: gameSettingsDefaults,
    })
    .select('id, host_id, title, description, cover_image_path, settings, created_at, updated_at')
    .single()

  if (error) throw error
  return toGame(data)
}

export async function updateGameDetails(gameId: string, input: GameDetailsInput): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .update({
      title: input.title,
      description: input.description || null,
    })
    .eq('id', gameId)
    .select('id, host_id, title, description, cover_image_path, settings, created_at, updated_at')
    .single()

  if (error) throw error
  return toGame(data)
}

export async function updateGameSettings(gameId: string, settings: GameSettings): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .update({ settings })
    .eq('id', gameId)
    .select('id, host_id, title, description, cover_image_path, settings, created_at, updated_at')
    .single()

  if (error) throw error
  return toGame(data)
}

export async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', gameId)

  if (error) throw error
}
