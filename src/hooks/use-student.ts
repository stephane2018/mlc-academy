import { useQuery } from '@tanstack/react-query'
import { studentService } from '@/services/student'

/** Profil + progression de l'élève courant. */
export function useStudentMe() {
  return useQuery({ queryKey: ['student', 'me'], queryFn: () => studentService.me() })
}

/** Maîtrise par matière de l'élève courant. */
export function useStudentSkills() {
  return useQuery({ queryKey: ['student', 'skills'], queryFn: () => studentService.skills() })
}
