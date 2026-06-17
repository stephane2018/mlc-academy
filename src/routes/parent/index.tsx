import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Clock,
  Target,
  Flame,
  Radio,
  FileDown,
  BellRing,
  Lock,
  CalendarDays,
  TrendingUp,
  FileText,
  Dumbbell,
  ArrowRight,
} from '@/components/icons'
import { toast } from 'sonner'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHero, RailLayout, StatTile, SparkBars, SparkArea } from '@/components/blocks'
import {
  parentChild,
  weeklyActivity,
  skills,
  parentReports,
  childAssignments,
} from '@/lib/mock'

export const Route = createFileRoute('/parent/')({
  component: ParentDashboard,
})

const totalMinutes = weeklyActivity.reduce((sum, d) => sum + d.minutes, 0)
const hours = Math.floor(totalMinutes / 60)
const mins = totalMinutes % 60
const weekLabel = `${hours} h ${String(mins).padStart(2, '0')}`

const activityMinutes = weeklyActivity.map((d) => d.minutes)
const activityLabels = weeklyActivity.map((d) => d.label)

// Tendance du score moyen sur les dernières semaines (donnée mockée locale).
const scoreTrend = [68, 70, 69, 72, 74, 73, 76, 78]

const childItems = childAssignments('s1', 'Groupe A', parentChild.pseudo)
const pendingDevoirs = childItems.filter((i) => i.submission?.status !== 'rendu').length
const unreadReports = parentReports.filter((r) => !r.read).length
const latestReport = parentReports[0]

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 font-heading text-xl font-extrabold tracking-tight lg:text-2xl">{value}</p>
    </div>
  )
}

function ParentDashboard() {
  return (
    <div className="space-y-6 pb-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        variant="brand"
        eyebrow="Espace Parent"
        title={`${parentChild.pseudo} progresse bien 👏`}
        subtitle="Régulier et motivé cette semaine : continuez à l'encourager, les efforts paient. Vous suivez ses progrès en toute sérénité."
        actions={
          <Button
            variant="secondary"
            className="bg-white text-brand hover:bg-white/90"
            onClick={() =>
              toast.info('Rapport mensuel en préparation', {
                description: 'Vous recevrez le PDF par e-mail.',
              })
            }
          >
            <FileDown className="size-4" />
            Télécharger le rapport mensuel (PDF)
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroStat label="Cette semaine" value={weekLabel} />
          <HeroStat label="Score moyen" value={`${parentChild.avgScore}%`} />
          <HeroStat label="Série" value={`${parentChild.streak} j`} />
          <HeroStat label="Échéance CE1D" value="J-47" />
        </div>
      </PageHero>

      <RailLayout
        rail={
          <>
            {/* Prochain cours live */}
            <Card className="card-hover flex-row items-center gap-3 rounded-2xl p-4 shadow-soft">
              <SoftIcon tone="teal">
                <Radio className="size-5" />
              </SoftIcon>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prochain cours live
                </p>
                <p className="font-heading text-base font-bold">{parentChild.nextLive}</p>
              </div>
            </Card>

            {/* Régularité */}
            <Card className="gap-0 rounded-2xl p-4 shadow-soft">
              <SectionHeader title="Régularité" />
              <div className="flex items-center gap-3">
                <SoftIcon tone="amber">
                  <Flame className="size-5" />
                </SoftIcon>
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight">
                    {parentChild.streak} jours
                  </p>
                  <p className="text-xs text-muted-foreground">Record : 18 jours</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-success-soft px-3 py-2">
                <span className="text-sm font-medium text-foreground">Objectif hebdo atteint</span>
                <span className="font-heading text-sm font-bold text-success">5 / 7 jours</span>
              </div>
            </Card>

            {/* Alerte automatique */}
            <Card className="flex-row items-start gap-3 rounded-2xl border-0 bg-info-soft p-4">
              <BellRing className="mt-0.5 size-5 shrink-0 text-info" />
              <p className="text-sm text-foreground">
                Alerte automatique si{' '}
                <span className="font-semibold">{parentChild.pseudo}</span> est inactif 3 jours
                d'affilée.
              </p>
            </Card>

            {/* Rappel lecture seule */}
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Espace en lecture seule — pas d'accès au contenu pédagogique.
            </p>
          </>
        }
      >
        {/* Stat tiles avec tendance */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatTile
            icon={Clock}
            tone="brand"
            label="Temps cette semaine"
            value={weekLabel}
            delta="+35 min"
            trend="up"
          />
          <StatTile
            icon={Target}
            tone="teal"
            label="Score moyen ce mois"
            value={`${parentChild.avgScore}%`}
            delta="+6 pts"
            trend="up"
          />
          <StatTile
            icon={CalendarDays}
            tone="amber"
            label="Échéance CE1D"
            value="J-47"
            className="sm:col-span-2 xl:col-span-1"
          />
        </div>

        {/* Devoirs & rapports */}
        <Card className="gap-0 rounded-3xl p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight">Devoirs & rapports</h2>
            <Button asChild size="sm" variant="ghost">
              <Link to="/parent/devoirs">
                Tout voir <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/parent/devoirs"
              className="card-hover flex items-center gap-3 rounded-2xl border border-border p-3"
            >
              <SoftIcon tone="amber">
                <Dumbbell className="size-5" />
              </SoftIcon>
              <div>
                <p className="font-heading text-2xl font-extrabold leading-none">{pendingDevoirs}</p>
                <p className="text-xs text-muted-foreground">
                  devoir{pendingDevoirs > 1 ? 's' : ''} à rendre
                </p>
              </div>
            </Link>
            <Link
              to="/parent/devoirs"
              className="card-hover flex items-center gap-3 rounded-2xl border border-border p-3"
            >
              <SoftIcon tone="brand">
                <FileText className="size-5" />
              </SoftIcon>
              <div>
                <p className="font-heading text-2xl font-extrabold leading-none">{unreadReports}</p>
                <p className="text-xs text-muted-foreground">
                  rapport{unreadReports > 1 ? 's' : ''} non lu{unreadReports > 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          </div>

          {latestReport && (
            <Link
              to="/parent/devoirs"
              className="mt-3 flex items-center gap-3 rounded-2xl bg-secondary/50 p-3 transition-colors hover:bg-secondary"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Dernier rapport reçu
                </p>
                <p className="truncate text-sm font-semibold">{latestReport.title}</p>
                <p className="text-xs text-muted-foreground">
                  {latestReport.teacher} · {latestReport.date}
                </p>
              </div>
              {latestReport.score != null && (
                <Badge
                  variant="secondary"
                  className={
                    latestReport.score >= 50
                      ? 'bg-success-soft text-success'
                      : 'bg-destructive/10 text-destructive'
                  }
                >
                  {latestReport.score}%
                </Badge>
              )}
            </Link>
          )}

          {pendingDevoirs > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-soft p-3 text-xs text-amber-foreground">
              <BellRing className="size-4 shrink-0" />
              <span>
                <span className="font-semibold">{parentChild.pseudo}</span> a {pendingDevoirs} devoir
                {pendingDevoirs > 1 ? 's' : ''} à rendre — pensez à l'encourager.
              </span>
            </div>
          )}
        </Card>

        {/* Temps de travail — SparkBars en grand */}
        <Card className="card-hover gap-0 rounded-3xl p-5 shadow-soft">
          <SectionHeader title="Temps de travail — 7 derniers jours" />
          <SparkBars
            data={activityMinutes}
            labels={activityLabels}
            height={160}
            color="var(--brand)"
          />
        </Card>

        {/* Progression par domaine */}
        <Card className="card-hover gap-0 rounded-3xl p-5 shadow-soft">
          <SectionHeader title="Progression par domaine" />
          <ul className="space-y-4">
            {skills.map((s) => (
              <li key={s.key} className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-sm font-medium">{s.label}</span>
                <Meter value={s.mastery} color="auto" />
                <span className="w-10 shrink-0 text-right font-heading text-sm font-bold tabular-nums">
                  {s.mastery}%
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Score moyen — tendance SparkArea */}
        <Card className="card-hover gap-0 rounded-3xl p-5 shadow-soft">
          <SectionHeader title="Score moyen — tendance" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-heading text-3xl font-extrabold leading-none">
                {parentChild.avgScore}%
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-success">
                <TrendingUp className="size-3.5" />
                +6 pts sur 8 semaines
              </p>
            </div>
          </div>
          <div className="mt-4">
            <SparkArea data={scoreTrend} color="var(--teal)" height={72} />
          </div>
        </Card>
      </RailLayout>
    </div>
  )
}
