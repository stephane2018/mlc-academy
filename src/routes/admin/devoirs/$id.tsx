import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Dumbbell, GraduationCap } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAdminAssignment } from '@/hooks/use-admin'

export const Route = createFileRoute('/admin/devoirs/$id')({
  component: AssignmentDetail,
})

function AssignmentDetail() {
  const { id } = useParams({ from: '/admin/devoirs/$id' })
  const aQ = useAdminAssignment(id)
  const a = aQ.data

  if (aQ.isLoading) {
    return <p className="px-6 py-10 text-center text-sm text-muted-foreground">Chargement du devoir…</p>
  }
  if (aQ.isError || !a) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <Link to="/admin/utilisateurs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Retour
        </Link>
        <Card className="rounded-2xl p-8 text-center text-sm text-destructive shadow-soft">Devoir introuvable.</Card>
      </div>
    )
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[900px]">
      <Link to="/admin/utilisateurs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Comptes
      </Link>

      <Card className="flex flex-wrap items-center gap-4 rounded-2xl p-6 shadow-soft">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Dumbbell className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-xl font-extrabold tracking-tight">{a.title}</h1>
          <p className="text-sm text-muted-foreground">
            {a.type === 'evaluation' ? 'Évaluation' : 'Devoir'} · {a.questionCount} question{a.questionCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-muted-foreground">{a.status}</Badge>
          {a.teacherName && (
            <Badge variant="secondary" className="bg-teal-soft text-teal">
              <GraduationCap className="size-3" /> {a.teacherName}
            </Badge>
          )}
        </div>
      </Card>

      <Card className="gap-3 rounded-2xl p-5 shadow-soft">
        <h2 className="font-heading text-base font-bold">Copies ({a.submissions.length})</h2>
        {a.submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune copie rendue pour l'instant.</p>
        ) : (
          <ul className="space-y-2">
            {a.submissions.map((s) => (
              <li key={s.studentId}>
                <Link
                  to="/admin/utilisateurs/$id"
                  params={{ id: s.studentId }}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 transition-colors hover:border-brand/40 hover:bg-secondary/40"
                >
                  <span className="flex items-center gap-2 truncate text-sm font-medium">
                    {s.pseudo}
                    {s.hasFile && <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">copie fichier</Badge>}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {s.score !== null ? `${s.score}%` : 'à corriger'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
