import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { signInHost, signUpHost } from '@/features/auth/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hostCredentialsSchema } from '@/lib/validations/auth'

export function HostSignInPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: mode === 'sign-in' ? signInHost : signUpHost,
    onSuccess: () => navigate('/host/dashboard'),
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = hostCredentialsSchema.safeParse({ email, password })
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setValidationError(null)
    mutation.mutate(result.data)
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-2xl font-medium">
        {mode === 'sign-in' ? 'Host sign-in' : 'Create host account'}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {validationError && <p className="text-sm text-destructive">{validationError}</p>}
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </Button>
        <button
          type="button"
          className="text-sm text-muted-foreground underline"
          onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
        >
          {mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
