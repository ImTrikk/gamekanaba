import { z } from 'zod'

export const hostCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
})

export type HostCredentialsInput = z.infer<typeof hostCredentialsSchema>
