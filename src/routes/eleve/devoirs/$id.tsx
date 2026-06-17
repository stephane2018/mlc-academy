import { useEffect, useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  X,
  Clock,
  Check,
  Trophy,
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckSquare,
} from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getAssignment,
  domainLabels,
  type Assignment,
  type AssignmentQuestion,
} from '@/lib/mock'

export const Route = createFileRoute('/eleve/devoirs/$id')({
  component: DevoirRunner,
})

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function DevoirRunner() {
  const { id } = useParams({ from: '/eleve/devoirs/$id' })
  const assignment = getAssignment(id)

  if (!assignment) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-secondary text-2xl">🔍</div>
        <div className="space-y-1">
          <h1 className="font-heading text-xl font-bold">Devoir introuvable</h1>
          <p className="text-sm text-muted-foreground">
            Ce devoir n'existe pas ou n'est plus disponible.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/eleve/devoirs">
            <ArrowLeft className="size-4" /> Retour à mes devoirs
          </Link>
        </Button>
      </div>
    )
  }

  return <DevoirSession assignment={assignment} />
}

function DevoirSession({ assignment }: { assignment: Assignment }) {
  const questions = assignment.questions
  const total = questions.length
  const timed = assignment.type === 'evaluation' && typeof assignment.durationMin === 'number'

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(total).fill(null))
  const [done, setDone] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState((assignment.durationMin ?? 0) * 60)

  // Chronomètre décroissant (évaluations) ; soumission auto à 0.
  useEffect(() => {
    if (!timed || done) return
    if (secondsLeft <= 0) {
      setDone(true)
      return
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [secondsLeft, done, timed])

  const answered = answers.filter((a) => a !== null).length

  if (done) {
    return <ResultScreen assignment={assignment} questions={questions} answers={answers} />
  }

  const q = questions[index]
  const selected = answers[index]
  const lowTime = secondsLeft < 60

  function pick(optId: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = optId
      return next
    })
  }

  function submit() {
    setDone(true)
    toast.success('Devoir rendu (démo)')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      {/* En-tête */}
      <header className="space-y-3 px-4 pt-5">
        <div className="flex items-center gap-3">
          <Link
            to="/eleve/devoirs"
            aria-label="Quitter le devoir"
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold">{assignment.title}</p>
            <p className="text-xs text-muted-foreground">
              {timed ? 'Éval. surprise' : 'Devoir maison'} · Question {index + 1}/{total} ·{' '}
              {domainLabels[assignment.domain]}
            </p>
          </div>
          {timed && (
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums',
                lowTime ? 'bg-destructive/10 text-destructive' : 'bg-amber-soft text-amber-foreground',
              )}
            >
              <Clock className="size-4" />
              {formatTime(secondsLeft)}
            </span>
          )}
        </div>

        {/* Barre de progression */}
        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      {/* Carte question */}
      <div className="flex-1 px-4 pt-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            {domainLabels[assignment.domain]}
          </p>
          <p className="mt-3 text-base font-medium leading-relaxed">{q.prompt}</p>
          {q.katex && (
            <div className="mt-4 rounded-xl bg-secondary/60 py-4 text-xl">
              <Maths expr={q.katex} display />
            </div>
          )}
        </div>

        {/* Options — pas de correction en direct */}
        <div className="mt-4 space-y-3">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i)
            const isSel = selected === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => pick(opt.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all',
                  isSel ? 'border-brand bg-brand-soft' : 'border-border hover:border-brand/40',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold',
                    isSel ? 'bg-brand text-white' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {letter}
                </span>
                <span className="text-lg font-semibold">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-xl"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="size-5" /> Précédent
          </Button>

          {index + 1 >= total ? (
            <Button type="button" size="lg" className="flex-1 rounded-xl text-base" onClick={submit}>
              <CheckSquare className="size-5" /> Rendre le devoir
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="flex-1 rounded-xl text-base"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            >
              Suivant <ArrowRight className="size-5" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {answered}/{total} question{total > 1 ? 's' : ''} répondue{answered > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

const PASS_THRESHOLD = 50

function ResultScreen({
  assignment,
  questions,
  answers,
}: {
  assignment: Assignment
  questions: AssignmentQuestion[]
  answers: (string | null)[]
}) {
  const total = questions.length
  const correct = questions.reduce((sum, q, i) => sum + (answers[i] === q.correctId ? 1 : 0), 0)
  const pct = Math.round((correct / total) * 100)
  const validated = pct >= PASS_THRESHOLD

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Bilan */}
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'grid size-20 place-items-center rounded-full text-4xl',
            validated ? 'bg-success-soft' : 'bg-amber-soft',
          )}
        >
          {validated ? '🎉' : '🎯'}
        </div>
        <h1 className="mt-5 font-heading text-2xl font-extrabold">
          {validated ? 'Devoir rendu !' : 'Devoir rendu'}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {assignment.title} — {correct}/{total} bonnes réponses
        </p>

        <p className="mt-4 font-heading text-5xl font-extrabold tabular-nums">{pct}%</p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-white">
          <Trophy className="size-5" />
          <span className="font-heading text-lg font-bold">+{assignment.xpReward} XP gagnés</span>
          <Zap className="size-4 fill-white" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Ton classement va évoluer dans les prochaines minutes.
        </p>

        <div className="mt-6 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link to="/eleve/devoirs">Voir mes devoirs</Link>
          </Button>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/eleve/historique">Historique</Link>
          </Button>
        </div>
      </div>

      {/* Correction question par question */}
      <div className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-bold">Correction</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const given = answers[i]
            const ok = given === q.correctId
            const givenLabel = q.options.find((o) => o.id === given)?.label
            const correctLabel = q.options.find((o) => o.id === q.correctId)?.label
            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-2xl border p-4',
                  ok
                    ? 'border-success/30 bg-success-soft/50'
                    : 'border-destructive/30 bg-destructive/5',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-white',
                      ok ? 'bg-success' : 'bg-destructive',
                    )}
                  >
                    {ok ? <Check className="size-4" /> : <X className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Question {i + 1}/{total}
                    </p>
                    <p className="mt-1 text-sm font-medium">{q.prompt}</p>
                    {q.katex && (
                      <div className="mt-2 text-base">
                        <Maths expr={q.katex} display />
                      </div>
                    )}
                    <div className="mt-2 space-y-0.5 text-sm">
                      <p className={cn(ok ? 'text-success' : 'text-destructive')}>
                        Ta réponse : {given ? givenLabel : 'aucune'}
                      </p>
                      {!ok && (
                        <p className="font-semibold text-success">
                          Bonne réponse : {correctLabel}
                        </p>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="mt-1.5 text-sm text-foreground/80">
                        {q.explanation}{' '}
                        {q.explanationKatex && (
                          <Maths expr={q.explanationKatex} className="font-medium" />
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
