import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHero, StatTile } from '@/components/blocks'
import { Meter } from '@/components/student/parts'
import {
  SubjectFilter,
  type SubjectFilterValue,
} from '@/components/student/subject-filter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, CheckSquare, Trophy, Target, Lock, RotateCcw, ArrowRight } from '@/components/icons'
import { cn } from '@/lib/utils'
import { getSubject, subjectLabel, type SubjectKey } from '@/lib/mock'
import { useExams } from '@/hooks/use-exams'
import { useSubjects } from '@/hooks/use-catalog'
import type { ExamListItem } from '@/services/exams'

export const Route = createFileRoute('/eleve/examens/')({
  component: ExamsPage,
})

const PASS_THRESHOLD = 50

/** Vue d'un examen prête pour le rendu (données backend + libellés résolus). */
type ExamView = {
  id: string
  title: string
  subject: SubjectKey
  theme: string
  durationMin: number
  questionCount: number
  premium: boolean
  bestScore: number | null
  attempts: { date: string; score: number }[]
}

const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const formatDay = (iso: string | null) => (iso ? dayMonth.format(new Date(iso)) : '')

function ExamsPage() {
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const { data: exams = [], isLoading } = useExams()
  const { data: subjects = [] } = useSubjects()

  // Référentiels matières/thèmes (id backend → code mock + libellés).
  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const themeName = (id: string | null) =>
    (id && subjects.flatMap((s) => s.themes).find((t) => t.id === id)?.name) || 'Tout le programme'

  const views: ExamView[] = exams.map((e: ExamListItem) => ({
    id: e.id,
    title: e.title,
    subject: (subjectById.get(e.subjectId)?.code ?? 'maths') as SubjectKey,
    theme: themeName(e.themeId),
    durationMin: e.durationMin,
    questionCount: e.questionCount,
    premium: e.premium,
    bestScore: e.bestScore,
    attempts: e.attempts.map((a) => ({ date: formatDay(a.submittedAt), score: a.score ?? 0 })),
  }))

  const subjectCounts: Partial<Record<SubjectFilterValue, number>> = {
    all: views.length,
  }
  for (const e of views) {
    subjectCounts[e.subject] = (subjectCounts[e.subject] ?? 0) + 1
  }

  const visible = views.filter((e) => subject === 'all' || e.subject === subject)

  const attempted = visible.filter((e) => e.bestScore !== null)
  const passed = attempted.filter((e) => (e.bestScore ?? 0) >= PASS_THRESHOLD)
  const avgBest =
    attempted.length > 0
      ? Math.round(attempted.reduce((sum, e) => sum + (e.bestScore ?? 0), 0) / attempted.length)
      : 0

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        variant="surface"
        eyebrow="S'évaluer"
        title="Examens blancs"
        subtitle="Des épreuves chronométrées, avec correction automatique. Obtiens +50 XP dès que tu réussis un examen (≥ 50 %)."
      />

      {/* Filtre par matière */}
      <SubjectFilter value={subject} onChange={setSubject} counts={subjectCounts} />

      {/* Synthèse */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={CheckSquare}
          tone="info"
          label="Examens tentés"
          value={`${attempted.length}/${visible.length}`}
        />
        <StatTile
          icon={Target}
          tone="info"
          label="Meilleur score moyen"
          value={attempted.length > 0 ? `${avgBest}%` : '—'}
        />
        <StatTile
          icon={Trophy}
          tone="success"
          label="Examens réussis (≥ 50 %)"
          value={`${passed.length}`}
        />
      </div>

      {/* Cartes examens */}
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement des examens…</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Aucun examen disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExamCard({ exam }: { exam: ExamView }) {
  const tried = exam.bestScore !== null
  const passed = tried && (exam.bestScore ?? 0) >= PASS_THRESHOLD

  return (
    <Card className="card-hover flex flex-col gap-4 rounded-2xl p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="gap-1.5 border-transparent"
              style={{ backgroundColor: `${getSubject(exam.subject).color}1a`, color: getSubject(exam.subject).color }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: getSubject(exam.subject).color }} />
              {subjectLabel(exam.subject)}
            </Badge>
            <Badge className="bg-info-soft text-info">{exam.theme}</Badge>
          </div>
          <h3 className="mt-2 font-heading text-base font-bold leading-snug">{exam.title}</h3>
        </div>
        {exam.premium && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-xs font-bold text-amber-foreground">
            <Lock className="size-3.5" />
            Premium
          </span>
        )}
      </div>

      {/* Méta : durée + nb questions */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          {exam.durationMin} min
        </span>
        <span className="flex items-center gap-1.5">
          <CheckSquare className="size-4" />
          {exam.questionCount} questions
        </span>
      </div>

      {/* Meilleur score */}
      <div>
        {tried ? (
          <>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <Trophy className="size-4 text-amber" />
                Meilleur score
              </span>
              <span className={cn('font-bold', passed ? 'text-success' : 'text-amber-foreground')}>
                {exam.bestScore}%
              </span>
            </div>
            <Meter value={exam.bestScore ?? 0} color="auto" />
          </>
        ) : (
          <p className="text-sm font-medium text-muted-foreground">Jamais tenté</p>
        )}
      </div>

      {/* Historique des tentatives */}
      {exam.attempts.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {exam.attempts.map((a, i) => (
            <li key={i} className="flex items-center justify-between">
              <span>Tentative · {a.date}</span>
              <span className="font-semibold tabular-nums">{a.score}%</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-1">
        <Button asChild className="w-full rounded-xl bg-info text-white hover:bg-info/90">
          <Link to="/eleve/examens/$id" params={{ id: exam.id }}>
            {tried ? (
              <>
                <RotateCcw className="size-4" /> Refaire
              </>
            ) : (
              <>
                Commencer <ArrowRight className="size-4" />
              </>
            )}
          </Link>
        </Button>
      </div>
    </Card>
  )
}
