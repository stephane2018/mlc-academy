import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  Smartphone,
  MessageSquare,
  Pencil,
  Settings,
  Inbox,
  Zap,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SectionHeader } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/notifications')({
  component: AdminNotifications,
})

/* ------------------------------------------------------------------ */
/* Types reflétant les enums du schéma (AJOUTS 3 — Notifications)       */
/* ------------------------------------------------------------------ */
type NotifKind =
  | 'devoir'
  | 'retard'
  | 'rapport'
  | 'resultat'
  | 'live'
  | 'inactivite'
  | 'badge'
  | 'message'
  | 'systeme'
type NotifAudience = 'eleve' | 'prof' | 'parent'
type NotifChannel = 'inapp' | 'push' | 'email'
type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'

/* notification_catalog */
type CatalogEntry = {
  kind: NotifKind
  audience: NotifAudience
  label: string
  description: string | null
  allowInapp: boolean
  allowPush: boolean
  allowEmail: boolean
  defaultLabel: string
  userEditable: boolean
  enabled: boolean
}

/* notification_templates */
type TemplateEntry = {
  kind: NotifKind
  audience: NotifAudience
  channel: NotifChannel
  subject: string | null
  body: string
  enabled: boolean
}

/* notification_deliveries */
type DeliveryEntry = {
  id: string
  at: string
  to: string
  kind: NotifKind
  channel: NotifChannel
  provider: 'resend' | 'webpush'
  status: DeliveryStatus
}

/* ------------------------------------------------------------------ */
/* Libellés FR des enums                                               */
/* ------------------------------------------------------------------ */
const KIND_LABEL: Record<NotifKind, string> = {
  devoir: 'Nouveau devoir',
  retard: 'Devoir en retard',
  rapport: 'Rapport de progression',
  resultat: 'Résultat disponible',
  live: 'Cours live',
  inactivite: 'Inactivité',
  badge: 'Nouveau badge',
  message: 'Message',
  systeme: 'Annonce système',
}

const AUDIENCE_LABEL: Record<NotifAudience, string> = {
  eleve: 'Élève',
  prof: 'Prof',
  parent: 'Parent',
}

const CHANNEL_LABEL: Record<NotifChannel, string> = {
  inapp: 'In-app',
  push: 'Push',
  email: 'E-mail',
}

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  queued: 'En file',
  sent: 'Envoyé',
  delivered: 'Délivré',
  failed: 'Échec',
  bounced: 'Rejeté',
}

const CHANNEL_ICON: Record<NotifChannel, typeof Mail> = {
  inapp: MessageSquare,
  push: Smartphone,
  email: Mail,
}

function AudienceBadge({ audience }: { audience: NotifAudience }) {
  const tones: Record<NotifAudience, string> = {
    eleve: 'bg-brand-soft text-brand',
    prof: 'bg-violet-soft text-violet',
    parent: 'bg-teal-soft text-teal',
  }
  return <Badge className={tones[audience]}>{AUDIENCE_LABEL[audience]}</Badge>
}

function ChannelBadge({ channel }: { channel: NotifChannel }) {
  const tones: Record<NotifChannel, string> = {
    inapp: 'bg-secondary text-secondary-foreground',
    push: 'bg-amber-soft text-amber-foreground',
    email: 'bg-info-soft text-info',
  }
  const Icon = CHANNEL_ICON[channel]
  return (
    <Badge className={cn('gap-1', tones[channel])}>
      <Icon className="size-3" />
      {CHANNEL_LABEL[channel]}
    </Badge>
  )
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const tones: Record<DeliveryStatus, string> = {
    queued: 'bg-secondary text-muted-foreground',
    sent: 'bg-info-soft text-info',
    delivered: 'bg-success-soft text-success',
    failed: 'bg-destructive/10 text-destructive',
    bounced: 'bg-destructive/10 text-destructive',
  }
  return <Badge className={tones[status]}>{STATUS_LABEL[status]}</Badge>
}

/* ------------------------------------------------------------------ */
/* Données mock INLINE                                                  */
/* ------------------------------------------------------------------ */
const catalog: CatalogEntry[] = [
  { kind: 'devoir', audience: 'eleve', label: 'Nouveau devoir', description: 'Un devoir vous a été assigné', allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'In-app + Push', userEditable: true, enabled: true },
  { kind: 'devoir', audience: 'parent', label: 'Devoir assigné à votre enfant', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: true, enabled: true },
  { kind: 'retard', audience: 'eleve', label: 'Devoir en retard', description: 'Un devoir non rendu approche de sa date limite', allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'In-app + Push', userEditable: true, enabled: true },
  { kind: 'retard', audience: 'parent', label: 'Retard de votre enfant', description: 'Un devoir n’a pas été rendu à temps', allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: true, enabled: true },
  { kind: 'rapport', audience: 'parent', label: 'Rapport de progression', description: 'Un rapport PDF est disponible', allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'E-mail', userEditable: true, enabled: true },
  { kind: 'resultat', audience: 'eleve', label: 'Résultat disponible', description: 'Votre copie a été corrigée', allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'In-app + Push', userEditable: true, enabled: true },
  { kind: 'resultat', audience: 'parent', label: 'Résultat de votre enfant', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: true, enabled: true },
  { kind: 'live', audience: 'eleve', label: 'Cours live', description: 'Rappel des séances en direct', allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'In-app + Push', userEditable: true, enabled: true },
  { kind: 'live', audience: 'prof', label: 'Cours live à animer', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: true, enabled: true },
  { kind: 'inactivite', audience: 'eleve', label: 'Relance', description: 'Pas de connexion depuis un moment', allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'Push', userEditable: true, enabled: true },
  { kind: 'inactivite', audience: 'parent', label: 'Alerte inactivité', description: 'Votre enfant ne se connecte plus', allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'E-mail', userEditable: true, enabled: true },
  { kind: 'badge', audience: 'eleve', label: 'Nouveau badge', description: 'Un badge débloqué', allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'In-app', userEditable: true, enabled: true },
  { kind: 'message', audience: 'eleve', label: 'Message du prof', description: null, allowInapp: true, allowPush: true, allowEmail: false, defaultLabel: 'In-app + Push', userEditable: true, enabled: true },
  { kind: 'message', audience: 'prof', label: 'Message élève reçu', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: true, enabled: true },
  { kind: 'message', audience: 'parent', label: 'Message de l’équipe', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: true, enabled: true },
  { kind: 'systeme', audience: 'eleve', label: 'Annonces', description: 'Informations importantes', allowInapp: true, allowPush: false, allowEmail: false, defaultLabel: 'In-app', userEditable: false, enabled: true },
  { kind: 'systeme', audience: 'prof', label: 'Annonces', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: false, enabled: true },
  { kind: 'systeme', audience: 'parent', label: 'Annonces', description: null, allowInapp: true, allowPush: false, allowEmail: true, defaultLabel: 'In-app + E-mail', userEditable: false, enabled: true },
]

const templates: TemplateEntry[] = [
  { kind: 'rapport', audience: 'parent', channel: 'email', subject: 'MLC Academy — Rapport de {{pseudo}}', body: 'Bonjour, le rapport de progression de {{pseudo}} est disponible : {{url}}', enabled: true },
  { kind: 'resultat', audience: 'parent', channel: 'email', subject: 'MLC Academy — Résultat de {{pseudo}}', body: '{{pseudo}} a obtenu {{score}}% au devoir "{{titre}}". Détails : {{url}}', enabled: true },
  { kind: 'retard', audience: 'parent', channel: 'email', subject: 'MLC Academy — Devoir en retard pour {{pseudo}}', body: 'Le devoir "{{titre}}" attendu le {{date}} n’a pas encore été rendu par {{pseudo}}.', enabled: true },
  { kind: 'devoir', audience: 'eleve', channel: 'inapp', subject: null, body: 'Nouveau devoir : {{titre}} (à rendre le {{date}})', enabled: true },
  { kind: 'badge', audience: 'eleve', channel: 'inapp', subject: null, body: 'Bravo ! Tu as débloqué le badge {{titre}} 🏅', enabled: true },
  { kind: 'inactivite', audience: 'parent', channel: 'email', subject: 'MLC Academy — {{pseudo}} ne s’est pas connecté', body: 'Cela fait quelques jours que {{pseudo}} ne s’est pas connecté. Un petit rappel ?', enabled: false },
]

const deliveries: DeliveryEntry[] = [
  { id: 'd1', at: '18/06 14:32', to: 'parent.dupont@mail.fr', kind: 'rapport', channel: 'email', provider: 'resend', status: 'delivered' },
  { id: 'd2', at: '18/06 14:18', to: 'MaxLeBg', kind: 'devoir', channel: 'push', provider: 'webpush', status: 'sent' },
  { id: 'd3', at: '18/06 13:55', to: 'm.bernard@mail.fr', kind: 'resultat', channel: 'email', provider: 'resend', status: 'delivered' },
  { id: 'd4', at: '18/06 13:40', to: 'inconnu@bounce.fr', kind: 'inactivite', channel: 'email', provider: 'resend', status: 'bounced' },
  { id: 'd5', at: '18/06 12:21', to: 'Léa_2012', kind: 'badge', channel: 'push', provider: 'webpush', status: 'failed' },
  { id: 'd6', at: '18/06 11:09', to: 'parent.noa@mail.fr', kind: 'retard', channel: 'email', provider: 'resend', status: 'delivered' },
  { id: 'd7', at: '18/06 10:47', to: 'NoaMath', kind: 'live', channel: 'push', provider: 'webpush', status: 'sent' },
  { id: 'd8', at: '18/06 09:30', to: 'prof.martin@mail.fr', kind: 'message', channel: 'email', provider: 'resend', status: 'queued' },
  { id: 'd9', at: '18/06 08:58', to: 'famille.zoe@mail.fr', kind: 'systeme', channel: 'email', provider: 'resend', status: 'delivered' },
  { id: 'd10', at: '17/06 21:12', to: 'TomTom', kind: 'resultat', channel: 'push', provider: 'webpush', status: 'sent' },
]

const AUDIENCE_FILTERS: NotifAudience[] = ['eleve', 'prof', 'parent']
const STATUS_FILTERS: DeliveryStatus[] = ['queued', 'sent', 'delivered', 'failed', 'bounced']

/* ------------------------------------------------------------------ */
/* État catalogue : clé `${kind}:${audience}`                          */
/* ------------------------------------------------------------------ */
type CatalogChannelsState = {
  inapp: boolean
  push: boolean
  email: boolean
  enabled: boolean
}

const catalogKey = (c: Pick<CatalogEntry, 'kind' | 'audience'>) => `${c.kind}:${c.audience}`

function initialCatalogState(): Record<string, CatalogChannelsState> {
  const out: Record<string, CatalogChannelsState> = {}
  for (const c of catalog) {
    out[catalogKey(c)] = {
      inapp: c.allowInapp,
      push: c.allowPush,
      email: c.allowEmail,
      enabled: c.enabled,
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Onglet CATALOGUE                                                     */
/* ------------------------------------------------------------------ */
function CatalogueTab() {
  const [filter, setFilter] = useState<'all' | NotifAudience>('all')
  const [state, setState] = useState<Record<string, CatalogChannelsState>>(initialCatalogState)

  const visibleAudiences =
    filter === 'all' ? AUDIENCE_FILTERS : AUDIENCE_FILTERS.filter((a) => a === filter)

  const setChannel = (key: string, channel: NotifChannel, value: boolean) =>
    setState((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: value } }))

  const setEnabled = (key: string, value: boolean) =>
    setState((prev) => ({ ...prev, [key]: { ...prev[key], enabled: value } }))

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Catalogue des notifications"
        action={
          <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | NotifAudience)}>
            <SelectTrigger className="h-9 w-[170px] gap-2 border-border">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes audiences</SelectItem>
              {AUDIENCE_FILTERS.map((a) => (
                <SelectItem key={a} value={a}>
                  {AUDIENCE_LABEL[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {visibleAudiences.map((audience) => {
        const rows = catalog.filter((c) => c.audience === audience)
        if (rows.length === 0) return null

        return (
          <Card key={audience} className="rounded-2xl p-0 shadow-soft">
            {/* En-tête de section */}
            <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-5 py-3">
              <AudienceBadge audience={audience} />
              <span className="text-sm font-medium text-muted-foreground">
                {rows.length} type{rows.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-border">
              {rows.map((c) => {
                const key = catalogKey(c)
                const s = state[key]
                return (
                  <div
                    key={key}
                    className={cn(
                      'flex flex-col gap-4 px-5 py-4 transition-opacity lg:flex-row lg:items-center lg:justify-between',
                      !s.enabled && 'opacity-60',
                    )}
                  >
                    {/* Libellé + description */}
                    <div className="min-w-0 lg:max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.label}</span>
                        {!c.userEditable && (
                          <Badge className="bg-amber-soft text-amber-foreground">Obligatoire</Badge>
                        )}
                      </div>
                      {c.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {c.description}
                        </p>
                      )}
                    </div>

                    {/* Pills canaux + activé */}
                    <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
                      <ChannelPill
                        icon={MessageSquare}
                        label="In-app"
                        checked={s.inapp}
                        disabled={!s.enabled}
                        onCheckedChange={(v) => setChannel(key, 'inapp', v)}
                      />
                      <ChannelPill
                        icon={Smartphone}
                        label="Push"
                        checked={s.push}
                        disabled={!s.enabled}
                        onCheckedChange={(v) => setChannel(key, 'push', v)}
                      />
                      <ChannelPill
                        icon={Mail}
                        label="E-mail"
                        checked={s.email}
                        disabled={!s.enabled}
                        onCheckedChange={(v) => setChannel(key, 'email', v)}
                      />
                      <div className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                        <span className="text-xs font-semibold text-foreground">Activé</span>
                        <Switch
                          size="sm"
                          checked={s.enabled}
                          onCheckedChange={(v) => setEnabled(key, v)}
                          aria-label={`Activer ${c.label}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </section>
  )
}

function ChannelPill({
  icon: Icon,
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  icon: typeof Mail
  label: string
  checked: boolean
  disabled: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5',
        disabled && 'opacity-60',
      )}
    >
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Switch
        size="sm"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Onglet TEMPLATES                                                     */
/* ------------------------------------------------------------------ */
const VARIABLES = ['{{pseudo}}', '{{titre}}', '{{score}}', '{{date}}', '{{url}}'] as const

const templateKey = (t: TemplateEntry) => `${t.kind}-${t.audience}-${t.channel}`

function initialTemplateState(): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const t of templates) out[templateKey(t)] = t.enabled
  return out
}

function TemplatesTab() {
  const [enabledState, setEnabledState] = useState<Record<string, boolean>>(initialTemplateState)
  const [editing, setEditing] = useState<TemplateEntry | null>(null)
  const [draftSubject, setDraftSubject] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftEnabled, setDraftEnabled] = useState(true)

  const openEditor = (t: TemplateEntry) => {
    setEditing(t)
    setDraftSubject(t.subject ?? '')
    setDraftBody(t.body)
    setDraftEnabled(enabledState[templateKey(t)])
  }

  const insertVariable = (v: string) => setDraftBody((prev) => `${prev}${prev ? ' ' : ''}${v}`)

  const save = () => {
    if (editing) {
      setEnabledState((prev) => ({ ...prev, [templateKey(editing)]: draftEnabled }))
    }
    setEditing(null)
  }

  return (
    <section>
      <SectionHeader title="Templates de messages" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => {
          const key = templateKey(t)
          const enabled = enabledState[key]
          return (
            <Card key={key} className="card-hover gap-3 rounded-2xl p-5 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{KIND_LABEL[t.kind]}</Badge>
                  <AudienceBadge audience={t.audience} />
                  <ChannelBadge channel={t.channel} />
                </div>
                <Switch
                  size="sm"
                  checked={enabled}
                  onCheckedChange={(v) => setEnabledState((prev) => ({ ...prev, [key]: v }))}
                  aria-label={`Activer le template ${KIND_LABEL[t.kind]}`}
                />
              </div>
              {t.subject && <p className="text-sm font-semibold">{t.subject}</p>}
              <p className="line-clamp-3 text-sm text-muted-foreground">{t.body}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-fit gap-1.5"
                onClick={() => openEditor(t)}
              >
                <Pencil className="size-4" />
                Modifier
              </Button>
            </Card>
          )
        })}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Modifier le template</DialogTitle>
                <DialogDescription>
                  {KIND_LABEL[editing.kind]} · {AUDIENCE_LABEL[editing.audience]} ·{' '}
                  {CHANNEL_LABEL[editing.channel]}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {editing.channel === 'email' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Sujet</label>
                    <Input
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      placeholder="Sujet de l'e-mail"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Corps</label>
                  <Textarea
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Variables disponibles
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLES.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-brand-soft hover:text-brand"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <span className="text-sm font-medium">Activé</span>
                  <Switch
                    checked={draftEnabled}
                    onCheckedChange={setDraftEnabled}
                    aria-label="Activer le template"
                  />
                </div>
              </div>

              <DialogFooter showCloseButton={false}>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button className="gap-1.5" onClick={save}>
                  <CheckCircle2 className="size-4" />
                  Enregistrer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Onglet JOURNAL D'ENVOI                                               */
/* ------------------------------------------------------------------ */
function JournalTab() {
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all')
  const rows =
    statusFilter === 'all' ? deliveries : deliveries.filter((d) => d.status === statusFilter)

  const delivered = rows.filter((d) => d.status === 'delivered' || d.status === 'sent').length
  const failed = rows.filter((d) => d.status === 'failed' || d.status === 'bounced').length

  return (
    <section>
      <SectionHeader
        title="Journal d'envoi"
        action={
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-success">
              <CheckCircle2 className="size-4" />
              {delivered} délivrés
            </span>
            <span className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertCircle className="size-4" />
              {failed} échecs
            </span>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as 'all' | DeliveryStatus)}
            >
              <SelectTrigger className="h-9 w-[150px] gap-2 border-border">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {STATUS_FILTERS.map((st) => (
                  <SelectItem key={st} value={st}>
                    {STATUS_LABEL[st]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Date / heure</th>
                <th className="px-5 py-3 font-semibold">Destinataire</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Canal</th>
                <th className="px-5 py-3 font-semibold">Provider</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    Aucun envoi pour ce statut.
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{d.at}</td>
                    <td className="px-5 py-3 font-medium">{d.to}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{KIND_LABEL[d.kind]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <ChannelBadge channel={d.channel} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {d.provider === 'resend' ? 'Resend' : 'webpush'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
type NotifTab = 'catalogue' | 'templates' | 'journal'
const notifTabs: { id: NotifTab; label: string; icon: typeof Settings }[] = [
  { id: 'catalogue', label: 'Catalogue', icon: Settings },
  { id: 'templates', label: 'Templates', icon: Bell },
  { id: 'journal', label: "Journal d'envoi", icon: Inbox },
]

function AdminNotifications() {
  const [tab, setTab] = useState<NotifTab>('catalogue')
  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1500px]">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Bell className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Catalogue, templates et journal d’envoi des notifications.
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Send} tone="brand" label="Notifs envoyées (7 j)" value="1 284" delta="+12 %" trend="up" />
        <StatTile icon={CheckCircle2} tone="success" label="Taux de délivrabilité" value="97,4 %" delta="+0,6 pt" trend="up" />
        <StatTile icon={AlertCircle} tone="amber" label="Échecs (7 j)" value="33" delta="-5" trend="down" />
        <StatTile icon={Zap} tone="info" label="Templates actifs" value={`${templates.filter((t) => t.enabled).length}`} />
      </div>

      {/* Onglets horizontaux */}
      <div>
        <div className="-mx-1 overflow-x-auto px-1">
          <nav
            role="tablist"
            aria-label="Sections des notifications"
            className="inline-flex min-w-max items-center gap-1 border-b border-border"
          >
            {notifTabs.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-4">
          {tab === 'catalogue' && <CatalogueTab />}
          {tab === 'templates' && <TemplatesTab />}
          {tab === 'journal' && <JournalTab />}
        </div>
      </div>
    </div>
  )
}
