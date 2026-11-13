import { z } from 'zod'

// Mirrors the check constraints on public.participants (see migration
// 20261113130512_init_schema.sql). Keep these two in sync if either changes.
export const participantNameSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  displayName: z.string().trim().min(1).max(50),
})

export type ParticipantNameInput = z.infer<typeof participantNameSchema>
