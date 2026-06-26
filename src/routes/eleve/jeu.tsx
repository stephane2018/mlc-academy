import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { X, Zap, Check, Trophy, RotateCcw, ArrowRight } from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { MathText } from '@/components/math-text'
import { SignedImage } from '@/components/signed-image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSubjects } from '@/hooks/use-catalog'
import { useQuizQuestions, useSubmitGame } from '@/hooks/use-student'
import type { GameResult, QuizQuestion } from '@/services/student'

export const Route = createFileRoute('/eleve/jeu')({
  component: QuizPage,
})

type Phase = 'answering' | 'revealed' | 'done'

function QuizPage() {
  const [subject, setSubject] = useState<{ id: string; name: string; color: string | null } | null>(null)

  if (!subject) return <SubjectSelect onPick={setSubject} />
  return <QuizSession subject={subject} onChangeSubject={() => setSubject(null)} />
}

function SubjectSelect({ onPick }: { onPick: (s: { id: string; name: string; color: string | null }) => void }) {
  const { data: subjects, isLoading } = useSubjects()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-6">
      <header className="flex items-center gap-3">
        <Link to="/eleve/dashboard" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
          <X className="size-5" />
        </Link>
        <p className="font-heading text-sm font-bold">Choisis une matière</p>
      </header>

      <div className="mt-8 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-brand-soft text-4xl">🎮</div>
        <h1 className="mt-5 font-heading text-2xl font-extrabold">Prêt à jouer ?</h1>
        <p className="mt-2 text-muted-foreground">Sélectionne la matière que tu veux travailler.</p>
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(subjects ?? []).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick({ id: s.id, name: s.name, color: s.color })}
              className="card-hover flex flex-col items-start gap-2 rounded-2xl border-2 bg-card p-5 text-left shadow-soft transition-all hover:border-current"
              style={{ color: s.color ?? 'var(--brand)' }}
            >
              <span className="size-3.5 rounded-full" style={{ backgroundColor: s.color ?? 'var(--brand)' }} />
              <span className="font-heading text-base font-bold text-foreground">{s.name}</span>
              <span className="text-sm text-muted-foreground">Quiz d'entraînement</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function QuizSession({
  subject,
  onChangeSubject,
}: {
  subject: { id: string; name: string; color: string | null }
  onChangeSubject: () => void
}) {
  const questionsQuery = useQuizQuestions(subject.id)
  const submitGame = useSubmitGame()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('answering')
  const [answers, setAnswers] = useState<{ questionId: string; optionId: string }[]>([])
  const [runningCorrect, setRunningCorrect] = useState(0)
  const [startedAt] = useState(() => Date.now())
  const [result, setResult] = useState<GameResult | null>(null)

  const questions = questionsQuery.data ?? []
  const total = questions.length
  const q: QuizQuestion | undefined = questions[index]

  if (questionsQuery.isLoading) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Chargement du quiz…</div>
  }
  if (total === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-secondary text-3xl">🙈</div>
        <p className="font-heading text-lg font-bold">Pas encore de questions ici</p>
        <p className="text-sm text-muted-foreground">Choisis une autre matière pour t'entraîner.</p>
        <Button onClick={onChangeSubject} variant="outline" className="rounded-xl">Changer de matière</Button>
      </div>
    )
  }

  if (phase === 'done' && result) {
    return <ResultScreen subject={subject} result={result} onRestart={onChangeSubject} onChangeSubject={onChangeSubject} />
  }
  if (!q) return null

  const isCorrect = selected === q.correctId
  const runningXp = runningCorrect * 10

  function validate() {
    if (!selected || !q) return
    setPhase('revealed')
    setAnswers((a) => [...a, { questionId: q.id, optionId: selected }])
    if (selected === q.correctId) setRunningCorrect((c) => c + 1)
  }

  function next() {
    if (index + 1 >= total) {
      submitGame.mutate(
        { subjectId: subject.id, answers, durationSec: Math.round((Date.now() - startedAt) / 1000) },
        { onSuccess: (r) => { setResult(r); setPhase('done') } },
      )
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setPhase('answering')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="flex items-center gap-3 px-4 pt-5">
        <button type="button" onClick={onChangeSubject} aria-label="Changer de matière" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary">
          <X className="size-5" />
        </button>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((index + (phase === 'revealed' ? 1 : 0)) / total) * 100}%` }} />
        </div>
        <span className="flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-sm font-bold text-amber-foreground">
          <Zap className="size-4 fill-amber text-amber" />
          {runningXp}
        </span>
      </header>

      <div className="flex items-center justify-between px-4 pt-4 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: subject.color ?? 'var(--brand)' }} />
          {subject.name} · Question {index + 1}/{total}
        </span>
        <span className="flex items-center gap-1 font-semibold text-success">
          {runningCorrect} <Check className="size-4" />
        </span>
      </div>

      <div className="flex-1 px-4 pt-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-medium leading-relaxed"><MathText value={q.prompt} /></p>
          {q.katex && (
            <div className="mt-4 rounded-xl bg-secondary/60 py-4 text-xl">
              <Maths expr={q.katex} display />
            </div>
          )}
          {q.imagePath && (
            <SignedImage path={q.imagePath} className="mt-4 max-h-64 w-auto rounded-xl border border-border object-contain" />
          )}
        </div>

        <div className="mt-4 space-y-3">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i)
            const isSel = selected === opt.id
            const revealed = phase === 'revealed'
            const isAnswer = opt.id === q.correctId
            const showCorrect = revealed && isAnswer
            const showWrong = revealed && isSel && !isAnswer
            return (
              <button
                key={opt.id}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all',
                  !revealed && isSel && 'border-brand bg-brand-soft',
                  !revealed && !isSel && 'border-border hover:border-brand/40',
                  showCorrect && 'border-success bg-success-soft',
                  showWrong && 'border-destructive bg-destructive/5',
                  revealed && !showCorrect && !showWrong && 'opacity-60',
                )}
              >
                <span className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold',
                  isSel && !revealed && 'bg-brand text-white',
                  showCorrect && 'bg-success text-white',
                  showWrong && 'bg-destructive text-white',
                  !isSel && !showCorrect && 'bg-secondary text-muted-foreground',
                )}>
                  {showCorrect ? <Check className="size-4" /> : showWrong ? <X className="size-4" /> : letter}
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

        {phase === 'revealed' && (q.explanation || q.explanationKatex) && (
          <div className={cn('mt-4 rounded-2xl p-4', isCorrect ? 'bg-success-soft' : 'bg-destructive/5')}>
            <p className={cn('flex items-center gap-1.5 font-bold', isCorrect ? 'text-success' : 'text-destructive')}>
              {isCorrect ? <Check className="size-4" /> : <X className="size-4" />}
              {isCorrect ? 'Bravo, c’est juste !' : 'Pas tout à fait.'}
            </p>
            {q.explanation && (
              <p className="mt-1.5 text-sm text-foreground/80">
                {q.explanation} {q.explanationKatex && <Maths expr={q.explanationKatex} className="font-medium" />}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
        {phase === 'answering' ? (
          <Button onClick={validate} disabled={!selected} size="lg" className="w-full rounded-xl text-base">
            Valider
          </Button>
        ) : (
          <Button onClick={next} disabled={submitGame.isPending} size="lg" className="w-full rounded-xl text-base">
            {index + 1 >= total ? (submitGame.isPending ? 'Calcul…' : 'Voir le résultat') : 'Question suivante'}
            <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function ResultScreen({
  subject,
  result,
  onRestart,
  onChangeSubject,
}: {
  subject: { id: string; name: string; color: string | null }
  result: GameResult
  onRestart: () => void
  onChangeSubject: () => void
}) {
  const perfect = result.correct === result.total

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="grid size-24 place-items-center rounded-full bg-amber-soft text-5xl">{perfect ? '🏆' : '🎯'}</div>
      <h1 className="mt-6 font-heading text-3xl font-extrabold">{perfect ? 'Sans faute !' : 'Session terminée'}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ backgroundColor: subject.color ?? 'var(--brand)' }} />
        {subject.name} · {result.correct} sur {result.total} ({result.score}%)
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-white">
        <Trophy className="size-5" />
        <span className="font-heading text-xl font-bold">+{result.xpEarned} XP</span>
      </div>
      {result.leveledUp && (
        <p className="mt-3 font-heading text-sm font-bold text-success">🎉 Niveau {result.newLevel} atteint !</p>
      )}

      <div className="mt-8 grid w-full max-w-xs gap-3">
        <Button onClick={onRestart} size="lg" variant="outline" className="rounded-xl">
          <RotateCcw className="size-4" /> Rejouer
        </Button>
        <Button onClick={onChangeSubject} size="lg" variant="outline" className="rounded-xl">Changer de matière</Button>
        <Button asChild size="lg" className="rounded-xl">
          <Link to="/eleve/dashboard">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  )
}
