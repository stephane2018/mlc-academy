import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Flame,
  CalendarDays,
  Clock,
  Trophy,
  ArrowRight,
  Gamepad2,
  Library,
  Video,
  Sparkles,
  CheckSquare,
  Store,
  Play,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon, avatarTint } from '@/components/student/parts'
import { BellBadge } from '@/components/notifications'
import { ThemeToggle } from '@/components/theme'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHero, RailLayout } from '@/components/blocks'
import { useStudentMe, useStudentSkills } from '@/hooks/use-student'
import { useBadges, useWeeklyLeaderboard } from '@/hooks/use-gamification'
import { useLiveSessions } from '@/hooks/use-live'

export const Route = createFileRoute('/eleve/dashboard')({
  component: DashboardPage,
})

const shortcuts = [
  { to: '/eleve/jeu', label: 'Jouer', desc: 'Quiz CE1D', icon: Gamepad2, tone: 'brand' as const },
  { to: '/eleve/examens', label: 'Examens', desc: 'Examens blancs', icon: CheckSquare, tone: 'info' as const },
  { to: '/eleve/bibliotheque', label: 'Bibliothèque', desc: 'Vidéos & cours', icon: Library, tone: 'violet' as const },
  { to: '/eleve/live', label: 'Cours live', desc: 'En direct', icon: Video, tone: 'success' as const },
  { to: '/eleve/boutique', label: 'Boutique', desc: 'Contenus premium', icon: Store, tone: 'amber' as const },
]

/** Jours avant le prochain CE1D (16 juin, date publique fixe). */
function ce1dCountdown(): number {
  const now = new Date()
  let target = new Date(now.getFullYear(), 5, 16)
  if (target.getTime() < now.getTime()) target = new Date(now.getFullYear() + 1, 5, 16)
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000))
}

function DashboardPage() {
  const meQuery = useStudentMe()
  const skillsQuery = useStudentSkills()
  const badgesQuery = useBadges()
  const liveQuery = useLiveSessions()
  const leaderboardQuery = useWeeklyLeaderboard()

  if (meQuery.isLoading) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Chargement…</div>
  }
  const me = meQuery.data
  if (!me) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Profil indisponible.</div>
  }

  const xpPct = me.xpForNextLevel ? Math.min(100, Math.round((me.xp / me.xpForNextLevel) * 100)) : 100
  const ringC = 2 * Math.PI * 26
  const ringOffset = ringC * (1 - xpPct / 100)
  const ce1dInDays = ce1dCountdown()

  const skills = skillsQuery.data ?? []
  const recentBadges = (badgesQuery.data ?? []).slice(0, 4)
  const top5 = (leaderboardQuery.data ?? []).slice(0, 5)
  const nextLive = (liveQuery.data ?? []).find((s) => s.status === 'upcoming') ?? (liveQuery.data ?? [])[0]

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="brand"
        eyebrow="Espace élève"
        title={<>Salut {me.pseudo} 👋</>}
        actions={
          <>
            <ThemeToggle className="text-white hover:bg-white/15 hover:text-white" />
            <Button asChild size="lg" variant="ghost" className="rounded-2xl px-3 text-white hover:bg-white/15 hover:text-white" aria-label="Notifications">
              <Link to="/eleve/notifications">
                <BellBadge count={0} />
              </Link>
            </Button>
            <Button asChild size="lg" className="rounded-2xl bg-white px-5 text-brand shadow-soft hover:bg-white/90">
              <Link to="/eleve/jeu">
                <Play className="size-5 fill-brand" /> Jouer
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
                <circle cx="30" cy="30" r="26" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringOffset} />
              </svg>
              <span className="absolute font-heading text-lg font-extrabold">{me.level}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Niveau {me.level}</p>
              <p className="font-heading text-lg font-bold">
                {me.xp}{' '}
                <span className="text-sm font-medium text-white/70">
                  {me.xpForNextLevel != null ? `/ ${me.xpForNextLevel} XP` : 'XP'}
                </span>
              </p>
              <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          {/* Série */}
          <div className="flex items-center gap-2 rounded-2xl bg-amber px-3.5 py-2.5 text-white shadow-sm">
            <Flame className="size-5" />
            <div className="leading-none">
              <p className="font-heading text-lg font-bold">{me.streak}</p>
              <p className="text-[11px] text-white/85">jours 🔥</p>
            </div>
          </div>

          {/* Compteur CE1D */}
          <div className="flex items-center gap-2 rounded-2xl bg-info px-3.5 py-2.5 text-white shadow-sm">
            <CalendarDays className="size-5" />
            <div className="leading-none">
              <p className="font-heading text-lg font-bold">J-{ce1dInDays}</p>
              <p className="text-[11px] text-white/85">CE1D</p>
            </div>
          </div>
        </div>
      </PageHero>

      <RailLayout
        rail={
          <>
            {/* Classement hebdo */}
            <Card className="gap-0 p-4 shadow-soft">
              <SectionHeader
                title="Classement"
                action={
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Trophy className="size-4 text-amber" /> Cette semaine
                  </span>
                }
              />
              {leaderboardQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
              ) : top5.length === 0 ? (
                <p className="text-sm text-muted-foreground">Pas encore de classement cette semaine.</p>
              ) : (
                <ul className="space-y-1.5">
                  {top5.map((p) => (
                    <li key={p.studentId} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
                      <span className="w-5 shrink-0 text-center font-heading text-sm font-bold text-muted-foreground">{p.rankInClass}</span>
                      <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-base ${avatarTint(p.pseudo)}`}>{p.avatar}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.pseudo}</span>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-muted-foreground">{p.weekXp}</span>
                    </li>
                  ))}
                </ul>
              )}
              {me.weekRank != null && (
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-brand-soft px-2 py-2 text-brand ring-1 ring-brand/15">
                  <span className="w-5 shrink-0 text-center font-heading text-sm font-bold">{me.weekRank}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-base">{me.avatar}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {me.pseudo} <span className="font-medium text-brand/70">(toi)</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{me.weekXp}</span>
                </div>
              )}
            </Card>

            {/* Prochain cours live */}
            {nextLive && (
              <Card className="gap-0 p-4 shadow-soft">
                <SectionHeader title="Prochain cours live" />
                <div className="flex items-start gap-3">
                  <SoftIcon tone="success">
                    <Video className="size-5" />
                  </SoftIcon>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{nextLive.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />{' '}
                      {new Date(nextLive.scheduledAt).toLocaleString('fr-BE', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" /> {nextLive.durationMin} min
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-3 w-full rounded-xl bg-success text-white hover:bg-success/90">
                  <Link to="/eleve/live">
                    <Video className="size-4" /> Voir le live
                  </Link>
                </Button>
              </Card>
            )}

            {/* Badges récents */}
            {recentBadges.length > 0 && (
              <Card className="gap-0 p-4 shadow-soft">
                <SectionHeader
                  title="Badges récents"
                  action={
                    <Link to="/eleve/badges" className="flex items-center gap-1 text-sm font-semibold text-brand">
                      Tout voir <ArrowRight className="size-4" />
                    </Link>
                  }
                />
                <div className="grid grid-cols-4 gap-2">
                  {recentBadges.map((b) => (
                    <div key={b.id} className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center ${avatarTint(b.id)}`}>
                      <span className="grid size-10 place-items-center rounded-full bg-card text-xl shadow-sm">{b.emoji}</span>
                      <span className="text-[10px] font-semibold leading-tight text-foreground">{b.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        }
      >
        {/* XP de la semaine */}
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-success to-emerald-600 p-5 text-white shadow-lg shadow-success/20">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/80">
            <Sparkles className="size-4" /> Ta semaine
          </span>
          <h3 className="mt-2 font-heading text-2xl font-extrabold lg:text-3xl">{me.weekXp} XP gagnés</h3>
          <p className="mt-1 text-sm text-white/80">Continue à jouer pour grimper au classement 🚀</p>
          <Button asChild className="mt-5 h-9 w-fit rounded-full bg-white px-5 text-success hover:bg-white/90">
            <Link to="/eleve/jeu">Jouer maintenant</Link>
          </Button>
        </Card>

        {/* Mes compétences */}
        <Card className="p-5 shadow-soft">
          <SectionHeader
            title="Mes compétences"
            action={
              <Link to="/eleve/profil" className="flex items-center gap-1 text-sm font-semibold text-brand">
                Détails <ArrowRight className="size-4" />
              </Link>
            }
          />
          {skillsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : skills.length === 0 ? (
            <p className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Joue et fais des exercices pour révéler ta progression par domaine.
            </p>
          ) : (
            <div className="space-y-5">
              {skills.map((sm) => (
                <div key={sm.subjectId}>
                  <div className="flex items-center gap-4">
                    <span className="flex w-28 shrink-0 items-center gap-2 text-sm font-bold">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: sm.color ?? 'var(--brand)' }} />
                      <span className="truncate">{sm.subjectName}</span>
                    </span>
                    <Meter value={sm.mastery} color="auto" trackClassName="h-2.5" />
                    <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">{sm.mastery}%</span>
                  </div>
                  <ul className="mt-2.5 space-y-2 pl-[3.25rem]">
                    {sm.themes.map((t) => (
                      <li key={t.themeId} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{t.name}</span>
                        <Meter value={t.mastery} color="auto" className="opacity-70" trackClassName="h-1.5 w-24 shrink-0" />
                        <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">{t.mastery}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Raccourcis */}
        <div>
          <SectionHeader title="Raccourcis" action={<Sparkles className="size-4 text-amber" />} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
