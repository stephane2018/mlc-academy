import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Settings } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/blocks'
import { NotificationCenter } from '@/components/notifications'
import type { Notification, NotifKind } from '@/lib/mock'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'

export const Route = createFileRoute('/eleve/notifications')({
  component: EleveNotifications,
})

/** Mappe une catégorie backend → un `NotifKind` connu de l'UI (fallback sûr). */
const KNOWN_KINDS: NotifKind[] = ['devoir', 'rapport', 'resultat', 'live', 'inactivite', 'badge', 'message', 'systeme']
function toKind(kind: string): NotifKind {
  if (kind === 'retard') return 'devoir'
  return KNOWN_KINDS.includes(kind as NotifKind) ? (kind as NotifKind) : 'systeme'
}

const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function routeFor(kind: NotifKind) {
  switch (kind) {
    case 'devoir':
      return '/eleve/devoirs' as const
    case 'resultat':
      return '/eleve/historique' as const
    case 'live':
      return '/eleve/live' as const
    case 'badge':
      return '/eleve/badges' as const
    case 'message':
      return '/eleve/messages' as const
    case 'systeme':
      return '/eleve/classement' as const
    default:
      return '/eleve/dashboard' as const
  }
}

function EleveNotifications() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const items: Notification[] = data.map((n) => ({
    id: n.id,
    audience: 'eleve',
    kind: toKind(n.kind),
    title: n.title,
    body: n.body ?? '',
    time: dateTime.format(new Date(n.createdAt)),
    read: n.read,
  }))

  const open = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id)
    navigate({ to: routeFor(n.kind) })
  }
  const markAll = () => markAllRead.mutate()

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[900px]">
      <PageHero
        eyebrow="Alertes"
        title="Notifications"
        subtitle="Devoirs, cours live, badges et messages."
        actions={
          <Button asChild variant="outline">
            <Link to="/eleve/preferences">
              <Settings className="size-4" /> Préférences
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement des notifications…</p>
      ) : (
        <NotificationCenter items={items} onOpen={open} onMarkAllRead={markAll} />
      )}
    </div>
  )
}
