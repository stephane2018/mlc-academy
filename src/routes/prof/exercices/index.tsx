import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Dumbbell,
  Plus,
  Clock,
  CalendarDays,
  CheckSquare,
  ArrowRight,
  Target,
  FileText,
} from '@/components/icons'
import { SubjectFilter, type SubjectFilterValue } from '@/components/student/subject-filter'
import { PageHero, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QueryError } from '@/components/query-error'
import { cn } from '@/lib/utils'
import type { SubjectKey } from '@/lib/mock'
import { useAssignments } from '@/hooks/use-assignments'
import { useSubjects } from '@/hooks/use-catalog'
import type { AssignmentListItem } from '@/services/assignments'

export const Route = createFileRoute('/prof/exercices/')({
  component: ExercicesList,
})

type FilterKey = 'tout' | 'devoir' | 'evaluation'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'tout', label: 'Tout' },
  { key: 'devoir', label: 'Devoirs maison' },
  { key: 'evaluation', label: 'Évaluations surprise' },
]

const STATUS_LABEL: Record<string, string> = { brouillon: 'Brouillon', publie: 'Publié', cloture: 'Clôturé' }
const STATUS_STYLE: Record<string, string> = {
  publie: 'bg-success-soft text-success',
  brouillon: 'bg-secondary text-muted-foreground',
  cloture: 'bg-info-soft text-info',
}
const difficultyMeta: Record<string, string> = {
  facile: 'text-success',
  moyen: 'text-amber-foreground',
  difficile: 'text-destructive',
}

function ExercicesList() {
  const [filter, setFilter] = useState<FilterKey>('tout')
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const assignmentsQ = useAssignments()
  const assignments = assignmentsQ.data ?? []
  const isLoading = assignmentsQ.isLoading
  const { data: subjects = [] } = useSubjects()

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const themeName = (id: string | null) => (id && subjects.flatMap((s) => s.themes).find((t) => t.id === id)?.name) || null
  const subjectCode = (id: string) => (subjectById.get(id)?.code ?? '') as SubjectKey

  const total = assignments.length
  const published = assignments.filter((a) => a.status === 'publie').length
  const drafts = assignments.filter((a) => a.status === 'brouillon').length

  const visible = assignments.filter(
    (a) => (filter === 'tout' || a.type === filter) && (subject === 'all' || subjectCode(a.subjectId) === subject),
  )

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
        <StatTile icon={Dumbbell} tone="brand" label="Exercices créés" value={total} />
        <StatTile icon={CheckSquare} tone="success" label="Publiés" value={published} />
        <StatTile icon={FileText} tone="amber" label="Brouillons" value={drafts} />
      </div>

      {/* Filtre par matière */}
      <SubjectFilter value={subject} onChange={setSubject} />

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
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement de tes exercices…</p>
      ) : assignmentsQ.isError ? (
        <QueryError onRetry={() => assignmentsQ.refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visible.map((a: AssignmentListItem) => {
            const isEval = a.type === 'evaluation'
            const subj = subjectById.get(a.subjectId)
            const theme = themeName(a.themeId)
            return (
              <Link key={a.id} to="/prof/exercices/$id" params={{ id: a.id }} className="card-hover block rounded-2xl">
                <Card className="h-full gap-0 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="secondary" className={isEval ? 'bg-amber-soft text-amber-foreground' : 'bg-brand-soft text-brand'}>
                      {isEval ? <Clock className="size-3.5" /> : <Dumbbell className="size-3.5" />}
                      {isEval ? 'Éval. surprise' : 'Devoir maison'}
                    </Badge>
                    <Badge variant="secondary" className={STATUS_STYLE[a.status] ?? 'bg-secondary text-muted-foreground'}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </Badge>
                  </div>

                  <p className="mt-3 font-heading text-base font-bold leading-snug">{a.title}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {subj && (
                      <Badge variant="secondary" className="border-transparent text-white" style={{ backgroundColor: subj.color ?? 'var(--brand)' }}>
                        {subj.name}
                      </Badge>
                    )}
                    {theme && <span className="font-medium text-foreground">{theme}</span>}
                    <span className={cn('font-semibold capitalize', difficultyMeta[a.difficulty])}>{a.difficulty}</span>
                    {isEval && a.durationMin && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {a.durationMin} min
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {a.dueDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {a.dueDate}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <CheckSquare className="size-3.5" />
                      {a.questionCount} question{a.questionCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand">
                    Voir le détail
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
      )}
    </div>
  )
}
