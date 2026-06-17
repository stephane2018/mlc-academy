import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Video,
  CalendarDays,
  Clock,
  Users,
  GraduationCap,
  Play,
  RotateCcw,
} from '@/components/icons'
import { SectionHeader } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PageHero } from '@/components/blocks'
import { liveSessions, type LiveSession } from '@/lib/mock'

export const Route = createFileRoute('/eleve/live')({
  component: LivePage,
})

const timeline = [
  { label: 'Lancement', min: '0–5 min' },
  { label: 'Quiz révision', min: '5–15 min' },
  { label: 'Nouveau contenu', min: '15–35 min' },
  { label: 'Exercices', min: '35–55 min' },
  { label: 'Clôture', min: '55–60 min' },
]

function LivePage() {
  const upcoming = liveSessions.filter((s) => s.status === 'upcoming')
  const replays = liveSessions.filter((s) => s.status === 'replay')
  const featured = upcoming[0]
  const others = upcoming.slice(1)

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="En direct"
        title="Cours live"
        subtitle="60 minutes en direct avec ton prof, chaque semaine."
      />

      {/* Carte vedette */}
      {featured && (
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-brand to-indigo-500 p-5 text-white shadow-brand-glow">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              Prochain cours
            </span>
          </div>
          <h2 className="mt-2 font-heading text-2xl font-extrabold">{featured.title}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {featured.date} · {featured.time}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {featured.durationMin} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {featured.group}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-4" /> {featured.teacher}
            </span>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-4 w-full rounded-xl bg-white text-brand hover:bg-white/90"
          >
            <Link to="/eleve/salle/$id" params={{ id: featured.id }}>
              <Video className="size-5" /> Rejoindre le cours
            </Link>
          </Button>
        </Card>
      )}

      {/* Sections secondaires : 2 colonnes sur lg */}
      <div className="grid gap-5 lg:grid-cols-2">
      {/* Autres séances */}
      {others.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="À venir" />
          {others.map((s) => (
            <UpcomingRow key={s.id} session={s} />
          ))}
        </section>
      )}

      {/* Replays */}
      {replays.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="Replays disponibles" />
          {replays.map((s) => (
            <Card
              key={s.id}
              className="card-hover flex-row items-center gap-3 p-3.5 shadow-soft"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                <Play className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {s.date} · {s.durationMin} min
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">
                <RotateCcw className="size-4" /> Revoir
              </Button>
            </Card>
          ))}
        </section>
      )}

      {/* Structure du cours */}
      <section>
        <SectionHeader title="Le déroulé d'une heure" />
        <Card className="gap-0 p-4 shadow-soft">
          <ol className="space-y-0">
            {timeline.map((t, i) => (
              <li key={t.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
                    {i + 1}
                  </span>
                  {i < timeline.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-semibold leading-tight">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.min}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>
      </div>
    </div>
  )
}

function UpcomingRow({ session }: { session: LiveSession }) {
  const [confirmed, setConfirmed] = useState(session.confirmed)

  return (
    <Card className="gap-3 p-3.5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Video className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{session.title}</p>
          <p className="text-xs text-muted-foreground">
            {session.date} · {session.time} · {session.durationMin} min
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{session.teacher}</p>
        </div>
      </div>
      <label className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
        <span className="text-sm font-medium">
          {confirmed ? 'Je serai là 👍' : 'Je serai là'}
        </span>
        <Switch checked={confirmed} onCheckedChange={setConfirmed} />
      </label>
    </Card>
  )
}
