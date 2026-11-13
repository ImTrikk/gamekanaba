import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { pinSchema } from '@/lib/validations/session'

export function JoinGamePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [pin, setPin] = useState(searchParams.get('pin') ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = pinSchema.safeParse(pin)
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid PIN')
      return
    }
    setValidationError(null)
    navigate(`/join/register?pin=${result.data}`)
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-medium">Join a game</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          placeholder="Game PIN"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {validationError && <p className="text-sm text-destructive">{validationError}</p>}
        <Button type="submit">Continue</Button>
      </form>
    </div>
  )
}
