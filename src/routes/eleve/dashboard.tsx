import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Flame,
  CalendarDays,
  Clock,
  Trophy,
  ChevronRight,
  Play,
  ArrowRight,
  Gamepad2,
  Library,
  Video,
  Target,
  Sparkles,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { BellBadge } from '@/components/notifications'
import { ThemeToggle } from '@/components/theme'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHero, RailLayout } from '@/components/blocks'
import { student, skills, dailyMission, badges, liveSessions, unreadCount } from '@/lib/mock'

export const Route = createFileRoute('/eleve/dashboard')({
  component: DashboardPage,
})

/** Classement local (mocké) — MaxLeBg est 14ᵉ, mis en surbrillance en bas. */
const leaderboard = [
  { rank: 1, pseudo: 'NinaPro', avatar: '🦊', points: 2480 },
  { rank: 2, pseudo: 'TomTom', avatar: '🐼', points: 2310 },
  { rank: 3, pseudo: 'Léa_2012', avatar: '🐱', points: 2155 },
  { rank: 4, pseudo: 'NoaMath', avatar: '🚀', points: 1990 },
  { rank: 5, pseudo: 'Zoé★', avatar: '🦁', points: 1870 },
]

function DashboardPage() {
  const xpPct = Math.round((student.xp / student.xpForNextLevel) * 100)
  const eleveUnread = unreadCount('eleve')
  const recentBadges = badges.filter((b) => b.unlocked).slice(0, 4)
  const nextLive = liveSessions.find((s) => s.status === 'upcoming') ?? liveSessions[0]
  // Circonférence de l'anneau XP (r = 26 → 2πr ≈ 163.36).
  const ringC = 2 * Math.PI * 26
  const ringOffset = ringC * (1 - xpPct / 100)

  const shortcuts = [
    {
      to: '/eleve/jeu',
      label: 'Jouer',
      desc: 'Quiz CE1D',
      icon: Gamepad2,
      tone: 'brand' as const,
    },
    {
      to: '/eleve/bibliotheque',
      label: 'Bibliothèque',
      desc: 'Vidéos & cours',
      icon: Library,
      tone: 'teal' as const,
    },
    {
      to: '/eleve/live',
      label: 'Cours live',
      desc: 'En direct',
      icon: Video,
      tone: 'amber' as const,
    },
  ]

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      {/* Héros joueur */}
      <PageHero
        variant="brand"
        eyebrow="Espace élève"
        title={<>Salut {student.pseudo} 👋</>}
        actions={
          <>
            <ThemeToggle className="text-white hover:bg-white/15 hover:text-white" />
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-2xl px-3 text-white hover:bg-white/15 hover:text-white"
              aria-label="Notifications"
            >
              <Link to="/eleve/notifications">
                <BellBadge count={eleveUnread} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-white px-5 text-brand shadow-soft hover:bg-white/90"
            >
              <Link to="/eleve/jeu">
                <Play className="size-5 fill-brand" /> Continuer le jeu
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          {/* Anneau XP + niveau */}
          <div className="flex items-center gap-3">
            <div className="relative grid size-16 shrink-0 place-items-center">
              <svg viewBox="0 0 60 60" className="size-16 -rotate-90">
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <span className="absolute font-heading text-lg font-extrabold">{student.level}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                Niveau {student.level}
              </p>
              <p className="font-heading text-lg font-bold">
                {student.xp}{' '}
                <span className="text-sm font-medium text-white/70">
                  / {student.xpForNextLevel} XP
                </span>
              </p>
              <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          {/* Chip streak */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3.5 py-2.5">
            <Flame className="size-5 text-amber-200" />
            <div className="leading-none">
              <p className="font-heading text-lg font-bold">{student.streak}</p>
              <p className="text-[11px] text-white/70">jours 🔥</p>
            </div>
          </div>

          {/* Compteur CE1D */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3.5 py-2.5">
            <CalendarDays className="size-5 text-white/80" />
            <div className="leading-none">
              <p className="font-heading text-lg font-bold">J-{student.ce1dInDays}</p>
              <p className="text-[11px] text-white/70">CE1D</p>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Contenu + rail */}
      <RailLayout
        rail={
          <>
            {/* Classement */}
            <Card className="gap-0 p-4 shadow-soft">
              <SectionHeader
                title="Classement"
                action={
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Trophy className="size-4 text-amber" /> Top 5
                  </span>
                }
              />
              <ul className="space-y-1.5">
                {leaderboard.map((p) => (
                  <li
                    key={p.rank}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5"
                  >
                    <span className="w-5 shrink-0 text-center font-heading text-sm font-bold text-muted-foreground">
                      {p.rank}
                    </span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-base">
                      {p.avatar}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {p.pseudo}
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                      {p.points}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Rang de l'élève, style condensé en surbrillance */}
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-brand-soft px-2 py-2 text-brand ring-1 ring-brand/15">
                <span className="w-5 shrink-0 text-center font-heading text-sm font-bold">
                  {student.rank}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-base">
                  {student.avatar}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  {student.pseudo} <span className="font-medium text-brand/70">(toi)</span>
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {student.pointsThisWeek}
                </span>
              </div>
            </Card>

            {/* Prochain cours live */}
            <Card className="gap-0 p-4 shadow-soft">
              <SectionHeader title="Prochain cours live" />
              <div className="flex items-start gap-3">
                <SoftIcon tone="amber">
                  <Video className="size-5" />
                </SoftIcon>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{nextLive.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {nextLive.date} · {nextLive.time}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {nextLive.durationMin} min · {nextLive.teacher}
                  </p>
                </div>
              </div>
              <Button asChild className="mt-3 w-full rounded-xl">
                <Link to="/eleve/live">
                  <Video className="size-4" /> Rejoindre
                </Link>
              </Button>
            </Card>

            {/* Badges récents */}
            <Card className="gap-0 p-4 shadow-soft">
              <SectionHeader
                title="Badges récents"
                action={
                  <Link
                    to="/eleve/badges"
                    className="flex items-center gap-1 text-sm font-semibold text-brand"
                  >
                    Tout voir <ArrowRight className="size-4" />
                  </Link>
                }
              />
              <div className="grid grid-cols-4 gap-2">
                {recentBadges.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-amber-soft/60 p-2.5 text-center"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-card text-xl shadow-sm">
                      {b.emoji}
                    </span>
                    <span className="text-[10px] font-semibold leading-tight text-amber-foreground">
                      {b.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        }
      >
        {/* Mission du jour */}
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-brand to-indigo-500 p-5 text-white shadow-brand-glow">
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/70">
              <Target className="size-4" /> Mission du jour
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
              +{dailyMission.xpReward} XP
            </span>
          </div>
          <h3 className="mt-2 font-heading text-2xl font-extrabold lg:text-3xl">
            {dailyMission.title}
          </h3>
          <p className="mt-1 text-sm text-white/75">Domaine : {dailyMission.skill}</p>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${(dailyMission.done / dailyMission.total) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-bold">
              {dailyMission.done}/{dailyMission.total}
            </span>
            <Button
              asChild
              className="h-9 shrink-0 rounded-full bg-white px-5 text-brand hover:bg-white/90"
            >
              <Link to="/eleve/jeu">Continuer</Link>
            </Button>
          </div>
        </Card>

        {/* Reprendre le jeu */}
        <Link to="/eleve/jeu" className="block">
          <Card className="card-hover flex-row items-center gap-4 p-4 shadow-soft">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand text-white">
              <Play className="size-6 fill-white" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-base font-bold">Reprendre le jeu</p>
              <p className="text-sm text-muted-foreground">Fractions · question 3/5</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Card>
        </Link>

        {/* Mes compétences */}
        <Card className="p-5 shadow-soft">
          <SectionHeader
            title="Mes compétences"
            action={
              <Link
                to="/eleve/profil"
                className="flex items-center gap-1 text-sm font-semibold text-brand"
              >
                Détails <ArrowRight className="size-4" />
              </Link>
            }
          />
          <ul className="space-y-4">
            {skills.map((s) => (
              <li key={s.key} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm font-semibold">{s.label}</span>
                <Meter value={s.mastery} color="auto" trackClassName="h-2.5" />
                <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">
                  {s.mastery}%
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Raccourcis */}
        <div>
          <SectionHeader
            title="Raccourcis"
            action={<Sparkles className="size-4 text-amber" />}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {shortcuts.map((s) => {
              const Icon = s.icon
              return (
                <Link key={s.to} to={s.to} className="block">
                  <Card className="card-hover h-full gap-0 p-4 shadow-soft">
                    <SoftIcon tone={s.tone}>
                      <Icon className="size-5" />
                    </SoftIcon>
                    <p className="mt-3 font-heading text-base font-bold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </RailLayout>
    </div>
  )
}
