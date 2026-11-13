import { useQuery } from '@tanstack/react-query'
import { getGame, listGames } from '@/features/games/api/games'

export const gamesQueryKeys = {
  list: ['games'] as const,
  detail: (gameId: string) => ['games', gameId] as const,
}

export function useGames() {
  return useQuery({
    queryKey: gamesQueryKeys.list,
    queryFn: listGames,
  })
}

export function useGame(gameId: string | undefined) {
  return useQuery({
    queryKey: gamesQueryKeys.detail(gameId ?? ''),
    queryFn: () => getGame(gameId!),
    enabled: Boolean(gameId),
  })
}
