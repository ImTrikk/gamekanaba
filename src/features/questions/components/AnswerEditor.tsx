import { useState } from 'react'
import { useAnswers, useReplaceAnswers } from '@/features/answers/hooks/useAnswers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AnswerChoiceInput } from '@/lib/validations/answer'
import { answerSetSchema } from '@/lib/validations/answer'
import type { QuestionType } from '@/lib/validations/question'

const expectedChoiceCount: Record<QuestionType, number> = {
  multiple_choice: 4,
  true_false: 2,
}

function emptyChoices(questionType: QuestionType): AnswerChoiceInput[] {
  return Array.from({ length: expectedChoiceCount[questionType] }, () => ({
    answerText: '',
    isCorrect: false,
  }))
}

function AnswerEditorForm({
  questionId,
  questionType,
  initialChoices,
}: {
  questionId: string
  questionType: QuestionType
  initialChoices: AnswerChoiceInput[]
}) {
  const replaceAnswers = useReplaceAnswers(questionId)
  const [choices, setChoices] = useState<AnswerChoiceInput[]>(initialChoices)
  const [validationError, setValidationError] = useState<string | null>(null)

  function updateText(index: number, answerText: string) {
    setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, answerText } : c)))
  }

  function setCorrect(index: number) {
    setChoices((prev) => prev.map((c, i) => ({ ...c, isCorrect: i === index })))
  }

  function handleSave() {
    const result = answerSetSchema(questionType).safeParse(choices)
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Invalid answer choices')
      return
    }
    setValidationError(null)
    replaceAnswers.mutate(result.data)
  }

  return (
    <div className="flex flex-col gap-2 pl-4">
      {choices.map((choice, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${questionId}`}
            checked={choice.isCorrect}
            onChange={() => setCorrect(index)}
            aria-label={`Mark choice ${index + 1} correct`}
          />
          <Input
            value={choice.answerText}
            onChange={(e) => updateText(index, e.target.value)}
            placeholder={`Answer choice ${index + 1}`}
          />
        </div>
      ))}
      {validationError && <p className="text-sm text-destructive">{validationError}</p>}
      {replaceAnswers.isError && (
        <p className="text-sm text-destructive">{replaceAnswers.error.message}</p>
      )}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={replaceAnswers.isPending}
        onClick={handleSave}
      >
        Save answers
      </Button>
    </div>
  )
}

export function AnswerEditor({
  questionId,
  questionType,
}: {
  questionId: string
  questionType: QuestionType
}) {
  const { data: answers, isLoading } = useAnswers(questionId)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading answers…</p>

  const initialChoices =
    answers && answers.length > 0
      ? answers.map((a) => ({ answerText: a.answerText, isCorrect: a.isCorrect }))
      : emptyChoices(questionType)

  return (
    <AnswerEditorForm
      key={questionId}
      questionId={questionId}
      questionType={questionType}
      initialChoices={initialChoices}
    />
  )
}
