import { Navigate, Outlet } from 'react-router'
import { useHostSession } from '@/features/auth/hooks/useSession'

export function ProtectedHostRoute() {
  const { isLoading, isHost } = useHostSession()

  if (isLoading) return null
  if (!isHost) return <Navigate to="/host/sign-in" replace />

  return <Outlet />
}
