import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Plus, Boxes, Check, FileText, Users, Trash2, Link2, CloudUpload, Download, X } from '@/components/icons'
import { PageHero, StatTile } from '@/components/blocks'
import { TYPE_META } from '@/components/student/resource-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QueryError } from '@/components/query-error'
import { cn } from '@/lib/utils'
import type { ResourceType } from '@/lib/mock'
import { useResources, useCreateResource, useDeleteResource, useShareResource } from '@/hooks/use-resources'
import { useGroups } from '@/hooks/use-groups'
import type { SharedResource, SharedResourceType } from '@/services/resources'
import { uploadResourceFile, getResourceDownloadUrl } from '@/services/resources'
import { ConfirmDialog } from '@/components/confirm-dialog'

export const Route = createFileRoute('/prof/ressources/')({
  component: ResourcesPage,
})

type Filter = 'all' | SharedResourceType
const TYPE_ORDER: SharedResourceType[] = ['video', 'pdf', 'exercice', 'fiche']
const STATUS_LABEL: Record<string, string> = { publie: 'Publié', planifie: 'Planifié', brouillon: 'Brouillon' }
const STATUS_TONE: Record<string, string> = {
  publie: 'bg-teal-soft text-teal-foreground',
  planifie: 'bg-info-soft text-info',
  brouillon: 'bg-secondary text-muted-foreground',
}

function ResourcesPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const resourcesQ = useResources()
  const resources = resourcesQ.data ?? []
  const isLoading = resourcesQ.isLoading

  const visible = resources.filter((r) => filter === 'all' || r.type === filter)
  const published = resources.filter((r) => r.status === 'publie').length
  const drafts = resources.filter((r) => r.status === 'brouillon').length

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: resources.length },
    ...TYPE_ORDER.map((t) => ({ key: t as Filter, label: TYPE_META[t as ResourceType].label, count: resources.filter((r) => r.type === t).length })),
  ]

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        variant="surface"
        eyebrow="Partager"
        title="Ressources"
        subtitle="Distribue vidéos, PDF, exercices et fiches à tes groupes."
        actions={<CreateResourceDialog />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Boxes} tone="brand" label="Ressources" value={resources.length} />
        <StatTile icon={Check} tone="teal" label="Publiées" value={published} />
        <StatTile icon={FileText} tone="amber" label="Brouillons" value={drafts} />
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = filter === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                active ? 'border-brand bg-brand text-white' : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Chargement de tes ressources…</p>
      ) : resourcesQ.isError ? (
        <QueryError onRetry={() => resourcesQ.refetch()} />
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucune ressource. Ajoute ton premier contenu à partager.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResourceCard({ resource: r }: { resource: SharedResource }) {
  const meta = TYPE_META[r.type as ResourceType]
  const del = useDeleteResource()
  const path = r.storagePath
  async function download() {
    if (!path) return
    try {
      const url = await getResourceDownloadUrl(path)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error('Téléchargement indisponible.')
    }
  }
  return (
    <Card className="card-hover gap-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', meta.chip)}>
            <meta.Icon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-heading text-base font-bold">{r.title}</p>
            <p className="text-xs text-muted-foreground">{meta.label}</p>
          </div>
        </div>
        <Badge variant="secondary" className={cn('shrink-0', STATUS_TONE[r.status])}>
          {STATUS_LABEL[r.status] ?? r.status}
        </Badge>
      </div>

      {r.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {r.groups.length === 0 ? (
          <span className="text-xs text-muted-foreground">Non partagée</span>
        ) : (
          r.groups.map((g) => (
            <Badge key={g} variant="secondary" className="bg-brand-soft text-brand">
              <Users className="size-3" /> {g}
            </Badge>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <ShareResourceDialog resource={r} />
        {path && (
          <Button variant="ghost" size="sm" onClick={download}>
            <Download className="size-4" /> Télécharger
          </Button>
        )}
        <ConfirmDialog
          title="Supprimer la ressource ?"
          description={<>« {r.title} » sera définitivement supprimée. Cette action est irréversible.</>}
          pending={del.isPending}
          onConfirm={() =>
            del.mutate(r.id, {
              onSuccess: () => toast.success('Ressource supprimée'),
              onError: () => toast.error('Échec de la suppression.'),
            })
          }
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={del.isPending}
              aria-label="Supprimer la ressource"
            >
              <Trash2 className="size-4" />
            </Button>
          }
        />
      </div>
    </Card>
  )
}

function CreateResourceDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<SharedResourceType>('fiche')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const create = useCreateResource()

  const reset = () => {
    setTitle('')
    setType('fiche')
    setDescription('')
    setMessage('')
    setFile(null)
  }

  async function submit() {
    if (!title.trim()) return
    let uploaded: { storagePath: string; fileName: string; fileSize: string } | null = null
    if (file) {
      setUploading(true)
      try {
        uploaded = await uploadResourceFile(file)
      } catch (e) {
        setUploading(false)
        toast.error("Échec de l'envoi du fichier.", { description: e instanceof Error ? e.message : undefined })
        return
      }
      setUploading(false)
    }
    create.mutate(
      {
        title: title.trim(),
        type,
        description: description.trim() || null,
        message: message.trim() || null,
        status: 'brouillon',
        storagePath: uploaded?.storagePath ?? null,
        fileName: uploaded?.fileName ?? null,
        fileSize: uploaded?.fileSize ?? null,
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
          toast.success('Ressource créée', { description: 'Partage-la avec un groupe pour la rendre visible.' })
        },
        onError: () => toast.error('Échec de la création.'),
      },
    )
  }

  const busy = uploading || create.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Ajouter une ressource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une ressource</DialogTitle>
          <DialogDescription>Crée la ressource, puis partage-la avec tes groupes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">Titre</Label>
            <Input id="res-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Fiche de révision — fractions" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SharedResourceType)}>
              <SelectTrigger id="res-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_META[t as ResourceType].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fichier (optionnel)</Label>
            {file ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                <FileText className="size-4 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} Ko</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setFile(null)} aria-label="Retirer le fichier">
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition-colors hover:border-brand/50 hover:bg-secondary/50">
                <CloudUpload className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium">Choisir un fichier</span>
                <span className="text-xs text-muted-foreground">PDF, image, document…</span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-desc">Description</Label>
            <Textarea id="res-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-msg">Message d'accompagnement</Label>
            <Textarea id="res-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Ex : À lire avant le prochain cours." />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button disabled={!title.trim() || busy} onClick={submit}>
            {uploading ? 'Envoi du fichier…' : create.isPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShareResourceDialog({ resource }: { resource: SharedResource }) {
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<string[]>([])
  const { data: groups = [] } = useGroups()
  const share = useShareResource()

  const toggle = (id: string) => setSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  function submit() {
    if (sel.length === 0) return
    share.mutate(
      { id: resource.id, groupIds: sel },
      {
        onSuccess: () => {
          setOpen(false)
          setSel([])
          toast.success('Ressource partagée')
        },
        onError: () => toast.error('Échec du partage.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="size-4" /> Partager
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager « {resource.title} »</DialogTitle>
          <DialogDescription>Choisis les groupes qui y auront accès.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 py-1">
          {groups.length === 0 && <p className="text-sm text-muted-foreground">Aucun groupe.</p>}
          {groups.map((g) => {
            const on = sel.includes(g.id)
            const already = resource.groups.includes(g.name)
            return (
              <button
                key={g.id}
                type="button"
                disabled={already}
                onClick={() => toggle(g.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50',
                  on ? 'border-brand bg-brand text-white' : 'border-border bg-card text-muted-foreground hover:border-brand/40',
                )}
              >
                {(on || already) && <Check className="size-3.5" />}
                {g.name}
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Fermer</Button>
          </DialogClose>
          <Button disabled={sel.length === 0 || share.isPending} onClick={submit}>Partager</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
