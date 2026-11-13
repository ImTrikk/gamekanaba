import { useNavigate, useParams } from 'react-router'
import { LeaderboardList } from '@/features/leaderboard/components/LeaderboardList'
import { Button } from '@/components/ui/button'

export function LeaderboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  if (!sessionId) return null

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Leaderboard</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <LeaderboardList sessionId={sessionId} />
    </div>
  )
}
