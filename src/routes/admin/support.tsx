import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Send, Inbox, Loader } from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SectionHeader } from '@/components/student/parts'
import { cn } from '@/lib/utils'
import {
  useSupportTickets,
  useSupportTicket,
  useReplySupportTicket,
  useUpdateSupportStatus,
} from '@/hooks/use-support'
import type { SupportTicketStatus } from '@/services/support'

export const Route = createFileRoute('/admin/support')({
  component: AdminSupport,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Résolu',
}

const STATUS_CLASS: Record<SupportTicketStatus, string> = {
  ouvert: 'bg-amber-soft text-amber-foreground',
  en_cours: 'bg-brand-soft text-brand',
  resolu: 'bg-success-soft text-success',
}

const STATUS_FILTERS: { value: SupportTicketStatus | 'tous'; label: string }[] = [
  { value: 'tous', label: 'Tous les statuts' },
  { value: 'ouvert', label: 'Ouvert' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'resolu', label: 'Résolu' },
]

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d)
}

function authorInitial(name: string | null): string {
  return (name?.trim()[0] ?? '?').toUpperCase()
}

function TicketStatusBadge({ status }: { status: SupportTicketStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>
}

function AdminSupport() {
  const [filter, setFilter] = useState<SupportTicketStatus | 'tous'>('tous')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reply, setReply] = useState('')

  const ticketsQuery = useSupportTickets()
  const tickets = ticketsQuery.data ?? []

  const filtered = useMemo(
    () => (filter === 'tous' ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter],
  )

  const activeId = selectedId ?? filtered[0]?.id ?? null
  const detailQuery = useSupportTicket(activeId)
  const detail = detailQuery.data

  const replyMutation = useReplySupportTicket()
  const statusMutation = useUpdateSupportStatus()

  const pending = tickets.filter((t) => t.status !== 'resolu').length

  function handleReply() {
    if (!activeId) return
    if (!reply.trim()) {
      toast.error('Écrivez une réponse avant d’envoyer')
      return
    }
    replyMutation.mutate(
      { id: activeId, body: reply.trim() },
      {
        onSuccess: () => {
          toast.success('Réponse envoyée')
          setReply('')
        },
        onError: () => toast.error('Échec de l’envoi de la réponse'),
      },
    )
  }

  function handleStatusChange(status: SupportTicketStatus) {
    if (!activeId) return
    statusMutation.mutate(
      { id: activeId, status },
      {
        onSuccess: () => toast.success('Statut mis à jour'),
        onError: () => toast.error('Échec de la mise à jour du statut'),
      },
    )
  }

  return (
    <div className="space-y-4 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-amber-soft text-amber-foreground">{pending} en attente</Badge>
        <span className="text-sm text-muted-foreground">{tickets.length} tickets au total</span>
        <div className="ml-auto">
          <Select value={filter} onValueChange={(v) => setFilter(v as SupportTicketStatus | 'tous')}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Liste */}
        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          {ticketsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
              <Loader className="size-4 animate-spin" />
              Chargement des tickets…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground">
              <Inbox className="size-6" />
              Aucun ticket pour ce filtre.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((ticket) => {
                const active = ticket.id === activeId
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
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold">
                        {authorInitial(ticket.authorName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold">
                            {ticket.authorName ?? 'Anonyme'}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {fmtDate(ticket.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {ticket.subject}
                        </p>
                        <div className="mt-1.5">
                          <TicketStatusBadge status={ticket.status} />
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Détail */}
        <Card className="flex flex-col rounded-2xl p-5 shadow-soft">
          <SectionHeader
            title="Détail du ticket"
            action={
              detail ? (
                <Select
                  value={detail.status}
                  onValueChange={(v) => handleStatusChange(v as SupportTicketStatus)}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="resolu">Résolu</SelectItem>
                  </SelectContent>
                </Select>
              ) : undefined
            }
          />

          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
              <Inbox className="size-6" />
              Sélectionnez un ticket pour afficher la conversation.
            </div>
          ) : detailQuery.isLoading || !detail ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader className="size-4 animate-spin" />
              Chargement du ticket…
            </div>
          ) : (
            <>
              {/* En-tête expéditeur */}
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-3">
                <span className="grid size-11 place-items-center rounded-xl bg-card text-lg font-bold shadow-sm">
                  {authorInitial(detail.authorName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading font-bold">{detail.authorName ?? 'Anonyme'}</p>
                  <p className="text-xs text-muted-foreground">
                    {detail.subject}
                    {detail.category ? ` · ${detail.category}` : ''} · {fmtDate(detail.createdAt)}
                  </p>
                </div>
              </div>

              {/* Fil de discussion */}
              <div className="mt-4 flex-1 space-y-3">
                {detail.messages.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucun message dans ce ticket.
                  </p>
                ) : (
                  detail.messages.map((msg) => {
                    const fromAuthor = msg.authorId === detail.authorId
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex items-start gap-2.5',
                          fromAuthor ? '' : 'flex-row-reverse',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold',
                            fromAuthor ? 'bg-secondary' : 'bg-brand-soft text-brand',
                          )}
                        >
                          {fromAuthor ? authorInitial(detail.authorName) : <Send className="size-3.5" />}
                        </span>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-3 text-sm leading-relaxed text-foreground',
                            fromAuthor
                              ? 'rounded-tl-sm bg-secondary/60'
                              : 'rounded-tr-sm bg-brand-soft/60',
                          )}
                        >
                          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {fromAuthor ? (
                              <>
                                <Inbox className="size-3.5" />
                                Message reçu
                              </>
                            ) : (
                              <>
                                <Send className="size-3.5" />
                                Réponse support
                              </>
                            )}
                            <span className="ml-1 normal-case font-normal">
                              {fmtDate(msg.createdAt)}
                            </span>
                          </span>
                          {msg.body}
                        </div>
                      </div>
                    )
                  })
                )}
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
                  placeholder={`Répondre à ${detail.authorName ?? 'l’utilisateur'}…`}
                  rows={4}
                  disabled={replyMutation.isPending}
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} disabled={replyMutation.isPending}>
                    {replyMutation.isPending ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Envoyer la réponse
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
