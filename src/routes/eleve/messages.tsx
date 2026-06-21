import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Send, Clock } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PageHero } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { useConversations, useMessages, useSendMessage, useMarkConversationRead } from '@/hooks/use-messaging'

export const Route = createFileRoute('/eleve/messages')({
  component: EleveMessages,
})

const DEFAULT_PROF_AVATAR = '👨‍🏫'

/** Message affiché dans le fil. */
type Msg = { id: string; from: 'eleve' | 'prof'; text: string; time: string }

const hourMin = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatTime = (iso: string) => hourMin.format(new Date(iso))

function Bubble({ message, profAvatar }: { message: Msg; profAvatar: string }) {
  // Côté élève : l'élève est à droite (brand), le prof à gauche.
  const fromEleve = message.from === 'eleve'
  return (
    <div className={cn('flex items-end gap-2', fromEleve ? 'flex-row-reverse' : 'flex-row')}>
      {!fromEleve && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-base">
          {profAvatar}
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
  const convQ = useConversations()
  const conv = convQ.data?.[0]
  const messagesQ = useMessages(conv?.id ?? '')
  const sendMsg = useSendMessage(conv?.id ?? '')
  const markRead = useMarkConversationRead()
  const [input, setInput] = useState('')

  const profName = conv?.peer?.name ?? 'Ton professeur'
  const profAvatar = conv?.peer?.avatar ?? DEFAULT_PROF_AVATAR

  // Marque les messages reçus comme lus à l'ouverture (une fois).
  useEffect(() => {
    if (conv && conv.unreadCount > 0) markRead.mutate(conv.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv?.id])

  const thread: Msg[] = (messagesQ.data ?? []).map((m) => ({
    id: m.id,
    from: m.sender,
    text: m.body,
    time: formatTime(m.createdAt),
  }))

  function send() {
    const text = input.trim()
    if (!text || !conv || sendMsg.isPending) return
    sendMsg.mutate(text, {
      onSuccess: () => setInput(''),
      onError: () => toast.error("Échec de l'envoi. Réessaie."),
    })
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1100px]">
      <PageHero
        variant="surface"
        eyebrow="Messagerie"
        title="Messages"
        subtitle={`Pose tes questions à ${profName}.`}
        actions={
          <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            <Clock className="size-4 text-brand" />
            Réponse sous 24–48 h
          </span>
        }
      />

      {convQ.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement de ta messagerie…</p>
      ) : !conv ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center shadow-soft">
          <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-2xl">{DEFAULT_PROF_AVATAR}</span>
          <p className="font-heading font-bold">Aucune conversation pour l'instant</p>
          <p className="text-sm text-muted-foreground">Ton professeur t'écrira ici dès qu'il aura un message pour toi.</p>
        </Card>
      ) : (
      <Card className="gap-0 overflow-hidden p-0 shadow-soft">
        {/* En-tête du fil */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl">
            {profAvatar}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{profName}</p>
            <p className="truncate text-xs text-muted-foreground">Ton professeur de maths</p>
          </div>
        </div>

        {/* Bulles */}
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          {thread.map((m) => (
            <Bubble key={m.id} message={m} profAvatar={profAvatar} />
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
              disabled={!input.trim() || sendMsg.isPending}
              className="h-10 shrink-0 rounded-xl px-4"
            >
              <Send className="size-5" />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </div>
        </div>
      </Card>
      )}
    </div>
  )
}
