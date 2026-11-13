import { supabase } from '@/lib/supabase/client'
import type { HostCredentialsInput } from '@/lib/validations/auth'

export async function signInHost({ email, password }: HostCredentialsInput) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpHost({ email, password }: HostCredentialsInput) {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signOutHost() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
