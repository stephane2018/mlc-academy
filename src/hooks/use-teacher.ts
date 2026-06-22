import { useMutation, useQuery } from '@tanstack/react-query'
import { teacherService } from '@/services/teacher'

/** Annuaire des élèves des groupes du prof courant. */
export function useTeacherStudents() {
  return useQuery({ queryKey: ['teacher', 'students'], queryFn: () => teacherService.students() })
}

/** Fiche détaillée d'un élève (profil + compétences). */
export function useTeacherStudent(id: string) {
  return useQuery({ queryKey: ['teacher', 'students', id], queryFn: () => teacherService.student(id), enabled: !!id })
}

/** Réinitialise le PIN d'un élève (prof). */
export function useResetStudentPin() {
  return useMutation({ mutationFn: ({ id, pin }: { id: string; pin: string }) => teacherService.resetPin(id, pin) })
}
