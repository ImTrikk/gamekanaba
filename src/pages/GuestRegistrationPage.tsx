import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useJoinSession } from '@/features/sessions/hooks/useParticipants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { participantNameSchema } from '@/lib/validations/participant'
import { pinSchema } from '@/lib/validations/session'

export function GuestRegistrationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pinResult = pinSchema.safeParse(searchParams.get('pin') ?? '')

  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const joinSession = useJoinSession()

  if (!pinResult.success) {
    return (
      <div className="mx-auto max-w-sm py-16">
        <p className="text-destructive">Missing or invalid game PIN.</p>
        <Button className="mt-4" onClick={() => navigate('/join')}>
          Back to join
        </Button>
      </div>
    )
  }

  const pin = pinResult.data

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = participantNameSchema.safeParse({ fullName, displayName })
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setValidationError(null)
    joinSession.mutate(
      { pin, input: result.data },
      {
        onSuccess: (participant) => navigate(`/play/${participant.sessionId}/lobby`),
      },
    )
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-medium">Join game {pin}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        {validationError && <p className="text-sm text-destructive">{validationError}</p>}
        {joinSession.isError && (
          <p className="text-sm text-destructive">{joinSession.error.message}</p>
        )}
        <Button type="submit" disabled={joinSession.isPending}>
          Join
        </Button>
      </form>
    </div>
  )
}
