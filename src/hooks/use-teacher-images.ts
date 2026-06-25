import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teacherImagesService } from '@/services/teacher-images'

const KEY = ['teacher', 'images'] as const

/** Banque d'images du prof courant. */
export function useTeacherImages() {
  return useQuery({ queryKey: KEY, queryFn: () => teacherImagesService.list() })
}

/** Enregistre une image uploadée dans la banque. */
export function useRegisterImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ storagePath, fileName }: { storagePath: string; fileName?: string | null }) =>
      teacherImagesService.register(storagePath, fileName),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Retire une image de la banque. */
export function useDeleteTeacherImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teacherImagesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
