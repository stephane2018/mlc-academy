import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Sparkles, Send, AlertCircle } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCoachHistory, useAskCoach } from '@/hooks/use-coach'

export const Route = createFileRoute('/eleve/coach')({
  component: CoachPage,
})

/** Exemples de questions proposés en amorce (copie UI statique, pas de la donnée). */
const COACH_SUGGESTIONS = [
  'Explique-moi les fractions',
  'Comment résoudre 2x + 5 = 17 ?',
  'Donne-moi un exercice de géométrie',
  "C'est quoi le théorème de Pythagore ?",
] as const

/** Message affiché dans le fil (issu du BFF ou ajouté en optimiste). */
type Msg = { id: string; from: 'eleve' | 'coach'; text: string }

function Bubble({ message }: { message: Msg }) {
  const fromCoach = message.from === 'coach'
  return (
    <div className={cn('flex items-end gap-2', fromCoach ? 'flex-row' : 'flex-row-reverse')}>
      {fromCoach && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-violet text-white shadow-sm">
          <Sparkles className="size-4" />
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
          fromCoach
            ? 'rounded-bl-md bg-secondary text-foreground'
            : 'rounded-br-md bg-brand text-white',
        )}
      >
        {message.text}
      </div>
    </div>
  )
}

/** Indicateur « le coach écrit… » avec 3 points animés. */
function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-violet text-white shadow-sm">
        <Sparkles className="size-4" />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-secondary px-4 py-3 shadow-sm">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  )
}

function CoachPage() {
  const historyQ = useCoachHistory()
  const askCoach = useAskCoach()
  const [thread, setThread] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const typing = askCoach.isPending
  const scrollRef = useRef<HTMLDivElement>(null)
  const seeded = useRef(false)

  // Seed unique du fil depuis l'historique (les ajouts locaux ne sont pas écrasés).
  useEffect(() => {
    if (!seeded.current && historyQ.data) {
      setThread(historyQ.data.map((m, i) => ({ id: `h-${i}`, from: m.role, text: m.body })))
      seeded.current = true
    }
  }, [historyQ.data])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread, typing])

  function ask(text: string) {
    const question = text.trim()
    if (!question || typing) return
    setThread((t) => [...t, { id: `me-${Date.now()}`, from: 'eleve', text: question }])
    setInput('')
    askCoach.mutate(question, {
      onSuccess: (res) => setThread((t) => [...t, { id: `coach-${Date.now()}`, from: 'coach', text: res.reply }]),
      onError: () => toast.error('Le coach est très sollicité. Réessaie dans un instant.'),
    })
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col px-4 pb-4 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[900px]">
      {/* En-tête */}
      <div className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-violet text-white shadow-brand-glow">
          <Sparkles className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-lg font-extrabold">Coach IA</h1>
            <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-foreground">
              Bêta
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            Ton assistant maths, dispo 24/7
          </p>
        </div>
      </div>

      {/* Fil de conversation */}
      <Card className="mt-4 flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0 shadow-soft">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
          {thread.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {typing && <TypingBubble />}
        </div>

        {/* Suggestions */}
        <div className="border-t border-border px-3 py-2.5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COACH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={typing}
                className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition card-hover hover:border-brand/40 hover:text-brand disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Saisie */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  ask(input)
                }
              }}
              placeholder="Pose ta question de maths…"
              rows={1}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-xl"
            />
            <Button
              type="button"
              onClick={() => ask(input)}
              disabled={!input.trim() || typing}
              className="h-10 shrink-0 rounded-xl px-4"
            >
              <Send className="size-5" />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </div>
        </div>
      </Card>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <AlertCircle className="size-3.5" />
        Réponses générées par IA — vérifie toujours avec ton cours.
      </p>
    </div>
  )
}
