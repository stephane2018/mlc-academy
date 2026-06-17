import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { X, Zap, Check, Trophy, RotateCcw, ArrowRight } from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { quizQuestions } from '@/lib/mock'

export const Route = createFileRoute('/eleve/jeu')({
  component: QuizPage,
})

type Phase = 'answering' | 'revealed' | 'done'

function QuizPage() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('answering')
  const [score, setScore] = useState(0)
  const [xp, setXp] = useState(0)

  const total = quizQuestions.length
  const q = quizQuestions[index]
  const isCorrect = selected === q.correctId

  function validate() {
    if (!selected) return
    setPhase('revealed')
    if (selected === q.correctId) {
      setScore((s) => s + 1)
      setXp((x) => x + 10)
    }
  }

  function next() {
    if (index + 1 >= total) {
      setPhase('done')
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setPhase('answering')
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setPhase('answering')
    setScore(0)
    setXp(0)
  }

  if (phase === 'done') {
    return <ResultScreen score={score} total={total} xp={xp} onRestart={restart} />
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      {/* Barre de progression */}
      <header className="flex items-center gap-3 px-4 pt-5">
        <Link
          to="/eleve/dashboard"
          className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="size-5" />
        </Link>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${((index + (phase === 'revealed' ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <span className="flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-sm font-bold text-amber-foreground">
          <Zap className="size-4 fill-amber text-amber" />
          {xp}
        </span>
      </header>

      <div className="flex items-center justify-between px-4 pt-4 text-sm">
        <span className="font-semibold text-muted-foreground">
          Question {index + 1}/{total} · {q.domain}
        </span>
        <span className="flex items-center gap-1 font-semibold text-success">
          {score} <Check className="size-4" />
        </span>
      </div>

      {/* Carte question */}
      <div className="flex-1 px-4 pt-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            {q.domain} · {q.type}
          </p>
          <p className="mt-3 text-base font-medium leading-relaxed">{q.prompt}</p>
          {q.katex && (
            <div className="mt-4 rounded-xl bg-secondary/60 py-4 text-xl">
              <Maths expr={q.katex} display />
            </div>
          )}
        </div>

        {/* Options */}
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
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold',
                    isSel && !revealed && 'bg-brand text-white',
                    showCorrect && 'bg-success text-white',
                    showWrong && 'bg-destructive text-white',
                    !isSel && !showCorrect && 'bg-secondary text-muted-foreground',
                  )}
                >
                  {showCorrect ? (
                    <Check className="size-4" />
                  ) : showWrong ? (
                    <X className="size-4" />
                  ) : (
                    letter
                  )}
                </span>
                <span className="text-lg font-semibold">{opt.label}</span>
              </button>
            )
          })}
        </div>

        {/* Correction */}
        {phase === 'revealed' && (
          <div
            className={cn(
              'mt-4 rounded-2xl p-4',
              isCorrect ? 'bg-success-soft' : 'bg-destructive/5',
            )}
          >
            <p
              className={cn(
                'flex items-center gap-1.5 font-bold',
                isCorrect ? 'text-success' : 'text-destructive',
              )}
            >
              {isCorrect ? <Check className="size-4" /> : <X className="size-4" />}
              {isCorrect ? 'Bravo, c’est juste !' : 'Pas tout à fait.'}
            </p>
            <p className="mt-1.5 text-sm text-foreground/80">
              {q.explanation}{' '}
              {q.explanationKatex && <Maths expr={q.explanationKatex} className="font-medium" />}
            </p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
        {phase === 'answering' ? (
          <Button
            onClick={validate}
            disabled={!selected}
            size="lg"
            className="w-full rounded-xl text-base"
          >
            Valider
          </Button>
        ) : (
          <Button onClick={next} size="lg" className="w-full rounded-xl text-base">
            {index + 1 >= total ? 'Voir le résultat' : 'Question suivante'}
            <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function ResultScreen({
  score,
  total,
  xp,
  onRestart,
}: {
  score: number
  total: number
  xp: number
  onRestart: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const perfect = score === total

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="grid size-24 place-items-center rounded-full bg-amber-soft text-5xl">
        {perfect ? '🏆' : '🎯'}
      </div>
      <h1 className="mt-6 font-heading text-3xl font-extrabold">
        {perfect ? 'Sans faute !' : 'Session terminée'}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tu as réussi {score} question{score > 1 ? 's' : ''} sur {total} ({pct}%)
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-white">
        <Trophy className="size-5" />
        <span className="font-heading text-xl font-bold">+{xp} XP</span>
      </div>

      <div className="mt-8 grid w-full max-w-xs gap-3">
        <Button onClick={onRestart} size="lg" variant="outline" className="rounded-xl">
          <RotateCcw className="size-4" /> Rejouer
        </Button>
        <Button asChild size="lg" className="rounded-xl">
          <Link to="/eleve/dashboard">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  )
}
