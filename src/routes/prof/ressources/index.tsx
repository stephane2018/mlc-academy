import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHero, StatTile } from '@/components/blocks'
import { TYPE_META } from '@/components/student/resource-card'
import { ResourceDialog } from '@/components/prof/resource-dialog'
import { ProfResourceCover, StatusBadge, targetSummary } from '@/components/prof/resource-bits'
import { Button } from '@/components/ui/button'
import {
  Plus,
  LayoutGrid,
  ListView,
  Eye,
  Heart,
  MessageSquare,
  ChevronRight,
  Boxes,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { sharedResources, type ResourceType } from '@/lib/mock'

export const Route = createFileRoute('/prof/ressources/')({
  component: ResourcesPage,
})

type Filter = 'all' | ResourceType
type View = 'grid' | 'list'
const TYPE_ORDER: ResourceType[] = ['video', 'pdf', 'exercice', 'fiche']

function ResourcesPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('grid')

  const visible = sharedResources.filter((r) => filter === 'all' || r.type === filter)

  const totalViews = sharedResources.reduce((a, r) => a + r.views, 0)
  const totalLikes = sharedResources.reduce((a, r) => a + r.likes, 0)

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tout', count: sharedResources.length },
    ...TYPE_ORDER.map((t) => ({
      key: t as Filter,
      label: TYPE_META[t].label,
      count: sharedResources.filter((r) => r.type === t).length,
    })),
  ]

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        variant="surface"
        eyebrow="Partager"
        title="Ressources"
        subtitle="Distribue vidéos, PDF, exercices et fiches à tes groupes et élèves — et suis leur engagement."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              <ViewButton active={view === 'grid'} onClick={() => setView('grid')} label="Vue grille">
                <LayoutGrid className="size-4" />
              </ViewButton>
              <ViewButton active={view === 'list'} onClick={() => setView('list')} label="Vue liste">
                <ListView className="size-4" />
              </ViewButton>
            </div>
            <ResourceDialog
              mode="create"
              trigger={
                <Button>
                  <Plus className="size-4" /> Ajouter une ressource
                </Button>
              }
            />
          </>
        }
      />

      {/* Synthèse */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Boxes} tone="brand" label="Ressources partagées" value={sharedResources.length} />
        <StatTile icon={Eye} tone="teal" label="Vues cumulées" value={totalViews} />
        <StatTile icon={Heart} tone="amber" label="Likes cumulés" value={totalLikes} />
      </div>

      {/* Filtres par type */}
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

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucune ressource de ce type.
        </p>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((r) => (
            <Link
              key={r.id}
              to="/prof/ressources/$id"
              params={{ id: r.id }}
              className="group block rounded-3xl border border-border bg-card p-2.5 shadow-soft transition-all card-hover"
            >
              <ProfResourceCover type={r.type} className="aspect-video" />
              <div className="px-1.5 pb-1 pt-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 font-heading text-sm font-bold leading-snug">{r.title}</p>
                  <StatusBadge status={r.status} className="shrink-0" />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {targetSummary(r.groups, r.students)}
                </p>
                <Counters
                  views={r.views}
                  likes={r.likes}
                  comments={r.comments.length}
                  className="mt-2.5 border-t border-border pt-2.5"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {visible.map((r, i) => {
            const m = TYPE_META[r.type]
            return (
              <Link
                key={r.id}
                to="/prof/ressources/$id"
                params={{ id: r.id }}
                className={cn(
                  'group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-secondary/60 sm:px-4',
                  i > 0 && 'border-t border-border',
                )}
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white',
                    m.cover,
                  )}
                >
                  <m.Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-bold">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {targetSummary(r.groups, r.students)} · {r.date}
                  </p>
                </div>
                <StatusBadge status={r.status} className="hidden shrink-0 sm:inline-flex" />
                <Counters
                  views={r.views}
                  likes={r.likes}
                  comments={r.comments.length}
                  className="hidden shrink-0 md:flex"
                />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'grid size-8 place-items-center rounded-lg transition-all',
        active ? 'bg-brand text-white shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Counters({
  views,
  likes,
  comments,
  className,
}: {
  views: number
  likes: number
  comments: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 text-xs font-semibold text-muted-foreground', className)}>
      <span className="flex items-center gap-1">
        <Eye className="size-3.5" /> {views}
      </span>
      <span className="flex items-center gap-1">
        <Heart className="size-3.5" /> {likes}
      </span>
      <span className="flex items-center gap-1">
        <MessageSquare className="size-3.5" /> {comments}
      </span>
    </div>
  )
}
