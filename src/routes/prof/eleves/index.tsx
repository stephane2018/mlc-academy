import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, ChevronRight } from '@/components/icons'
import { SectionHeader } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/query-error'
import { cn } from '@/lib/utils'
import { useTeacherStudents } from '@/hooks/use-teacher'

export const Route = createFileRoute('/prof/eleves/')({
  component: ProfEleves,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const fmtLast = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : 'Jamais')

function ProfEleves() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string>('Tous')
  const studentsQ = useTeacherStudents()
  const students = studentsQ.data ?? []
  const isLoading = studentsQ.isLoading

  const groups = useMemo(
    () => ['Tous', ...Array.from(new Set(students.flatMap((s) => s.groups)))],
    [students],
  )

  const filtered = students.filter((s) => {
    const matchQuery = s.pseudo.toLowerCase().includes(query.trim().toLowerCase())
    const matchGroup = group === 'Tous' || s.groups.includes(group)
    return matchQuery && matchGroup
  })

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Annuaire des élèves" />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un élève…" className="pl-9" />
        </div>
      </div>

      {/* Chips de filtre par groupe */}
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const active = group === g
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                active ? 'border-brand bg-brand text-white' : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {g}
            </button>
          )
        })}
      </div>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Élève</th>
                <th className="hidden px-4 py-3 sm:table-cell">Groupe(s)</th>
                <th className="hidden px-4 py-3 md:table-cell">Dernière activité</th>
                <th className="px-4 py-3" aria-label="Voir la fiche" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="group border-b border-border transition-colors last:border-0 hover:bg-secondary/40">
                  <td className="p-0">
                    <Link
                      to="/prof/eleves/$id"
                      params={{ id: s.id }}
                      className="flex items-center gap-2.5 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="grid size-9 place-items-center rounded-xl bg-secondary text-lg">{s.avatar}</span>
                      <span className="font-semibold group-hover:text-brand">{s.pseudo}</span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {s.groups.map((g) => (
                        <Badge key={g} variant="secondary" className="bg-brand-soft text-brand">{g}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{fmtLast(s.lastActive)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/prof/eleves/$id"
                      params={{ id: s.id }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand"
                    >
                      Fiche
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && studentsQ.isError && (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <QueryError onRetry={() => studentsQ.refetch()} />
                  </td>
                </tr>
              )}
              {!isLoading && !studentsQ.isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Aucun élève ne correspond à votre recherche.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Chargement…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
