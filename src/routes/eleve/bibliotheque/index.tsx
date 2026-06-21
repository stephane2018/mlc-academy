import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '@/components/blocks'
import { TYPE_META } from '@/components/student/resource-card'
import { LibraryResourceCard } from '@/components/student/library-resource-card'
import { LayoutGrid, RotateCcw } from '@/components/icons'
import { cn } from '@/lib/utils'
import { useResources } from '@/hooks/use-library'
import { useSubjects } from '@/hooks/use-catalog'
import type { ResourceType } from '@/services/library'

export const Route = createFileRoute('/eleve/bibliotheque/')({
  component: LibraryPage,
})

type TypeFilter = 'all' | ResourceType
const TYPE_ORDER: ResourceType[] = ['video', 'pdf', 'exercice', 'fiche']

function LibraryPage() {
  const [type, setType] = useState<TypeFilter>('all')
  const [subjectId, setSubjectId] = useState<string | 'all'>('all')

  const resourcesQuery = useResources()
  const subjectsQuery = useSubjects()
  const resources = resourcesQuery.data ?? []
  const subjects = subjectsQuery.data ?? []

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const themeName = (sId: string, tId: string | null) =>
    (tId && subjectById.get(sId)?.themes.find((t) => t.id === tId)?.name) || 'Général'

  const visible = resources.filter(
    (r) => (type === 'all' || r.type === type) && (subjectId === 'all' || r.subjectId === subjectId),
  )
  const inProgress = visible.filter((r) => r.progress > 0 && r.progress < 100)

  const inSubject = resources.filter((r) => subjectId === 'all' || r.subjectId === subjectId)
  const typeTabs: { key: TypeFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: inSubject.length },
    ...TYPE_ORDER.map((t) => ({ key: t as TypeFilter, label: TYPE_META[t].label, count: inSubject.filter((r) => r.type === t).length })),
  ]

  if (resourcesQuery.isLoading) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Chargement…</div>
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero eyebrow="Réviser" title="Bibliothèque" subtitle="Vidéos, PDF, exercices et fiches — tout le programme, classé par chapitre." />

      {/* Filtre matière */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <FilterChip active={subjectId === 'all'} onClick={() => setSubjectId('all')} label="Toutes" count={resources.length} />
        {subjects.map((s) => {
          const count = resources.filter((r) => r.subjectId === s.id).length
          if (count === 0) return null
          return <FilterChip key={s.id} active={subjectId === s.id} onClick={() => setSubjectId(s.id)} label={s.name} count={count} color={s.color} />
        })}
      </div>

      {/* Filtre type */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {typeTabs.map((t) => {
          const active = type === t.key
          const Icon = t.key === 'all' ? LayoutGrid : TYPE_META[t.key as ResourceType].Icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                active ? 'border-brand bg-brand text-white shadow-brand-glow' : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {t.label}
              <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-white/20' : 'bg-secondary text-muted-foreground')}>{t.count}</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-secondary/50 p-6 text-center text-sm text-muted-foreground">Aucune ressource pour ce filtre.</p>
      ) : (
        <>
          {/* En cours */}
          {inProgress.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <RotateCcw className="size-5 text-brand" />
                <h2 className="font-heading text-lg font-bold">En cours</h2>
                <span className="text-sm text-muted-foreground">· reprends où tu t'es arrêté</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inProgress.map((r) => (
                  <LibraryResourceCard key={r.id} resource={r} subjectColor={subjectById.get(r.subjectId)?.color ?? null} themeName={themeName(r.subjectId, r.themeId)} />
                ))}
              </div>
            </section>
          )}

          {/* Groupé par matière */}
          {subjects.map((s) => {
            const items = visible.filter((r) => r.subjectId === s.id)
            if (items.length === 0) return null
            return (
              <section key={s.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: s.color ?? 'var(--brand)' }} />
                  <h2 className="font-heading text-lg font-bold">{s.name}</h2>
                  <span className="text-sm font-medium text-muted-foreground">· {items.length} ressource{items.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((r) => (
                    <LibraryResourceCard key={r.id} resource={r} subjectColor={s.color} themeName={themeName(s.id, r.themeId)} />
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label, count, color }: { active: boolean; onClick: () => void; label: string; count: number; color?: string | null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
        active ? 'border-brand bg-brand text-white shadow-brand-glow' : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
      )}
    >
      {color && <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />}
      {label}
      <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-white/20' : 'bg-secondary text-muted-foreground')}>{count}</span>
    </button>
  )
}
