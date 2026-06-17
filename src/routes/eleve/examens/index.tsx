import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHero, StatTile } from '@/components/blocks'
import { Meter } from '@/components/student/parts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, CheckSquare, Trophy, Target, Lock, RotateCcw, ArrowRight } from '@/components/icons'
import { cn } from '@/lib/utils'
import { exams } from '@/lib/mock'

export const Route = createFileRoute('/eleve/examens/')({
  component: ExamsPage,
})

const PASS_THRESHOLD = 50

function ExamsPage() {
  const attempted = exams.filter((e) => e.bestScore !== null)
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

      {/* Synthèse */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={CheckSquare}
          tone="brand"
          label="Examens tentés"
          value={`${attempted.length}/${exams.length}`}
        />
        <StatTile
          icon={Target}
          tone="teal"
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </div>
  )
}

function ExamCard({ exam }: { exam: (typeof exams)[number] }) {
  const tried = exam.bestScore !== null
  const passed = tried && (exam.bestScore ?? 0) >= PASS_THRESHOLD

  return (
    <Card className="card-hover flex flex-col gap-4 rounded-2xl p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge className="bg-brand-soft text-brand">{exam.theme}</Badge>
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
        <Button asChild className="w-full rounded-xl">
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
