import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface SessionState {
  session: Session | null
  isLoading: boolean
}

export function useSession() {
  const [state, setState] = useState<SessionState>({ session: null, isLoading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, isLoading: false })
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isLoading: false })
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return state
}

export function useHostSession() {
  const { session, isLoading } = useSession()
  const isHost = session !== null && session.user.is_anonymous !== true
  return { session, isLoading, isHost }
}
