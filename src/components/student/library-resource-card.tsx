import { Link } from '@tanstack/react-router'
import { Play, Lock, Clock, CheckCircle2 } from '@/components/icons'
import { cn } from '@/lib/utils'
import { TYPE_META } from '@/components/student/resource-card'
import type { Resource } from '@/services/library'

function metaLine(r: Resource): string {
  if (r.type === 'video') return r.duration ?? ''
  if (r.type === 'pdf' || r.type === 'fiche') return r.pages ? `${r.pages} page${r.pages > 1 ? 's' : ''}` : ''
  return TYPE_META[r.type].label
}

/** Couverture stylée d'une ressource réelle (dégradé par type + progression). */
export function LibraryCover({ resource, className }: { resource: Resource; className?: string }) {
  const m = TYPE_META[resource.type]
  const done = resource.progress >= 100
  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl bg-gradient-to-br text-white', m.cover, className)}>
      <m.Icon className="absolute -bottom-5 -right-4 size-28 text-white/15" strokeWidth={1.5} />
      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
        <m.Icon className="size-3.5" />
        {m.label}
      </span>
      {resource.premium ? (
        <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-black/25 backdrop-blur">
          <Lock className="size-3.5" />
        </span>
      ) : done ? (
        <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-white/25 backdrop-blur">
          <CheckCircle2 className="size-4" />
        </span>
      ) : null}
      {resource.type === 'video' && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-brand shadow-lg transition-transform duration-200 group-hover:scale-110">
            <Play className="size-6 translate-x-0.5" />
          </span>
        </span>
      )}
      {metaLine(resource) && (
        <span className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
          {resource.type === 'video' && <Clock className="size-3" />}
          {metaLine(resource)}
        </span>
      )}
      {resource.progress > 0 && (
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20">
          <span className="block h-full bg-white" style={{ width: `${resource.progress}%` }} />
        </span>
      )}
    </div>
  )
}

/** Carte cliquable d'une ressource réelle → page lecteur. */
export function LibraryResourceCard({
  resource,
  subjectColor,
  themeName,
}: {
  resource: Resource
  subjectColor: string | null
  themeName: string
}) {
  const m = TYPE_META[resource.type]
  return (
    <Link
      to="/eleve/bibliotheque/$id"
      params={{ id: resource.id }}
      className={cn('group block rounded-3xl border border-border bg-card p-2.5 shadow-soft ring-1 ring-transparent transition-all card-hover', m.ring)}
    >
      <LibraryCover resource={resource} className="aspect-video" />
      <div className="px-1.5 pb-1 pt-2.5">
        <p className="line-clamp-2 font-heading text-sm font-bold leading-snug">{resource.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: subjectColor ?? 'var(--brand)' }} />
          {themeName}
          {resource.chapter ? ` · ${resource.chapter}` : ''}
        </p>
      </div>
    </Link>
  )
}
