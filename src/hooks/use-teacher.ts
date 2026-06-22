import { useQuery } from '@tanstack/react-query'
import { teacherService } from '@/services/teacher'

/** Annuaire des élèves des groupes du prof courant. */
export function useTeacherStudents() {
  return useQuery({ queryKey: ['teacher', 'students'], queryFn: () => teacherService.students() })
}
