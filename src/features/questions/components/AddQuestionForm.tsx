import { useState } from 'react'
import { useCreateQuestion } from '@/features/questions/hooks/useQuestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QuestionType } from '@/lib/validations/question'
import { questionInputSchema } from '@/lib/validations/question'

export function AddQuestionForm({ gameId }: { gameId: string }) {
  const createQuestion = useCreateQuestion(gameId)
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice')
  const [points, setPoints] = useState(1000)
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = questionInputSchema.safeParse({ questionText, questionType, points })
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid question')
      return
    }
    setValidationError(null)
    createQuestion.mutate(result.data, {
      onSuccess: () => setQuestionText(''),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
      <Input
        placeholder="New question text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />
      <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
          <SelectItem value="true_false">True / False</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        className="w-24"
        value={points}
        onChange={(e) => setPoints(Number(e.target.value))}
      />
      <Button type="submit" disabled={createQuestion.isPending}>
        Add question
      </Button>
      {validationError && <p className="text-sm text-destructive">{validationError}</p>}
    </form>
  )
}
