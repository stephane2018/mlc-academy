import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  CheckSquare,
  Lock,
  Loader,
} from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatTile } from '@/components/blocks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSubjects, useClasses } from '@/hooks/use-catalog'
import { useAdminExams, useCreateExam, useUpdateExam, useDeleteExam } from '@/hooks/use-admin-exams'
import { ExamFields, emptyExamForm, type ExamForm } from '@/components/admin/exam-fields'
import type { AdminExamListItem } from '@/services/admin-exams'
import { ApiError } from '@/lib/api-client'

export const Route = createFileRoute('/admin/examens/')({
  component: AdminExamens,
})

/** Dialog de création : crée la coquille (brouillon) puis ouvre la page de composition. */
function CreateExamDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ExamForm>(emptyExamForm())
  const createExam = useCreateExam()
  const navigate = useNavigate()

  function submit() {
    if (!form.title.trim()) return toast.error('Donne un titre à l’examen.')
    if (!form.subjectId) return toast.error('Choisis une matière.')
    createExam.mutate(
      {
        title: form.title.trim(),
        subjectId: form.subjectId,
        themeId: form.themeId || null,
        classId: form.classId || null,
        durationMin: Number(form.durationMin) || 30,
        premium: form.premium,
        difficulty: form.difficulty,
      },
      {
        onSuccess: (exam) => {
          setOpen(false)
          setForm(emptyExamForm())
          // Ouvre la page dédiée pour composer les questions / publier.
          navigate({ to: '/admin/examens/$examId', params: { examId: exam.id } })
        },
        onError: () => toast.error('Échec de la création. Réessaie.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Créer un examen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un examen blanc</DialogTitle>
          <DialogDescription>
            On crée un brouillon, puis tu composes les questions sur la page dédiée. Publication quand tu es prêt.
          </DialogDescription>
        </DialogHeader>
        <ExamFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={createExam.isPending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={createExam.isPending}>
            {createExam.isPending && <Loader className="size-4 animate-spin" />}
            Créer et composer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminExamens() {
  const { data: exams, isLoading, isError } = useAdminExams()
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const deleteExam = useDeleteExam()
  const updateExam = useUpdateExam()
  const navigate = useNavigate()

  const subjectName = useMemo(
    () => (id: string) => subjects.find((s) => s.id === id)?.name ?? '—',
    [subjects],
  )
  const className = useMemo(
    () => (id: string | null) => (id ? (classes.find((c) => c.id === id)?.label ?? '—') : '—'),
    [classes],
  )

  const items = exams ?? []
  const publishedCount = items.filter((e) => e.status === 'publie').length
  const draftCount = items.filter((e) => e.status === 'brouillon').length

  function open(exam: AdminExamListItem) {
    navigate({ to: '/admin/examens/$examId', params: { examId: exam.id } })
  }

  function togglePublish(exam: AdminExamListItem) {
    const next = exam.status === 'publie' ? 'brouillon' : 'publie'
    updateExam.mutate(
      { id: exam.id, input: { status: next } },
      {
        onSuccess: () => toast.success(next === 'publie' ? 'Examen publié' : 'Repassé en brouillon'),
        onError: (err) =>
          toast.error(
            err instanceof ApiError && err.status === 400
              ? 'Ajoute au moins une question avant de publier.'
              : 'Échec. Réessaie.',
          ),
      },
    )
  }

  function confirmDelete(exam: AdminExamListItem) {
    if (!window.confirm(`Supprimer « ${exam.title} » ? Cette action est définitive.`)) return
    deleteExam.mutate(exam.id, {
      onSuccess: () => toast.success('Examen supprimé'),
      onError: () => toast.error('Échec de la suppression. Réessaie.'),
    })
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Examens blancs CE1D</p>
        <CreateExamDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={CheckSquare} tone="brand" label="Examens publiés" value={`${publishedCount}`} />
        <StatTile icon={Pencil} tone="info" label="Brouillons" value={`${draftCount}`} />
        <StatTile icon={Lock} tone="amber" label="Examens premium" value={`${items.filter((e) => e.premium).length}`} />
      </div>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Matière</th>
                <th className="px-5 py-3 font-semibold">Classe</th>
                <th className="px-5 py-3 font-semibold">Durée</th>
                <th className="px-5 py-3 font-semibold">Questions</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Loader className="mx-auto size-5 animate-spin" />
                    <p className="mt-2 text-sm">Chargement des examens…</p>
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-destructive">
                    Impossible de charger les examens. Réessaie plus tard.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">Aucun examen pour le moment.</p>
                    <p className="mt-1 text-xs">Crée un premier examen blanc pour démarrer.</p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                items.map((exam) => (
                  <tr
                    key={exam.id}
                    className="cursor-pointer transition-colors hover:bg-secondary/40"
                    onClick={() => open(exam)}
                  >
                    <td className="px-5 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {exam.title}
                        {exam.premium && <Lock className="size-3.5 text-amber" />}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{subjectName(exam.subjectId)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{className(exam.classId)}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        {exam.durationMin} min
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">{exam.questionCount}</td>
                    <td className="px-5 py-3">
                      {exam.status === 'publie' ? (
                        <Badge className="bg-success-soft text-success">Publié</Badge>
                      ) : (
                        <Badge className="bg-amber-soft text-amber-foreground">Brouillon</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => open(exam)}>
                            <Pencil className="size-4" />
                            Composer / modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(exam)}>
                            <CheckSquare className="size-4" />
                            {exam.status === 'publie' ? 'Repasser en brouillon' : 'Publier'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => confirmDelete(exam)}>
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
