import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Settings } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/blocks'
import { NotificationCenter } from '@/components/notifications'
import { notificationsFor, type Notification, type NotifKind } from '@/lib/mock'

export const Route = createFileRoute('/parent/notifications')({
  component: ParentNotifications,
})

function routeFor(kind: NotifKind) {
  switch (kind) {
    case 'rapport':
    case 'devoir':
    case 'resultat':
      return '/parent/devoirs' as const
    default:
      return '/parent' as const
  }
}

function ParentNotifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Notification[]>(() => notificationsFor('parent'))

  const open = (n: Notification) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    navigate({ to: routeFor(n.kind) })
  }
  const markAll = () => setItems((prev) => prev.map((x) => ({ ...x, read: true })))

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[900px]">
      <PageHero
        eyebrow="Espace Parent"
        title="Notifications"
        subtitle="Rapports, devoirs et cours de votre enfant."
        actions={
          <Button asChild variant="outline">
            <Link to="/parent/preferences">
              <Settings className="size-4" /> Préférences
            </Link>
          </Button>
        }
      />
      <NotificationCenter items={items} onOpen={open} onMarkAllRead={markAll} />
    </div>
  )
}
