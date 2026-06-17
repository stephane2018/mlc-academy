import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Send, Clock } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PageHero } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { conversations, type Message } from '@/lib/mock'

export const Route = createFileRoute('/eleve/messages')({
  component: EleveMessages,
})

const PROF_NAME = 'M. Minko'
const PROF_AVATAR = '👨‍🏫'

/** L'élève n'a qu'un fil : sa conversation avec le professeur. */
const baseThread = conversations[0].messages

function Bubble({ message }: { message: Message }) {
  // Côté élève : l'élève est à droite (brand), le prof à gauche.
  const fromEleve = message.from === 'eleve'
  return (
    <div className={cn('flex items-end gap-2', fromEleve ? 'flex-row-reverse' : 'flex-row')}>
      {!fromEleve && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-base">
          {PROF_AVATAR}
        </span>
      )}
      <div className={cn('flex flex-col', fromEleve ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
            fromEleve
              ? 'rounded-br-md bg-brand text-white'
              : 'rounded-bl-md bg-secondary text-foreground',
          )}
        >
          {message.text}
        </div>
        <span className="mt-1 px-1 text-[11px] text-muted-foreground">{message.time}</span>
      </div>
    </div>
  )
}

function EleveMessages() {
  const [extra, setExtra] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const thread = [...baseThread, ...extra]

  function send() {
    const text = input.trim()
    if (!text) return
    setExtra((m) => [
      ...m,
      { id: `local-${Date.now()}`, from: 'eleve', text, time: 'maintenant' },
    ])
    setInput('')
    toast.success('Message envoyé', {
      description: `${PROF_NAME} te répondra bientôt.`,
    })
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1100px]">
      <PageHero
        variant="surface"
        eyebrow="Messagerie"
        title="Messages"
        subtitle={`Pose tes questions à ${PROF_NAME}.`}
        actions={
          <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            <Clock className="size-4 text-brand" />
            Réponse sous 24–48 h
          </span>
        }
      />

      <Card className="gap-0 overflow-hidden p-0 shadow-soft">
        {/* En-tête du fil */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl">
            {PROF_AVATAR}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{PROF_NAME}</p>
            <p className="truncate text-xs text-muted-foreground">Ton professeur de maths</p>
          </div>
        </div>

        {/* Bulles */}
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          {thread.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          <p className="mx-auto mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3.5" /> Il te répond généralement sous 24–48 h.
          </p>
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
                  send()
                }
              }}
              placeholder="Écris ta question…"
              rows={1}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-xl"
            />
            <Button
              type="button"
              onClick={send}
              disabled={!input.trim()}
              className="h-10 shrink-0 rounded-xl px-4"
            >
              <Send className="size-5" />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
