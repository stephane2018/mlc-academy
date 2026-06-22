import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  contentService,
  type ClassInput,
  type ClassPatch,
  type SubjectInput,
  type SubjectPatch,
  type ThemeInput,
  type ThemePatch,
} from '@/services/content'

/**
 * Mutations du référentiel de contenu (admin).
 * Toutes invalident `['catalog']` → resync de `useClasses` / `useSubjects`.
 */
const CATALOG_KEY = ['catalog'] as const

/* ------------------------------- Classes ------------------------------- */

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ClassInput) => contentService.createClass(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ClassPatch }) =>
      contentService.updateClass(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

export function useDeleteClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contentService.deleteClass(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

/* ------------------------------- Matières ------------------------------ */

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SubjectInput) => contentService.createSubject(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

export function useUpdateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SubjectPatch }) =>
      contentService.updateSubject(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

/* -------------------------------- Thèmes ------------------------------- */

export function useAddTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ subjectId, input }: { subjectId: string; input: ThemeInput }) =>
      contentService.createTheme(subjectId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

export function useUpdateTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ThemePatch }) =>
      contentService.updateTheme(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}
