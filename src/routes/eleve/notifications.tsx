import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Settings } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/blocks'
import { NotificationCenter } from '@/components/notifications'
import { notificationsFor, type Notification, type NotifKind } from '@/lib/mock'

export const Route = createFileRoute('/eleve/notifications')({
  component: EleveNotifications,
})

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
  const [items, setItems] = useState<Notification[]>(() => notificationsFor('eleve'))

  const open = (n: Notification) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    navigate({ to: routeFor(n.kind) })
  }
  const markAll = () => setItems((prev) => prev.map((x) => ({ ...x, read: true })))

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
      <NotificationCenter items={items} onOpen={open} onMarkAllRead={markAll} />
    </div>
  )
}
