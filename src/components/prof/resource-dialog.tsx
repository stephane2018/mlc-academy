import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { TYPE_META } from '@/components/student/resource-card'
import { spreadAvatar } from '@/lib/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker, TimePicker } from '@/components/ui/date-picker'
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
import { cn } from '@/lib/utils'
import { UploadZone, type UploadState } from '@/components/upload-zone'
import {
  profGroups,
  profStudents,
  type ResourceType,
  type SharedResource,
} from '@/lib/mock'

const TYPE_ORDER: ResourceType[] = ['video', 'pdf', 'exercice', 'fiche']

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
  const [pubDate, setPubDate] = useState('2026-06-20')
  const [pubTime, setPubTime] = useState('08:00')
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
                      {spreadAvatar(s.avatar, s.pseudo)} {s.pseudo}
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
              <DatePicker value={pubDate} onChange={setPubDate} aria-label="Date de publication" />
              <TimePicker value={pubTime} onChange={setPubTime} aria-label="Heure de publication" />
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
