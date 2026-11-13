import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createGame,
  deleteGame,
  updateGameDetails,
  updateGameSettings,
} from '@/features/games/api/games'
import { gamesQueryKeys } from '@/features/games/hooks/useGames'
import type { GameDetailsInput } from '@/lib/validations/game'
import type { GameSettings } from '@/lib/validations/game'

export function useCreateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamesQueryKeys.list })
    },
  })
}

export function useUpdateGameDetails(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: GameDetailsInput) => updateGameDetails(gameId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamesQueryKeys.list })
      queryClient.invalidateQueries({ queryKey: gamesQueryKeys.detail(gameId) })
    },
  })
}

export function useUpdateGameSettings(gameId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (settings: GameSettings) => updateGameSettings(gameId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamesQueryKeys.detail(gameId) })
    },
  })
}

export function useDeleteGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamesQueryKeys.list })
    },
  })
}
