import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  questionsService,
  type CreateQuestionInput,
  type QuestionListParams,
  type UpdateQuestionInput,
} from '@/services/questions'

/** Clé de cache racine de la banque de questions. */
const QUESTIONS_KEY = ['questions'] as const

/** Liste des questions (filtrable par matière/thème + pagination). */
export function useQuestions(params?: QuestionListParams) {
  return useQuery({
    queryKey: [...QUESTIONS_KEY, params ?? {}],
    queryFn: () => questionsService.list(params),
  })
}

/** Détail d'une question (activable via `enabled`). */
export function useQuestion(id: string | null) {
  return useQuery({
    queryKey: [...QUESTIONS_KEY, 'detail', id],
    queryFn: () => questionsService.get(id as string),
    enabled: Boolean(id),
  })
}

/** Création d'une question + invalidation de la liste. */
export function useCreateQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => questionsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUESTIONS_KEY }),
  })
}

/** Édition d'une question + invalidation de la liste. */
export function useUpdateQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuestionInput }) =>
      questionsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUESTIONS_KEY }),
  })
}

/** Suppression d'une question + invalidation de la liste. */
export function useDeleteQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => questionsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUESTIONS_KEY }),
  })
}
