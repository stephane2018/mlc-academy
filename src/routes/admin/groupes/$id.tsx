import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Boxes, Users, GraduationCap } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAdminGroup } from '@/hooks/use-admin'

export const Route = createFileRoute('/admin/groupes/$id')({
  component: GroupDetail,
})

function GroupDetail() {
  const { id } = useParams({ from: '/admin/groupes/$id' })
  const groupQ = useAdminGroup(id)
  const g = groupQ.data

  if (groupQ.isLoading) {
    return <p className="px-6 py-10 text-center text-sm text-muted-foreground">Chargement du groupe…</p>
  }
  if (groupQ.isError || !g) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <Link to="/admin/utilisateurs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Retour
        </Link>
        <Card className="rounded-2xl p-8 text-center text-sm text-destructive shadow-soft">Groupe introuvable.</Card>
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
          <Boxes className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-xl font-extrabold tracking-tight">{g.name}</h1>
          <p className="text-sm text-muted-foreground">
            Code <span className="font-mono font-semibold text-foreground">{g.code}</span>
            {g.classCode ? ` · ${g.classCode}` : ''}
          </p>
        </div>
        {g.teacherName && (
          <Link
            to={g.teacherId ? '/admin/utilisateurs/$id' : '/admin/utilisateurs'}
            params={g.teacherId ? { id: g.teacherId } : undefined}
          >
            <Badge variant="secondary" className="bg-teal-soft text-teal transition-colors hover:opacity-80">
              <GraduationCap className="size-3" /> {g.teacherName}
            </Badge>
          </Link>
        )}
      </Card>

      <Card className="gap-3 rounded-2xl p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-brand" />
          <h2 className="font-heading text-base font-bold">Membres ({g.members.length})</h2>
        </div>
        {g.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun élève dans ce groupe.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {g.members.map((m) => (
              <li key={m.id}>
                <Link
                  to="/admin/utilisateurs/$id"
                  params={{ id: m.id }}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 transition-colors hover:border-brand/40 hover:bg-secondary/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-lg">{m.avatar}</span>
                  <span className="truncate text-sm font-medium">{m.pseudo}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
