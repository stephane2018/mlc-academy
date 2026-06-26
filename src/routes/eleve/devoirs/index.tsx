import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Dumbbell,
  Clock,
  Zap,
  Trophy,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  FileText,
} from '@/components/icons'
import { Meter, SoftIcon } from '@/components/student/parts'
import { PageHero } from '@/components/blocks'
import {
  SubjectFilter,
  type SubjectFilterValue,
} from '@/components/student/subject-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getSubject, subjectLabel, type SubjectKey } from '@/lib/mock'
import { useAssignments } from '@/hooks/use-assignments'
import { useSubjects } from '@/hooks/use-catalog'
import type { AssignmentListItem, AssignmentSubmission } from '@/services/assignments'

export const Route = createFileRoute('/eleve/devoirs/')({
  component: DevoirsListPage,
})

/** Vue d'un devoir prête pour le rendu (données backend + libellés résolus). */
type AView = {
  id: string
  title: string
  subject: SubjectKey
  theme: string
  type: string
  durationMin: number | null
  questionCount: number
  xpReward: number
  dueDate: string | null
  submission: AssignmentSubmission | null
}

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const formatDay = (iso: string | null) => (iso ? dayMonth.format(new Date(iso)) : '—')

function isEval(a: AView) {
  return a.type === 'evaluation' && typeof a.durationMin === 'number'
}

function DevoirsListPage() {
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const { data: assignments = [], isLoading } = useAssignments()
  const { data: subjects = [] } = useSubjects()

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const themeName = (id: string | null) =>
    (id && subjects.flatMap((s) => s.themes).find((t) => t.id === id)?.name) || 'Tout le programme'

  // On ne montre à l'élève que les devoirs publiés qui le ciblent (RLS le garantit déjà).
  const all: AView[] = assignments.map((a: AssignmentListItem) => ({
    id: a.id,
    title: a.title,
    subject: (subjectById.get(a.subjectId)?.code ?? 'maths') as SubjectKey,
    theme: themeName(a.themeId),
    type: a.type,
    durationMin: a.durationMin,
    questionCount: a.questionCount,
    xpReward: a.xpReward,
    dueDate: a.dueDate,
    submission: a.submission,
  }))

  const subjectCounts: Partial<Record<SubjectFilterValue, number>> = {
    all: all.length,
  }
  for (const a of all) {
    subjectCounts[a.subject] = (subjectCounts[a.subject] ?? 0) + 1
  }

  const filtered = all.filter((a) => subject === 'all' || a.subject === subject)

  const todo = filtered.filter((a) => a.submission?.status !== 'rendu')
  const done = filtered
    .map((a) => ({ assignment: a, submission: a.submission }))
    .filter((x) => x.submission?.status === 'rendu')

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 2xl:max-w-4xl">
      <PageHero
        variant="surface"
        eyebrow="Travail à rendre"
        title="Mes devoirs"
        subtitle="Tes devoirs maison et évaluations surprises, au même endroit."
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/eleve/historique">
              <Trophy className="size-4" /> Voir l'historique
            </Link>
          </Button>
        }
      />

      {/* Filtre par matière */}
      <SubjectFilter value={subject} onChange={setSubject} counts={subjectCounts} />

      {isLoading && (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement de tes devoirs…</p>
      )}

      {/* À faire */}
      {!isLoading && (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-bold tracking-tight">À faire</h2>
          <Badge variant="secondary">{todo.length}</Badge>
        </div>

        {todo.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-6" />}
            title="Rien à rendre pour l'instant"
            subtitle="Tu es à jour, profites-en pour t'entraîner !"
          />
        ) : (
          <div className="space-y-3">
            {todo.map((a) => (
              <TodoCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </section>
      )}

      {/* Terminés */}
      {!isLoading && done.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-bold tracking-tight">Terminés</h2>
            <Badge variant="secondary">{done.length}</Badge>
          </div>
          <div className="space-y-3">
            {done.map(({ assignment, submission }) => (
              <DoneCard key={assignment.id} assignment={assignment} submission={submission!} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function TodoCard({ assignment: a }: { assignment: AView }) {
  const evaluation = isEval(a)

  return (
    <Link
      to="/eleve/devoirs/$id"
      params={{ id: a.id }}
      className={cn(
        'card-hover block rounded-2xl border bg-card p-4 shadow-soft sm:p-5',
        evaluation ? 'border-amber/40 ring-1 ring-amber/20' : 'border-border',
      )}
    >
      <div className="flex items-start gap-4">
        <SoftIcon tone={evaluation ? 'amber' : 'brand'}>
          {evaluation ? <Zap className="size-5" /> : <Dumbbell className="size-5" />}
        </SoftIcon>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {evaluation ? (
              <Badge className="bg-amber text-amber-foreground">Éval. surprise</Badge>
            ) : (
              <Badge variant="secondary">Devoir maison</Badge>
            )}
            <SubjectBadge subject={a.subject} />
            <Badge variant="outline">{a.theme}</Badge>
          </div>

          <h3 className="mt-2 font-heading text-base font-bold leading-snug">{a.title}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> à rendre pour {formatDay(a.dueDate)}
            </span>
            <span>
              {a.questionCount} question{a.questionCount > 1 ? 's' : ''}
            </span>
            {evaluation && (
              <span className="flex items-center gap-1 font-semibold text-amber-foreground">
                <Clock className="size-4" /> chronométré · {a.durationMin} min
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-sm font-bold text-amber-foreground">
              <Zap className="size-4 fill-amber text-amber" /> +{a.xpReward} XP
            </span>
            <Button size="sm" className="rounded-xl" tabIndex={-1}>
              Commencer <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

function DoneCard({
  assignment: a,
  submission: s,
}: {
  assignment: AView
  submission: AssignmentSubmission
}) {
  const score = s.score ?? 0
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex items-start gap-4">
        <SoftIcon tone="success">
          <CheckCircle2 className="size-5" />
        </SoftIcon>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {a.type === 'evaluation' ? 'Évaluation' : 'Devoir maison'}
            </Badge>
            <SubjectBadge subject={a.subject} />
            <Badge variant="outline">{a.theme}</Badge>
            <span className="text-xs text-muted-foreground">rendu le {formatDay(s.submittedAt)}</span>
          </div>

          <h3 className="mt-2 font-heading text-base font-bold leading-snug">{a.title}</h3>

          {s.hasFile && s.score === null ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-soft px-3 py-1.5 text-xs font-semibold text-amber-foreground">
              <FileText className="size-4" /> Copie remise — en attente de correction
            </p>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <Meter value={score} color="auto" className="flex-1" />
              <span className="w-12 text-right font-heading text-sm font-bold tabular-nums">
                {score}%
              </span>
            </div>
          )}

          {s.feedback && (
            <div className="mt-3 rounded-xl bg-secondary/60 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Récap du prof</p>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{s.feedback}</p>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/eleve/historique">Voir le détail</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubjectBadge({ subject }: { subject: SubjectKey }) {
  const s = getSubject(subject)
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-transparent"
      style={{ backgroundColor: `${s.color}1a`, color: s.color }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {subjectLabel(subject)}
    </Badge>
  )
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-success-soft text-success">
        {icon}
      </span>
      <p className="font-heading font-bold">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}
