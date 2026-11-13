import { useState } from 'react'
import { AnswerEditor } from '@/features/questions/components/AnswerEditor'
import {
  useDeleteQuestion,
  useQuestions,
  useReorderQuestion,
  useUpdateQuestion,
} from '@/features/questions/hooks/useQuestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QuestionInput } from '@/lib/validations/question'

export function QuestionList({ gameId }: { gameId: string }) {
  const { data: questions, isLoading, error } = useQuestions(gameId)
  const updateQuestion = useUpdateQuestion(gameId)
  const deleteQuestion = useDeleteQuestion(gameId)
  const reorderQuestion = useReorderQuestion(gameId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) return <p className="text-muted-foreground">Loading questions…</p>
  if (error) return <p className="text-destructive">{error.message}</p>
  if (!questions || questions.length === 0) {
    return <p className="text-muted-foreground">No questions yet. Add one below.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {questions.map((question, index) => (
        <li key={question.id} className="rounded-md border p-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="sm"
                disabled={index === 0 || reorderQuestion.isPending}
                onClick={() =>
                  reorderQuestion.mutate({ questionId: question.id, direction: 'up' })
                }
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={index === questions.length - 1 || reorderQuestion.isPending}
                onClick={() =>
                  reorderQuestion.mutate({ questionId: question.id, direction: 'down' })
                }
              >
                ↓
              </Button>
            </div>

            <Input
              value={question.questionText}
              onChange={(e) => {
                const input: QuestionInput = {
                  questionText: e.target.value,
                  questionType: question.questionType,
                  points: question.points,
                }
                updateQuestion.mutate({ questionId: question.id, input })
              }}
            />

            <Select
              value={question.questionType}
              onValueChange={(value) => {
                const input: QuestionInput = {
                  questionText: question.questionText,
                  questionType: value as QuestionInput['questionType'],
                  points: question.points,
                }
                updateQuestion.mutate({ questionId: question.id, input })
              }}
            >
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
              value={question.points}
              onChange={(e) => {
                const input: QuestionInput = {
                  questionText: question.questionText,
                  questionType: question.questionType,
                  points: Number(e.target.value),
                }
                updateQuestion.mutate({ questionId: question.id, input })
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
            >
              {expandedId === question.id ? 'Hide answers' : 'Answers'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={deleteQuestion.isPending}
              onClick={() => deleteQuestion.mutate(question.id)}
            >
              Delete
            </Button>
          </div>

          {expandedId === question.id && (
            <div className="mt-3">
              <AnswerEditor questionId={question.id} questionType={question.questionType} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
