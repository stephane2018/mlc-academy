import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Send, Inbox } from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { SectionHeader } from '@/components/student/parts'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/support')({
  component: AdminSupport,
})

type TicketStatus = 'Nouveau' | 'En cours' | 'Résolu'

type Ticket = {
  id: string
  author: string
  avatar: string
  excerpt: string
  message: string
  date: string
  status: TicketStatus
}

const tickets: Ticket[] = [
  {
    id: 't1',
    author: 'Léa_2012',
    avatar: '🦊',
    excerpt: "Je n'arrive pas à lancer l'examen blanc de géométrie…",
    message:
      "Bonjour, quand je clique sur « Démarrer l'examen blanc de géométrie », la page reste blanche. J'ai essayé sur deux navigateurs. Pouvez-vous m'aider ?",
    date: 'il y a 22 min',
    status: 'Nouveau',
  },
  {
    id: 't2',
    author: 'MaxLeBg',
    avatar: '🤖',
    excerpt: 'Comment changer la formule de mon abonnement ?',
    message:
      "Salut, je suis en Premium mais je voudrais passer à la formule Famille pour ma sœur. Comment faire sans perdre ma progression ?",
    date: 'il y a 1 h',
    status: 'Nouveau',
  },
  {
    id: 't3',
    author: 'NoaMath',
    avatar: '🚀',
    excerpt: 'Mon streak a disparu après la mise à jour 😢',
    message:
      "Hier j'avais un streak de 12 jours et ce matin il est revenu à 0. Est-ce un bug ? Je me connecte tous les jours pourtant.",
    date: 'il y a 3 h',
    status: 'En cours',
  },
  {
    id: 't4',
    author: 'Zoé★',
    avatar: '🐱',
    excerpt: 'La vidéo sur Pythagore ne charge pas',
    message:
      "La vidéo « Théorème de Pythagore » affiche une erreur de chargement. Les autres vidéos fonctionnent bien.",
    date: 'il y a 5 h',
    status: 'Nouveau',
  },
  {
    id: 't5',
    author: 'TomTom',
    avatar: '🐼',
    excerpt: 'Demande de facture pour mon abonnement',
    message:
      "Bonjour, mes parents ont besoin d'une facture pour l'abonnement Premium du mois de mai. Où la trouver ?",
    date: 'il y a 1 j',
    status: 'En cours',
  },
  {
    id: 't6',
    author: 'Inès.M',
    avatar: '🐧',
    excerpt: 'Merci, le problème est réglé !',
    message:
      "Merci beaucoup pour votre aide rapide, je peux à nouveau accéder à mes badges. Tout fonctionne !",
    date: 'il y a 2 j',
    status: 'Résolu',
  },
]

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  if (status === 'Nouveau') return <Badge className="bg-brand-soft text-brand">Nouveau</Badge>
  if (status === 'En cours') return <Badge className="bg-amber-soft text-amber-foreground">En cours</Badge>
  return <Badge className="bg-success-soft text-success">Résolu</Badge>
}

function AdminSupport() {
  const [selectedId, setSelectedId] = useState<string>(tickets[0].id)
  const [reply, setReply] = useState('')
  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0]
  const pending = tickets.filter((t) => t.status !== 'Résolu').length

  function handleReply() {
    if (!reply.trim()) {
      toast.error('Écrivez une réponse avant d’envoyer')
      return
    }
    toast.success(`Réponse envoyée à ${selected.author}`)
    setReply('')
  }

  return (
    <div className="space-y-4 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-soft text-amber-foreground">{pending} en attente</Badge>
        <span className="text-sm text-muted-foreground">{tickets.length} messages au total</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Liste */}
        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <ul className="divide-y divide-border">
            {tickets.map((ticket) => {
              const active = ticket.id === selectedId
              return (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(ticket.id)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                      active ? 'bg-brand-soft/60' : 'hover:bg-secondary/50',
                    )}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-lg">
                      {ticket.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{ticket.author}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{ticket.date}</span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{ticket.excerpt}</p>
                      <div className="mt-1.5">
                        <TicketStatusBadge status={ticket.status} />
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Détail */}
        <Card className="flex flex-col rounded-2xl p-5 shadow-soft">
          <SectionHeader
            title="Détail du message"
            action={<TicketStatusBadge status={selected.status} />}
          />

          {/* En-tête expéditeur */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-3">
            <span className="grid size-11 place-items-center rounded-xl bg-card text-2xl shadow-sm">
              {selected.avatar}
            </span>
            <div className="min-w-0">
              <p className="font-heading font-bold">{selected.author}</p>
              <p className="text-xs text-muted-foreground">Élève · {selected.date}</p>
            </div>
          </div>

          {/* Fil de discussion */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-base">
                {selected.avatar}
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Inbox className="size-3.5" />
                  Message reçu
                </span>
                {selected.message}
              </div>
            </div>
          </div>

          {/* Zone de réponse */}
          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand">
                <Send className="size-3.5" />
              </span>
              Votre réponse
            </p>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Répondre à ${selected.author}…`}
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={handleReply}>
                <Send className="size-4" />
                Envoyer la réponse
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
