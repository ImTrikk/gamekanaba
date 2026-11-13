import { z } from 'zod'

// 6-digit numeric PIN, matching generatePin() in features/sessions/api/sessions.ts.
export const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'PIN must be 6 digits.')
