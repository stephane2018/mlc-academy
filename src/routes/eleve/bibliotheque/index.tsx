import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '@/components/blocks'
import { ResourceCard, TYPE_META } from '@/components/student/resource-card'
import { LayoutGrid, RotateCcw } from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  library,
  skills,
  domainLabels,
  type ResourceType,
} from '@/lib/mock'

export const Route = createFileRoute('/eleve/bibliotheque/')({
  component: LibraryPage,
})

type Filter = 'all' | ResourceType
const TYPE_ORDER: ResourceType[] = ['video', 'pdf', 'exercice', 'fiche']

function LibraryPage() {
  const [filter, setFilter] = useState<Filter>('all')

  const visible = library.filter((r) => filter === 'all' || r.type === filter)
  const inProgress = visible.filter((r) => r.progress > 0 && r.progress < 100)

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: library.length },
    ...TYPE_ORDER.map((t) => ({
      key: t as Filter,
      label: TYPE_META[t].label,
      count: library.filter((r) => r.type === t).length,
    })),
  ]

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        eyebrow="Réviser"
        title="Bibliothèque"
        subtitle="Vidéos, PDF, exercices et fiches — tout le programme CE1D, classé par chapitre."
      />

      {/* Choisir le type */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const active = filter === t.key
          const Icon = t.key === 'all' ? LayoutGrid : TYPE_META[t.key as ResourceType].Icon
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                active
                  ? 'border-brand bg-brand text-white shadow-brand-glow'
                  : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {t.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  active ? 'bg-white/20' : 'bg-secondary text-muted-foreground',
                )}
              >
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* En cours */}
      {inProgress.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <RotateCcw className="size-5 text-brand" />
            <h2 className="font-heading text-lg font-bold">En cours</h2>
            <span className="text-sm text-muted-foreground">· reprends où tu t'es arrêté</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
            {inProgress.map((item) => (
              <div key={item.id} className="w-64 shrink-0 sm:w-auto">
                <ResourceCard item={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Par catégorie */}
      {skills.map((s) => {
        const items = visible.filter((r) => r.domain === s.key)
        if (items.length === 0) return null
        return (
          <section key={s.key}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">{domainLabels[s.key]}</h2>
              <span className="text-sm font-medium text-muted-foreground">
                {items.length} ressource{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <ResourceCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
