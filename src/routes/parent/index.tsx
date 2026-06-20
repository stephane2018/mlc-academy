import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Target,
  Flame,
  BellRing,
  Lock,
  TrendingUp,
  FileText,
  ArrowRight,
  Sparkles,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHero, RailLayout, StatTile, SparkBars } from '@/components/blocks'
import { useChildren, useChildOverview } from '@/hooks/use-parent'
import { useReports } from '@/hooks/use-reports'

export const Route = createFileRoute('/parent/')({
  component: ParentDashboard,
})

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 font-heading text-xl font-extrabold tracking-tight lg:text-2xl">{value}</p>
    </div>
  )
}

function ParentDashboard() {
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const overview = useChildOverview(child?.id)
  const reportsQuery = useReports({ limit: 20 })

  if (childrenQuery.isLoading) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Chargement…</div>
  }

  // Aucun enfant rattaché → invitation à lier un compte enfant.
  if (!child) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <SoftIcon tone="brand" className="mx-auto">
          <Sparkles className="size-5" />
        </SoftIcon>
        <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">Aucun enfant rattaché</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre enfant génère un code de liaison depuis son profil, puis vous le saisissez ici.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/connexion-parent">Lier mon enfant</Link>
        </Button>
      </div>
    )
  }

  const weekly = overview.data?.weeklyXp ?? []
  const weekXp = weekly.reduce((sum, d) => sum + d.xp, 0)
  const skills = overview.data?.skills ?? []
  const avgScore = overview.data?.avgScore

  const reports = reportsQuery.data ?? []
  const unreadReports = reports.filter((r) => !r.read).length
  const latestReport = reports[0]

  return (
    <div className="space-y-6 pb-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        variant="brand"
        eyebrow="Espace Parent"
        title={`${child.pseudo} progresse bien 👏`}
        subtitle="Suivez ses progrès en toute sérénité — un espace en lecture seule, pensé pour rester proche de ses apprentissages."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroStat label="XP cette semaine" value={`${weekXp}`} />
          <HeroStat label="Score moyen" value={avgScore != null ? `${avgScore}%` : '—'} />
          <HeroStat label="Série" value={`${child.streak} j`} />
          <HeroStat label="Niveau" value={`${child.level}`} />
        </div>
      </PageHero>

      <RailLayout
        rail={
          <>
            {/* Régularité */}
            <Card className="gap-0 rounded-2xl p-4 shadow-soft">
              <SectionHeader title="Régularité" />
              <div className="flex items-center gap-3">
                <SoftIcon tone="amber">
                  <Flame className="size-5" />
                </SoftIcon>
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight">{child.streak} jours</p>
                  <p className="text-xs text-muted-foreground">Connexions consécutives</p>
                </div>
              </div>
            </Card>

            {/* Alerte automatique */}
            <Card className="flex-row items-start gap-3 rounded-2xl border-0 bg-info-soft p-4">
              <BellRing className="mt-0.5 size-5 shrink-0 text-info" />
              <p className="text-sm text-foreground">
                Alerte automatique si <span className="font-semibold">{child.pseudo}</span> est inactif 3 jours
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
        {/* Stat tiles */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatTile icon={Sparkles} tone="brand" label="XP cette semaine" value={`${weekXp}`} />
          <StatTile
            icon={Target}
            tone="teal"
            label="Score moyen"
            value={avgScore != null ? `${avgScore}%` : '—'}
          />
          <StatTile
            icon={Flame}
            tone="amber"
            label="Série en cours"
            value={`${child.streak} j`}
            className="sm:col-span-2 xl:col-span-1"
          />
        </div>

        {/* Rapports reçus */}
        <Card className="gap-0 rounded-3xl p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight">Rapports</h2>
            <Button asChild size="sm" variant="ghost">
              <Link to="/parent/devoirs">
                Tout voir <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {reportsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : reports.length === 0 ? (
            <p className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Aucun rapport pour l'instant. Les rapports envoyés par les enseignants apparaîtront ici.
            </p>
          ) : (
            <>
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
                    rapport{unreadReports > 1 ? 's' : ''} non lu{unreadReports > 1 ? 's' : ''} sur {reports.length}
                  </p>
                </div>
              </Link>

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
                      {new Date(latestReport.createdAt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long' })}
                    </p>
                  </div>
                  {latestReport.score != null && (
                    <Badge
                      variant="secondary"
                      className={
                        latestReport.score >= 50 ? 'bg-success-soft text-success' : 'bg-destructive/10 text-destructive'
                      }
                    >
                      {latestReport.score}%
                    </Badge>
                  )}
                </Link>
              )}
            </>
          )}
        </Card>

        {/* XP — 7 derniers jours */}
        <Card className="card-hover gap-0 rounded-3xl p-5 shadow-soft">
          <SectionHeader title="XP — 7 derniers jours" />
          {overview.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <SparkBars data={weekly.map((d) => d.xp)} labels={weekly.map((d) => d.label)} height={160} color="var(--brand)" />
          )}
        </Card>

        {/* Progression par domaine */}
        <Card className="card-hover gap-0 rounded-3xl p-5 shadow-soft">
          <SectionHeader title="Progression par domaine" />
          {overview.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore de données de maîtrise.</p>
          ) : (
            <ul className="space-y-4">
              {skills.map((s) => (
                <li key={s.themeId} className="flex items-center gap-4">
                  <span className="w-28 shrink-0 text-sm font-medium">{s.label}</span>
                  <Meter value={s.mastery} color="auto" />
                  <span className="w-10 shrink-0 text-right font-heading text-sm font-bold tabular-nums">
                    {s.mastery}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {avgScore != null && (
          <Card className="card-hover flex-row items-center gap-4 rounded-3xl p-5 shadow-soft">
            <SoftIcon tone="teal">
              <TrendingUp className="size-5" />
            </SoftIcon>
            <div>
              <p className="font-heading text-3xl font-extrabold leading-none">{avgScore}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Score moyen sur les copies notées</p>
            </div>
          </Card>
        )}
      </RailLayout>
    </div>
  )
}
