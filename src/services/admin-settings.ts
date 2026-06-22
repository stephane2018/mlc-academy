import { api } from '@/lib/api-client'

/** Valeur JSON quelconque stockée dans APP_SETTINGS. */
export type SettingValue = string | number | boolean | null | SettingValue[] | { [key: string]: SettingValue }

/** Map clé → valeur renvoyée par `GET /admin/settings`. */
export type AppSettings = Record<string, SettingValue>

export type UpdateSettingInput = { key: string; value: SettingValue }

/** Service réglages plateforme (rôle admin) — `/admin/settings` (clé/valeur JSON). */
export const adminSettingsService = {
  list: () => api.get<AppSettings>('/admin/settings'),
  update: ({ key, value }: UpdateSettingInput) => api.put<{ ok: true }>('/admin/settings', { key, value }),
}
