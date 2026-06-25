/**
 * Résolution d'avatar → emoji affichable.
 *
 * Convention de l'app : `avatar` stocke directement un emoji (cf. sélecteur
 * d'onboarding). Mais d'anciens comptes ont pu être créés avec un *id* texte
 * ('robot', 'astronaute'…) issu du défaut du trigger. Le rendu brut afficherait
 * alors le mot au lieu de l'emoji. Ce helper rattrape ces cas :
 *  - valeur vide → repli
 *  - id legacy connu → emoji correspondant
 *  - toute chaîne contenant des lettres ASCII (donc pas un emoji) → repli
 *  - sinon (déjà un emoji) → renvoyé tel quel
 */

/** Ids legacy du catalogue → emoji (table `avatars` jamais seedée). */
const LEGACY_IDS: Record<string, string> = {
  robot: '🤖',
  astronaute: '🚀',
  renard: '🦊',
  chat: '🐱',
  panda: '🐼',
  lion: '🦁',
  grenouille: '🐸',
  hibou: '🦉',
  tigre: '🐯',
  pingouin: '🐧',
  licorne: '🦄',
  poulpe: '🐙',
}

export const DEFAULT_AVATAR = '🙂'

export function resolveAvatar(value?: string | null, fallback = DEFAULT_AVATAR): string {
  if (!value) return fallback
  const v = value.trim()
  if (!v) return fallback
  const legacy = LEGACY_IDS[v.toLowerCase()]
  if (legacy) return legacy
  // Un emoji ne contient pas de lettre ASCII : si c'en est une → id/texte invalide.
  if (/[a-zA-Z]/.test(v)) return fallback
  return v
}

/** Palette proposée à l'onboarding — un avatar *choisi* est stocké tel quel (emoji). */
export const AVATAR_POOL = ['🤖', '🦊', '🚀', '🐱', '🐼', '🦁', '🐸', '🦉', '🐯', '🐧', '🦄', '🐙'] as const

/** Hash déterministe (FNV-1a 32 bits) → index stable dans la palette. */
function seedIndex(seed: string, len: number): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return Math.abs(h) % len
}

/**
 * Comme {@link resolveAvatar}, mais répartit les comptes *non personnalisés* sur
 * toute la palette pour éviter une mer de robots identiques (listes, classement…).
 *
 * On ne cible que le défaut DB jamais customisé : la chaîne `'robot'` (issue du
 * `coalesce(..., 'robot')` du trigger) ou une valeur vide. Un élève ayant vraiment
 * choisi le robot a stocké l'emoji `'🤖'` → préservé.
 */
export function spreadAvatar(value: string | null | undefined, seed: string): string {
  const v = value?.trim().toLowerCase()
  if (!v || v === 'robot') return AVATAR_POOL[seedIndex(seed, AVATAR_POOL.length)]
  return resolveAvatar(value)
}
