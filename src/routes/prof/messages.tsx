import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { MessageSquare, Send, Search, ArrowLeft, User, Clock } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { conversations, profStudents, type Message } from '@/lib/mock'

export const Route = createFileRoute('/prof/messages')({
  component: ProfMessages,
})

/** Associe une conversation à la fiche élève via le pseudo (mock). */
function studentIdFor(pseudo: string): string | undefined {
  return profStudents.find((s) => s.pseudo === pseudo)?.id
}

function truncate(text: string, max = 42) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function Bubble({ message }: { message: Message }) {
  const fromProf = message.from === 'prof'
  return (
    <div className={cn('flex flex-col', fromProf ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
          fromProf
            ? 'rounded-br-md bg-brand text-white'
            : 'rounded-bl-md bg-secondary text-foreground',
        )}
      >
        {message.text}
      </div>
      <span className="mt-1 px-1 text-[11px] text-muted-foreground">{message.time}</span>
    </div>
  )
}

function ProfMessages() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(conversations[0].id)
  // Messages ajoutés localement par conversation (mock, non persistant).
  const [drafts, setDrafts] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  // Mobile : bascule liste ↔ fil.
  const [mobileThread, setMobileThread] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.pseudo.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    )
  }, [query])

  const active = conversations.find((c) => c.id === selectedId) ?? conversations[0]
  const thread = useMemo<Message[]>(
    () => [...active.messages, ...(drafts[active.id] ?? [])],
    [active, drafts],
  )
  const studentId = studentIdFor(active.pseudo)

  function selectConversation(id: string) {
    setSelectedId(id)
    setMobileThread(true)
    setInput('')
  }

  function send() {
    const text = input.trim()
    if (!text) return
    const msg: Message = {
      id: `local-${Date.now()}`,
      from: 'prof',
      text,
      time: 'maintenant',
    }
    setDrafts((d) => ({ ...d, [active.id]: [...(d[active.id] ?? []), msg] }))
    setInput('')
  }

  return (
    <div className="2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="grid gap-4 lg:h-[calc(100dvh-9rem)] lg:grid-cols-[320px_1fr]">
        {/* ----------------------------- Liste ----------------------------- */}
        <Card
          className={cn(
            'min-h-0 gap-0 overflow-hidden p-0 shadow-soft',
            mobileThread && 'hidden lg:flex',
          )}
        >
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <p className="font-heading text-base font-bold">Conversations</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <MessageSquare className="size-4 text-brand" />
                {conversations.length}
              </span>
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un élève…"
                className="h-9 pl-9"
              />
            </div>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">
                Aucune conversation trouvée.
              </li>
            )}
            {filtered.map((c) => {
              const isActive = c.id === active.id
              const last = (drafts[c.id]?.at(-1)?.text ?? c.lastMessage)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50',
                      isActive && 'bg-brand-soft/60 hover:bg-brand-soft/60',
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                      {c.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold">{c.pseudo}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{c.group}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {truncate(last)}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* ------------------------------ Fil ------------------------------ */}
        <Card
          className={cn(
            'min-h-0 gap-0 overflow-hidden p-0 shadow-soft',
            !mobileThread && 'hidden lg:flex',
          )}
        >
          {/* En-tête du fil */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-1.5 shrink-0 lg:hidden"
              aria-label="Retour à la liste"
              onClick={() => setMobileThread(false)}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
              {active.avatar}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{active.pseudo}</p>
              <p className="truncate text-xs text-muted-foreground">{active.group}</p>
            </div>
            {studentId && (
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to="/prof/eleves/$id" params={{ id: studentId }}>
                  <User className="size-4" />
                  <span className="hidden sm:inline">Voir la fiche</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Bulles */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-background/40 p-4">
            <p className="mx-auto flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <Clock className="size-3.5" /> Réponse sous 24–48 h
            </p>
            {thread.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
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
                placeholder={`Répondre à ${active.pseudo}…`}
                rows={1}
                className="max-h-32 min-h-10 flex-1 resize-none rounded-xl"
              />
              <Button
                type="button"
                onClick={send}
                disabled={!input.trim()}
                className="size-10 shrink-0 rounded-xl p-0"
                aria-label="Envoyer"
              >
                <Send className="size-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
