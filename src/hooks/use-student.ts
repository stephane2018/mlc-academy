import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentService, type GameAnswer } from '@/services/student'

/** Profil + progression de l'élève courant. */
export function useStudentMe() {
  return useQuery({ queryKey: ['student', 'me'], queryFn: () => studentService.me() })
}

/** Maîtrise par matière de l'élève courant. */
export function useStudentSkills() {
  return useQuery({ queryKey: ['student', 'skills'], queryFn: () => studentService.skills() })
}

/** Questions d'un quiz pour une matière (rechargées à chaque partie). */
export function useQuizQuestions(subjectId: string | undefined) {
  return useQuery({
    queryKey: ['student', 'questions', subjectId],
    queryFn: () => studentService.questions(subjectId!),
    enabled: !!subjectId,
    staleTime: 0,
  })
}

/** Soumet une partie (validation + XP serveur) ; rafraîchit profil & classement. */
export function useSubmitGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { subjectId: string; answers: GameAnswer[]; durationSec?: number }) =>
      studentService.submitGame(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student'] })
      qc.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

/** Rejoint le groupe d'un prof via son code ; rafraîchit live & messagerie. */
export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => studentService.joinGroup(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['live'] })
      qc.invalidateQueries({ queryKey: ['messaging'] })
    },
  })
}
