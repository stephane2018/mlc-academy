import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSettingsService, type AppSettings, type UpdateSettingInput } from '@/services/admin-settings'

const SETTINGS_KEY = ['admin', 'settings'] as const

/** Charge l'objet clé/valeur des réglages plateforme. */
export function useAdminSettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: () => adminSettingsService.list() })
}

/** Met à jour UNE clé de réglage à la fois (upsert). */
export function useUpdateSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSettingInput) => adminSettingsService.update(input),
    onSuccess: (_res, input) => {
      qc.setQueryData<AppSettings>(SETTINGS_KEY, (prev) => ({ ...(prev ?? {}), [input.key]: input.value }))
    },
  })
}
