import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { NotificationPreferences } from '@/components/notification-prefs'
import { elevePrefs } from '@/lib/mock'

export const Route = createFileRoute('/eleve/preferences')({
  component: ElevePreferences,
})

function ElevePreferences() {
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
      <NotificationPreferences prefs={elevePrefs} />
    </div>
  )
}
