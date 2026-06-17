import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Dumbbell,
  Plus,
  Clock,
  CalendarDays,
  Users,
  ArrowRight,
  Target,
  TrendingUp,
} from '@/components/icons'
import { Meter } from '@/components/student/parts'
import { PageHero, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  assignments,
  submissionsForAssignment,
  domainLabels,
  type Assignment,
  type AssignmentType,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/exercices/')({
  component: ExercicesList,
})

type FilterKey = 'tout' | AssignmentType

const filters: { key: FilterKey; label: string }[] = [
  { key: 'tout', label: 'Tout' },
  { key: 'devoir', label: 'Devoirs maison' },
  { key: 'evaluation', label: 'Évaluations surprise' },
]

const statusMeta: Record<Assignment['status'], string> = {
  publié: 'bg-success-soft text-success',
  brouillon: 'bg-secondary text-muted-foreground',
  clôturé: 'bg-info-soft text-info',
}

const difficultyMeta: Record<Assignment['difficulty'], string> = {
  facile: 'text-success',
  moyen: 'text-amber-foreground',
  difficile: 'text-destructive',
}

function rendusOf(a: Assignment) {
  const subs = submissionsForAssignment(a.id)
  return {
    total: subs.length,
    rendus: subs.filter((s) => s.status === 'rendu').length,
    scores: subs.filter((s) => typeof s.score === 'number').map((s) => s.score as number),
  }
}

function ExercicesList() {
  const [filter, setFilter] = useState<FilterKey>('tout')

  const stats = useMemo(() => {
    let pending = 0
    const allScores: number[] = []
    for (const a of assignments) {
      const { total, rendus, scores } = rendusOf(a)
      pending += total - rendus
      allScores.push(...scores)
    }
    const avg =
      allScores.length > 0
        ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length)
        : 0
    return { total: assignments.length, pending, avg }
  }, [])

  const visible = assignments.filter((a) => filter === 'tout' || a.type === filter)

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        variant="surface"
        eyebrow="Espace Prof"
        title="Devoirs & évaluations"
        subtitle="Crée des devoirs maison ou des évaluations surprise, assigne-les à tes groupes et suis les rendus."
        actions={
          <Button asChild>
            <Link to="/prof/exercices/nouveau">
              <Plus className="size-4" />
              Créer un exercice
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Dumbbell} tone="brand" label="Exercices créés" value={stats.total} />
        <StatTile
          icon={Clock}
          tone="amber"
          label="En attente de rendu"
          value={stats.pending}
        />
        <StatTile
          icon={TrendingUp}
          tone="success"
          label="Score moyen"
          value={`${stats.avg} %`}
        />
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-semibold transition',
                active
                  ? 'border-brand bg-brand text-white shadow-soft'
                  : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Cartes */}
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {visible.map((a) => {
          const { total, rendus } = rendusOf(a)
          const pct = total > 0 ? Math.round((rendus / total) * 100) : 0
          const isEval = a.type === 'evaluation'
          const target =
            a.groups.length > 0
              ? a.groups.join(', ')
              : a.students.length > 0
                ? `${a.students.length} élève${a.students.length > 1 ? 's' : ''}`
                : 'Non assigné'

          return (
            <Link
              key={a.id}
              to="/prof/exercices/$id"
              params={{ id: a.id }}
              className="card-hover block rounded-2xl"
            >
              <Card className="h-full gap-0 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant="secondary"
                    className={
                      isEval
                        ? 'bg-amber-soft text-amber-foreground'
                        : 'bg-brand-soft text-brand'
                    }
                  >
                    {isEval ? <Clock className="size-3.5" /> : <Dumbbell className="size-3.5" />}
                    {isEval ? 'Éval. surprise' : 'Devoir maison'}
                  </Badge>
                  <Badge variant="secondary" className={statusMeta[a.status]}>
                    {a.status}
                  </Badge>
                </div>

                <p className="mt-3 font-heading text-base font-bold leading-snug">{a.title}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{domainLabels[a.domain]}</span>
                  <span className={cn('font-semibold capitalize', difficultyMeta[a.difficulty])}>
                    {a.difficulty}
                  </span>
                  {isEval && a.durationMin && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {a.durationMin} min
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {a.dueDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {target}
                  </span>
                </div>

                {/* Progression de rendu */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Rendus</span>
                    <span className="font-bold tabular-nums">
                      {rendus}/{total}
                    </span>
                  </div>
                  <Meter value={pct} color="auto" className="mt-1.5" />
                </div>

                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand">
                  Voir les résultats
                  <ArrowRight className="size-4" />
                </div>
              </Card>
            </Link>
          )
        })}

        {visible.length === 0 && (
          <Card className="col-span-full items-center gap-3 p-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
              <Target className="size-6 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">Aucun exercice pour ce filtre.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
