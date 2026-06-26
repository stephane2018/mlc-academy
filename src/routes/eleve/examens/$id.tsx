import { useEffect, useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  X,
  Clock,
  Check,
  Trophy,
  Zap,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  CheckSquare,
} from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { MathText } from '@/components/math-text'
import { SignedImage } from '@/components/signed-image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExam, useExamQuestions, useSubmitExam } from '@/hooks/use-exams'
import { useSubjects } from '@/hooks/use-catalog'
import type { Exam, ExamQuestion, ExamResult } from '@/services/exams'

export const Route = createFileRoute('/eleve/examens/$id')({
  component: ExamRunner,
})

const PASS_THRESHOLD = 50

/** Question enrichie du libellé de son thème (« domaine » affiché). */
type QView = ExamQuestion & { domain: string }

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function NotAvailable({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-secondary text-2xl">🔍</div>
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-bold">Examen indisponible</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button asChild className="rounded-xl">
        <Link to="/eleve/examens">
          <ArrowLeft className="size-4" /> Retour aux examens
        </Link>
      </Button>
    </div>
  )
}

function ExamRunner() {
  const { id } = useParams({ from: '/eleve/examens/$id' })
  const examQ = useExam(id)
  const questionsQ = useExamQuestions(id)
  const { data: subjects = [] } = useSubjects()

  if (examQ.isLoading || questionsQ.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-sm text-muted-foreground">
        Chargement de l'examen…
      </div>
    )
  }

  const exam = examQ.data
  const rawQuestions = questionsQ.data ?? []
  if (!exam) return <NotAvailable message="Cet examen blanc n'existe pas ou n'est plus disponible." />
  if (rawQuestions.length === 0) return <NotAvailable message="Cet examen n'a pas encore de questions." />

  // Résolution du libellé de thème (id backend → nom) pour l'affichage « domaine ».
  const themeName = (themeId: string | null) =>
    (themeId && subjects.flatMap((s) => s.themes).find((t) => t.id === themeId)?.name) || 'Tout le programme'
  const questions: QView[] = rawQuestions.map((q) => ({ ...q, domain: themeName(q.themeId) }))

  return <ExamSession exam={exam} questions={questions} />
}

function ExamSession({ exam, questions }: { exam: Exam; questions: QView[] }) {
  const total = questions.length
  const submit = useSubmitExam()

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(total).fill(null))
  const [result, setResult] = useState<ExamResult | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMin * 60)
  const done = result !== null

  function finish() {
    if (submit.isPending || done) return
    const payload = questions
      .map((q, i) => (answers[i] ? { questionId: q.id, optionId: answers[i] as string } : null))
      .filter((a): a is { questionId: string; optionId: string } => a !== null)
    submit.mutate(
      { id: exam.id, answers: payload },
      {
        onSuccess: (res) => setResult(res),
        onError: () => toast.error("Échec de l'envoi de tes réponses. Réessaie."),
      },
    )
  }

  // Chronomètre décroissant ; soumission auto à 0.
  useEffect(() => {
    if (done) return
    if (secondsLeft <= 0) {
      finish()
      return
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, done])

  const answered = answers.filter((a) => a !== null).length

  if (result) {
    return <ResultScreen exam={exam} questions={questions} answers={answers} result={result} />
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      {/* En-tête de passation */}
      <header className="space-y-3 px-4 pt-5">
        <div className="flex items-center gap-3">
          <Link
            to="/eleve/examens"
            aria-label="Quitter l'examen"
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold">{exam.title}</p>
            <p className="text-xs text-muted-foreground">
              Question {index + 1}/{total} · {q.domain}
            </p>
          </div>
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums',
              lowTime ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-foreground',
            )}
          >
            <Clock className="size-4" />
            {formatTime(secondsLeft)}
          </span>
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
            {q.domain} · {q.type}
          </p>
          <p className="mt-3 text-base font-medium leading-relaxed"><MathText value={q.prompt} /></p>
          {q.katex && (
            <div className="mt-4 rounded-xl bg-secondary/60 py-4 text-xl">
              <Maths expr={q.katex} display />
            </div>
          )}
          {q.imagePath && (
            <SignedImage path={q.imagePath} className="mt-4 max-h-72 w-auto rounded-xl border border-border object-contain" />
          )}
        </div>

        {/* Options — pas de correction en direct (mode examen) */}
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
                <span className="min-w-0 flex-1 space-y-2">
                  {opt.label && <span className="block text-lg font-semibold"><MathText value={opt.label} /></span>}
                  {opt.imagePath && (
                    <SignedImage path={opt.imagePath} className="max-h-32 w-auto rounded-lg border border-border object-contain" />
                  )}
                </span>
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
            <Button
              type="button"
              size="lg"
              className="flex-1 rounded-xl text-base"
              disabled={submit.isPending}
              onClick={finish}
            >
              <CheckSquare className="size-5" /> Terminer l'examen
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

function ResultScreen({
  exam,
  questions,
  answers,
  result,
}: {
  exam: Exam
  questions: QView[]
  answers: (string | null)[]
  result: ExamResult
}) {
  const total = result.total
  const correct = result.correct
  const pct = result.score
  const validated = result.passed
  // Correction par question (bonne option + explication) renvoyée par le serveur.
  const correctionByQuestion = new Map(result.corrections.map((c) => [c.questionId, c]))

  function restart() {
    // Recharge la route pour relancer une tentative propre.
    window.location.reload()
  }

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
          {validated ? '🎓' : '🎯'}
        </div>
        <h1 className="mt-5 font-heading text-2xl font-extrabold">
          {validated ? 'Examen validé !' : 'Examen terminé'}
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {exam.title} — {correct}/{total} bonnes réponses
        </p>

        <p className="mt-4 font-heading text-5xl font-extrabold tabular-nums">{pct}%</p>

        {validated ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-white">
            <Trophy className="size-5" />
            <span className="font-heading text-lg font-bold">Validé · +{result.xpEarned} XP</span>
            <Zap className="size-4 fill-white" />
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-amber-soft px-5 py-2.5 text-sm font-bold text-amber-foreground">
            Non validé (&lt; {PASS_THRESHOLD} %), réessaie pour décrocher tes +50 XP.
          </p>
        )}

        <div className="mt-6 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
          <Button onClick={restart} variant="outline" size="lg" className="rounded-xl">
            <RotateCcw className="size-4" /> Refaire
          </Button>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/eleve/examens">Retour aux examens</Link>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => toast.success('Résultat archivé (démo)')}
          className="mt-3 text-sm font-medium text-brand hover:underline"
        >
          Archiver ce résultat
        </button>
      </div>

      {/* Correction automatique question par question */}
      <div className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-bold">Correction automatique</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const given = answers[i]
            const correction = correctionByQuestion.get(q.id)
            const correctId = correction?.correctOptionId ?? null
            const ok = given !== null && given === correctId
            const givenLabel = q.options.find((o) => o.id === given)?.label
            const correctLabel = q.options.find((o) => o.id === correctId)?.label
            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-2xl border p-4',
                  ok ? 'border-success/30 bg-success-soft/50' : 'border-destructive/30 bg-destructive/5',
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
                      Question {i + 1}/{total} · {q.domain}
                    </p>
                    <p className="mt-1 text-sm font-medium"><MathText value={q.prompt} /></p>
                    {q.katex && (
                      <div className="mt-2 text-base">
                        <Maths expr={q.katex} display />
                      </div>
                    )}
                    {q.imagePath && (
                      <SignedImage path={q.imagePath} className="mt-2 max-h-48 w-auto rounded-lg border border-border object-contain" />
                    )}
                    <div className="mt-2 space-y-0.5 text-sm">
                      <p className={cn(ok ? 'text-success' : 'text-destructive')}>
                        Ta réponse : {given ? <MathText value={givenLabel} /> : 'aucune'}
                      </p>
                      {!ok && correctLabel && (
                        <p className="font-semibold text-success">Bonne réponse : <MathText value={correctLabel} /></p>
                      )}
                    </div>
                    {correction?.explanation && (
                      <p className="mt-1.5 text-sm text-foreground/80">
                        {correction.explanation}{' '}
                        {correction.explanationKatex && (
                          <Maths expr={correction.explanationKatex} className="font-medium" />
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
