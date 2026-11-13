import { z } from 'zod'

// Mirrors Project Plan section 4.3 (initial settings) and section 18 (confirmed defaults).
export const gameSettingsSchema = z.object({
  timerSeconds: z.union([z.literal(10), z.literal(20), z.literal(30)]).default(20),
  shuffleAnswers: z.boolean().default(false),
  showLeaderboardAfterQuestion: z.boolean().default(true),
})

export type GameSettings = z.infer<typeof gameSettingsSchema>

export const gameSettingsDefaults: GameSettings = gameSettingsSchema.parse({})

export const gameDetailsSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
})

export type GameDetailsInput = z.infer<typeof gameDetailsSchema>
