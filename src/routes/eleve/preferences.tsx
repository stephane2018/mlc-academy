import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { NotificationPreferences } from '@/components/notification-prefs'
import { elevePrefs, type PrefChannel } from '@/lib/mock'
import { useNotificationPrefs, useUpsertNotificationPref } from '@/hooks/use-notifications'
import type { NotifCategory, NotifChannel } from '@/services/notifications'

export const Route = createFileRoute('/eleve/preferences')({
  component: ElevePreferences,
})

function ElevePreferences() {
  const { data: serverPrefs = [], isLoading } = useNotificationPrefs()
  const upsert = useUpsertNotificationPref()

  // État serveur indexé par "catégorie:canal" → activé.
  const serverByKey = new Map(serverPrefs.map((p) => [`${p.category}:${p.channel}`, p.enabled]))
  // Les libellés/canaux restent la config UI ; l'état activé vient du BFF
  // (fallback sur les défauts si aucune préférence enregistrée).
  const prefs = elevePrefs.map((p) => ({
    ...p,
    defaults: p.channels.filter((ch) => serverByKey.get(`${p.key}:${ch}`) ?? p.defaults.includes(ch)),
  }))

  function save(state: Record<string, Record<string, boolean>>) {
    const changes: { category: NotifCategory; channel: NotifChannel; enabled: boolean }[] = []
    for (const p of elevePrefs) {
      for (const ch of p.channels) {
        const enabled = state[p.key]?.[ch] ?? false
        const current = serverByKey.get(`${p.key}:${ch}`) ?? p.defaults.includes(ch as PrefChannel)
        if (enabled !== current) {
          changes.push({ category: p.key as NotifCategory, channel: ch as NotifChannel, enabled })
        }
      }
    }
    if (changes.length === 0) {
      toast.success('Préférences à jour')
      return
    }
    Promise.all(changes.map((c) => upsert.mutateAsync(c)))
      .then(() => toast.success('Préférences enregistrées'))
      .catch(() => toast.error("Échec de l'enregistrement. Réessaie."))
  }

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[900px]">
      <Link
        to="/eleve/notifications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Notifications
      </Link>
      <PageHero
        eyebrow="Réglages"
        title="Préférences de notifications"
        subtitle="Choisis comment tu veux être prévenu pour chaque type d'alerte."
      />
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement de tes préférences…</p>
      ) : (
        <NotificationPreferences key={serverPrefs.length} prefs={prefs} onSave={save} saving={upsert.isPending} />
      )}
    </div>
  )
}
