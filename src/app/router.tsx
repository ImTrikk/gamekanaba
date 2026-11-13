import { createBrowserRouter } from 'react-router'
import { ProtectedHostRoute } from '@/features/auth/components/ProtectedHostRoute'
import { FinalResultsPage } from '@/pages/FinalResultsPage'
import { GameBuilderPage } from '@/pages/GameBuilderPage'
import { GameSettingsPage } from '@/pages/GameSettingsPage'
import { GuestRegistrationPage } from '@/pages/GuestRegistrationPage'
import { HostDashboardPage } from '@/pages/HostDashboardPage'
import { HostGameScreenPage } from '@/pages/HostGameScreenPage'
import { HostLobbyPage } from '@/pages/HostLobbyPage'
import { HostSignInPage } from '@/pages/HostSignInPage'
import { JoinGamePage } from '@/pages/JoinGamePage'
import { LandingPage } from '@/pages/LandingPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { PlayerGameScreenPage } from '@/pages/PlayerGameScreenPage'
import { PlayerLobbyPage } from '@/pages/PlayerLobbyPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/join', element: <JoinGamePage /> },
  { path: '/join/register', element: <GuestRegistrationPage /> },
  { path: '/host/sign-in', element: <HostSignInPage /> },
  {
    element: <ProtectedHostRoute />,
    children: [
      { path: '/host/dashboard', element: <HostDashboardPage /> },
      { path: '/host/games/:gameId/edit', element: <GameBuilderPage /> },
      { path: '/host/games/:gameId/settings', element: <GameSettingsPage /> },
      { path: '/host/sessions/:sessionId/lobby', element: <HostLobbyPage /> },
      { path: '/host/sessions/:sessionId/play', element: <HostGameScreenPage /> },
    ],
  },
  { path: '/play/:sessionId/lobby', element: <PlayerLobbyPage /> },
  { path: '/play/:sessionId', element: <PlayerGameScreenPage /> },
  { path: '/sessions/:sessionId/leaderboard', element: <LeaderboardPage /> },
  { path: '/sessions/:sessionId/results', element: <FinalResultsPage /> },
])
