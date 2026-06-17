import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { TYPE_META } from '@/components/student/resource-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { CloudUpload, FileIcon, Loader, Check, X } from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  profGroups,
  profStudents,
  type ResourceType,
  type SharedResource,
} from '@/lib/mock'

const TYPE_ORDER: ResourceType[] = ['video', 'pdf', 'exercice', 'fiche']
const ACCEPT_HINT = 'PDF, MP4, JPG, PNG — 100 Mo max.'

type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; progress: number; name: string; size: string }
  | { phase: 'done'; name: string; size: string }

type Target =
  | { kind: 'group'; value: string }
  | { kind: 'student'; value: string }
  | { kind: 'level'; value: string }

export function ResourceDialog({
  mode,
  resource,
  trigger,
  open,
  onOpenChange,
}: {
  mode: 'create' | 'edit'
  resource?: SharedResource
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (v: boolean) => void
}) {
  const isEdit = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="font-heading text-xl font-extrabold">
            {isEdit ? 'Modifier la ressource' : 'Ajouter une ressource'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Mets à jour le fichier, la cible et la mise en ligne.'
              : 'Dépose un fichier, choisis la cible et publie-le pour tes élèves.'}
          </DialogDescription>
        </DialogHeader>
        {/* key force un remount à chaque (ré)ouverture pour réinitialiser l'état */}
        <ResourceForm key={resource?.id ?? 'new'} mode={mode} resource={resource} />
      </DialogContent>
    </Dialog>
  )
}

function ResourceForm({ mode, resource }: { mode: 'create' | 'edit'; resource?: SharedResource }) {
  const isEdit = mode === 'edit'

  const [type, setType] = useState<ResourceType>(resource?.type ?? 'pdf')
  const [title, setTitle] = useState(resource?.title ?? '')
  const [message, setMessage] = useState(resource?.description ?? '')
  const [schedule, setSchedule] = useState<'now' | 'later'>(
    resource?.status === 'planifié' ? 'later' : 'now',
  )
  const [upload, setUpload] = useState<UploadState>(
    resource
      ? { phase: 'done', name: resource.fileName, size: resource.fileSize }
      : { phase: 'idle' },
  )
  const [target, setTarget] = useState<Target>(
    resource?.students.length
      ? { kind: 'student', value: resource.students[0] }
      : { kind: 'group', value: resource?.groups[0] ?? profGroups[0].name },
  )

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Donne un titre à ta ressource.')
      return
    }
    toast.success(
      isEdit
        ? `« ${title} » enregistrée`
        : schedule === 'later'
          ? `« ${title} » planifiée`
          : `« ${title} » publiée`,
    )
  }

  return (
    <>
      <div className="space-y-5 px-5 py-4">
        <UploadZone state={upload} onChange={setUpload} />

        {/* Type segmenté */}
        <div className="space-y-2">
          <Label>Type de ressource</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPE_ORDER.map((t) => {
              const m = TYPE_META[t]
              const active = type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all',
                    active
                      ? 'border-brand bg-brand text-white shadow-brand-glow'
                      : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
                  )}
                >
                  <m.Icon className="size-4" />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cible */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type de cible</Label>
            <Select
              value={target.kind}
              onValueChange={(k) => {
                const kind = k as Target['kind']
                if (kind === 'group') setTarget({ kind, value: profGroups[0].name })
                else if (kind === 'student') setTarget({ kind, value: profStudents[0].pseudo })
                else setTarget({ kind, value: 'CE1D' })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Un groupe</SelectItem>
                <SelectItem value="student">Un élève</SelectItem>
                <SelectItem value="level">Un niveau</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Destinataire</Label>
            <Select value={target.value} onValueChange={(v) => setTarget({ ...target, value: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {target.kind === 'group' &&
                  profGroups.map((g) => (
                    <SelectItem key={g.id} value={g.name}>
                      {g.name}
                    </SelectItem>
                  ))}
                {target.kind === 'student' &&
                  profStudents.map((s) => (
                    <SelectItem key={s.id} value={s.pseudo}>
                      {s.avatar} {s.pseudo}
                    </SelectItem>
                  ))}
                {target.kind === 'level' &&
                  ['CE1D', 'S1', 'S2'].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <Label htmlFor="rsc-title">Titre</Label>
          <Input
            id="rsc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Correction interro fractions"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="rsc-msg">Message d'accompagnement</Label>
          <Textarea
            id="rsc-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Un mot pour tes élèves (optionnel)…"
            rows={3}
          />
        </div>

        {/* Mise en ligne */}
        <div className="space-y-2">
          <Label>Mise en ligne</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['now', 'Publier maintenant'],
                ['later', 'Planifier'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSchedule(k)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-semibold transition-all',
                  schedule === k
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {schedule === 'later' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Input type="date" defaultValue="2026-06-20" aria-label="Date de publication" />
              <Input type="time" defaultValue="08:00" aria-label="Heure de publication" />
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="px-5">
        <DialogClose asChild>
          <Button variant="outline">Annuler</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSubmit}>{isEdit ? 'Enregistrer' : schedule === 'later' ? 'Planifier' : 'Publier'}</Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

/* --------------------------- Zone de dépôt --------------------------- */

function UploadZone({
  state,
  onChange,
}: {
  state: UploadState
  onChange: (s: UploadState) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current)
    },
    [],
  )

  const startImport = (name: string, sizeBytes: number) => {
    if (timer.current) clearInterval(timer.current)
    const size = formatSize(sizeBytes)
    onChange({ phase: 'uploading', progress: 0, name, size })
    let p = 0
    timer.current = setInterval(() => {
      p += Math.random() * 12 + 6
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current)
        onChange({ phase: 'done', name, size })
      } else {
        onChange({ phase: 'uploading', progress: Math.round(p), name, size })
      }
    }, 60)
  }

  const onFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    startImport(f.name, f.size || 1_200_000)
  }

  const reset = () => {
    if (timer.current) clearInterval(timer.current)
    onChange({ phase: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  if (state.phase === 'done') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success-soft/60 p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-brand shadow-soft">
          <FileIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{state.name}</p>
          <p className="text-xs text-muted-foreground">{state.size}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-success">
          <Check className="size-4" /> Importé
        </span>
        <button
          type="button"
          onClick={reset}
          aria-label="Retirer le fichier"
          className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  if (state.phase === 'uploading') {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand/50 bg-brand-soft/40 p-6 text-center">
        <Loader className="size-9 animate-spin text-brand" />
        <p className="text-sm font-semibold text-foreground">Importation… {state.progress} %</p>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-75 ease-out"
            style={{ width: `${state.progress}%` }}
          />
        </div>
        <p className="truncate text-xs text-muted-foreground">{state.name}</p>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        onFiles(e.dataTransfer.files)
      }}
      className={cn(
        'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all outline-none focus-visible:ring-4 focus-visible:ring-brand/20',
        isDragging
          ? 'scale-[1.02] border-brand bg-brand-soft ring-4 ring-brand/20'
          : 'border-border bg-secondary/40 hover:border-brand/40 hover:bg-secondary/70',
      )}
    >
      <CloudUpload
        className={cn('size-10 text-brand transition-transform', isDragging && 'animate-bounce')}
      />
      <p className="text-sm font-semibold text-foreground">
        {isDragging ? (
          'Dépose ton fichier ici'
        ) : (
          <>
            Glisse-dépose un fichier ou <span className="text-brand underline">clique pour parcourir</span>
          </>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{ACCEPT_HINT}</p>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => onFiles(e.target.files)}
        accept=".pdf,.mp4,.jpg,.jpeg,.png"
      />
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} Mo`
  return `${Math.max(1, Math.round(bytes / 1000))} Ko`
}
