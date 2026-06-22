import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft } from '@/components/icons'
import { NotificationPreferences } from '@/components/notification-prefs'
import { profPrefs, type PrefChannel } from '@/lib/mock'
import { useNotificationPrefs, useUpsertNotificationPref } from '@/hooks/use-notifications'
import type { NotifCategory, NotifChannel } from '@/services/notifications'

export const Route = createFileRoute('/prof/preferences')({
  component: ProfPreferences,
})

function ProfPreferences() {
  const { data: serverPrefs = [], isLoading } = useNotificationPrefs()
  const upsert = useUpsertNotificationPref()

  const serverByKey = new Map(serverPrefs.map((p) => [`${p.category}:${p.channel}`, p.enabled]))
  const prefs = profPrefs.map((p) => ({
    ...p,
    defaults: p.channels.filter((ch) => serverByKey.get(`${p.key}:${ch}`) ?? p.defaults.includes(ch)),
  }))

  function save(state: Record<string, Record<string, boolean>>) {
    const changes: { category: NotifCategory; channel: NotifChannel; enabled: boolean }[] = []
    for (const p of profPrefs) {
      for (const ch of p.channels) {
        const enabled = state[p.key]?.[ch] ?? false
        const current = serverByKey.get(`${p.key}:${ch}`) ?? p.defaults.includes(ch as PrefChannel)
        if (enabled !== current) changes.push({ category: p.key as NotifCategory, channel: ch as NotifChannel, enabled })
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
    <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
      <Link
        to="/prof/notifications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Notifications
      </Link>
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">Préférences de notifications</h1>
        <p className="text-sm text-muted-foreground">
          Choisis comment être prévenu pour chaque type d'alerte. Les e-mails arrivent sur ton adresse pro.
        </p>
      </div>
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement de tes préférences…</p>
      ) : (
        <NotificationPreferences key={serverPrefs.length} prefs={prefs} onSave={save} saving={upsert.isPending} />
      )}
    </div>
  )
}
