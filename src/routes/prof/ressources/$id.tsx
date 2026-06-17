import { useState } from 'react'
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { RailLayout } from '@/components/blocks'
import { TYPE_META } from '@/components/student/resource-card'
import { ResourceDialog } from '@/components/prof/resource-dialog'
import { ProfResourceCover, StatusBadge } from '@/components/prof/resource-bits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
import { toast } from 'sonner'
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  Send,
  Check,
  X,
  Plus,
  Pencil,
  Trash2,
  Users,
  User,
  FileIcon,
  CalendarDays,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  getSharedResource,
  profGroups,
  profStudents,
  type ResourceComment,
  type SharedResource,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/ressources/$id')({
  component: ResourceDetail,
})

function ResourceDetail() {
  const { id } = useParams({ from: '/prof/ressources/$id' })
  const resource = getSharedResource(id)

  if (!resource) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-heading text-xl font-bold">Ressource introuvable</p>
        <Button asChild>
          <Link to="/prof/ressources">Retour aux ressources</Link>
        </Button>
      </div>
    )
  }

  return <ResourceDetailView resource={resource} />
}

function ResourceDetailView({ resource }: { resource: SharedResource }) {
  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <Link
        to="/prof/ressources"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Ressources
      </Link>

      {/* En-tête */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-start sm:p-5">
        <ProfResourceCover type={resource.type} className="aspect-video w-full shrink-0 sm:w-56" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={TYPE_META[resource.type].chip}>
              {TYPE_META[resource.type].label}
            </Badge>
            <StatusBadge status={resource.status} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> {resource.date}
            </span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
            {resource.title}
          </h1>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-muted-foreground">{resource.description}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-1.5 text-sm">
            <FileIcon className="size-4 text-brand" />
            <span className="font-medium">{resource.fileName}</span>
            <span className="text-muted-foreground">· {resource.fileSize}</span>
          </div>
        </div>
      </div>

      <RailLayout rail={<DetailRail resource={resource} />}>
        <DetailContent resource={resource} />
      </RailLayout>
    </div>
  )
}

/* ----------------------------- Contenu ------------------------------- */

function DetailContent({ resource }: { resource: SharedResource }) {
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<ResourceComment[]>(resource.comments)

  const likes = resource.likes + (liked ? 1 : 0)
  const openQuestions = comments.filter((c) => !c.answered).length

  const markAnswered = (id: string) => {
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, answered: true } : c)))
    toast.success('Réponse envoyée')
  }

  return (
    <div className="space-y-5">
      {/* Bandeau stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCell icon={<Eye className="size-5" />} value={resource.views} label="Vues" />
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={cn(
            'group flex flex-col items-center justify-center gap-1 rounded-2xl border bg-card p-4 text-center shadow-soft transition-all',
            liked ? 'border-amber/50 bg-amber-soft' : 'border-border hover:border-amber/40',
          )}
          aria-pressed={liked}
        >
          <Heart
            className={cn(
              'size-5 transition-transform group-active:scale-125',
              liked ? 'text-amber' : 'text-muted-foreground',
            )}
          />
          <span className="font-heading text-xl font-extrabold leading-none">{likes}</span>
          <span className="text-xs text-muted-foreground">{liked ? 'Aimé' : 'Likes'}</span>
        </button>
        <StatCell icon={<MessageSquare className="size-5" />} value={comments.length} label="Questions" />
      </div>

      {/* Questions des élèves */}
      <Card className="gap-0 rounded-2xl p-4 shadow-soft sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Questions des élèves</h2>
          {openQuestions > 0 && (
            <Badge variant="secondary" className="bg-info-soft text-info">
              {openQuestions} en attente
            </Badge>
          )}
        </div>

        {comments.length === 0 ? (
          <p className="mt-4 rounded-xl bg-secondary/50 py-8 text-center text-sm text-muted-foreground">
            Aucune question pour le moment.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {comments.map((c) => (
              <QuestionItem key={c.id} comment={c} onAnswer={() => markAnswered(c.id)} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function StatCell({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
      <span className="text-brand">{icon}</span>
      <span className="font-heading text-xl font-extrabold leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function QuestionItem({ comment, onAnswer }: { comment: ResourceComment; onAnswer: () => void }) {
  const [reply, setReply] = useState('')

  return (
    <li className="flex gap-3">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="bg-secondary text-base">{comment.avatar}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">{comment.pseudo}</span>
          <span className="text-xs text-muted-foreground">{comment.time}</span>
          {comment.answered && (
            <Badge variant="secondary" className="bg-success-soft text-success">
              <Check className="size-3" /> Répondu
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{comment.text}</p>

        {!comment.answered && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!reply.trim()) return
              onAnswer()
              setReply('')
            }}
            className="mt-2 flex items-center gap-2"
          >
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Répondre à ${comment.pseudo}…`}
              className="h-9"
            />
            <Button type="submit" size="icon-sm" disabled={!reply.trim()} aria-label="Envoyer la réponse">
              <Send className="size-4" />
            </Button>
          </form>
        )}
      </div>
    </li>
  )
}

/* ------------------------------- Rail -------------------------------- */

type Shared = { kind: 'group' | 'student'; name: string }

function DetailRail({ resource }: { resource: SharedResource }) {
  const navigate = useNavigate()
  const [shared, setShared] = useState<Shared[]>([
    ...resource.groups.map((name) => ({ kind: 'group' as const, name })),
    ...resource.students.map((name) => ({ kind: 'student' as const, name })),
  ])
  const [editOpen, setEditOpen] = useState(false)

  const remove = (name: string) => {
    setShared((s) => s.filter((x) => x.name !== name))
    toast.success(`Retiré de ${name}`)
  }

  return (
    <>
      {/* Partagé avec */}
      <Card className="gap-0 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold">Partagé avec</p>
          <ShareDialog
            existing={shared}
            onAdd={(s) => {
              setShared((cur) => (cur.some((x) => x.name === s.name) ? cur : [...cur, s]))
              toast.success(`Partagé avec ${s.name}`)
            }}
          />
        </div>

        {shared.length === 0 ? (
          <p className="mt-3 rounded-xl bg-secondary/50 py-6 text-center text-xs text-muted-foreground">
            Pas encore partagé.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {shared.map((s) => (
              <li
                key={s.name}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2"
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-lg',
                    s.kind === 'group' ? 'bg-brand-soft text-brand' : 'bg-teal-soft text-teal',
                  )}
                >
                  {s.kind === 'group' ? <Users className="size-4" /> : <User className="size-4" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.name}</span>
                <button
                  type="button"
                  onClick={() => remove(s.name)}
                  aria-label={`Retirer ${s.name}`}
                  className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Actions */}
      <Card className="gap-0 rounded-2xl p-4 shadow-soft">
        <p className="mb-3 font-heading font-bold">Actions</p>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" /> Modifier
          </Button>
          <ResourceDialog mode="edit" resource={resource} open={editOpen} onOpenChange={setEditOpen} />

          <DeleteDialog
            title={resource.title}
            onConfirm={() => {
              toast.success(`« ${resource.title} » supprimée`)
              navigate({ to: '/prof/ressources' })
            }}
          />
        </div>
      </Card>
    </>
  )
}

function ShareDialog({
  existing,
  onAdd,
}: {
  existing: Shared[]
  onAdd: (s: Shared) => void
}) {
  const [value, setValue] = useState('')

  const groupOpts = profGroups
    .map((g) => g.name)
    .filter((n) => !existing.some((e) => e.name === n))
  const studentOpts = profStudents
    .map((s) => s.pseudo)
    .filter((n) => !existing.some((e) => e.name === n))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-brand">
          <Plus className="size-4" /> Partager
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager avec…</DialogTitle>
          <DialogDescription>Ajoute un groupe ou un élève à cette ressource.</DialogDescription>
        </DialogHeader>
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisir un destinataire" />
          </SelectTrigger>
          <SelectContent>
            {groupOpts.map((n) => (
              <SelectItem key={n} value={`group:${n}`}>
                {n}
              </SelectItem>
            ))}
            {studentOpts.map((n) => (
              <SelectItem key={n} value={`student:${n}`}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={!value}
              onClick={() => {
                if (!value) return
                const [kind, name] = value.split(':') as ['group' | 'student', string]
                onAdd({ kind, name })
                setValue('')
              }}
            >
              Partager
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ title, onConfirm }: { title: string; onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="size-4" /> Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la ressource ?</DialogTitle>
          <DialogDescription>
            « {title} » sera définitivement retirée pour tous les élèves. Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              <Trash2 className="size-4" /> Supprimer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
