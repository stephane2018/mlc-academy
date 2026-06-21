import { Link } from '@tanstack/react-router'
import {
  Play,
  FilePdf,
  Dumbbell,
  BookOpen,
  Lock,
  Clock,
  CheckCircle2,
  type IconComponent,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  type LibraryItem,
  type ResourceType,
  getSubject,
  themeLabel,
} from '@/lib/mock'

export const TYPE_META: Record<
  ResourceType,
  { label: string; Icon: IconComponent; cover: string; chip: string; ring: string }
> = {
  video: {
    label: 'Vidéo',
    Icon: Play,
    cover: 'from-indigo-500 to-violet-600',
    chip: 'bg-brand-soft text-brand',
    ring: 'group-hover:ring-brand/30',
  },
  pdf: {
    label: 'PDF',
    Icon: FilePdf,
    cover: 'from-rose-500 to-red-600',
    chip: 'bg-rose-100 text-rose-600',
    ring: 'group-hover:ring-rose-300/40',
  },
  exercice: {
    label: 'Exercice',
    Icon: Dumbbell,
    cover: 'from-emerald-500 to-green-600',
    chip: 'bg-success-soft text-success',
    ring: 'group-hover:ring-success/30',
  },
  fiche: {
    label: 'Fiche',
    Icon: BookOpen,
    cover: 'from-amber-400 to-orange-500',
    chip: 'bg-amber-soft text-amber-foreground',
    ring: 'group-hover:ring-amber/40',
  },
}

function metaLine(item: LibraryItem): string {
  if (item.type === 'video') return item.duration ?? ''
  if (item.type === 'exercice') return `${item.questions} questions`
  return `${item.pages} page${(item.pages ?? 0) > 1 ? 's' : ''}`
}

/** Couverture stylée d'une ressource (dégradé par type + filigrane + survol). */
export function ResourceCover({
  item,
  className,
}: {
  item: LibraryItem
  className?: string
}) {
  const m = TYPE_META[item.type]
  const done = item.progress >= 100
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-2xl bg-gradient-to-br text-white',
        m.cover,
        className,
      )}
    >
      {/* Filigrane */}
      <m.Icon className="absolute -bottom-5 -right-4 size-28 text-white/15" strokeWidth={1.5} />
      {/* Type */}
      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
        <m.Icon className="size-3.5" />
        {m.label}
      </span>
      {/* Premium / fait */}
      {item.premium ? (
        <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-black/25 backdrop-blur">
          <Lock className="size-3.5" />
        </span>
      ) : done ? (
        <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-white/25 backdrop-blur">
          <CheckCircle2 className="size-4" />
        </span>
      ) : null}
      {/* Lecture (vidéo) */}
      {item.type === 'video' && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-brand shadow-lg transition-transform duration-200 group-hover:scale-110">
            <Play className="size-6 translate-x-0.5" />
          </span>
        </span>
      )}
      {/* Méta bas */}
      <span className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
        {item.type === 'video' && <Clock className="size-3" />}
        {metaLine(item)}
      </span>
      {/* Progression */}
      {item.progress > 0 && (
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20">
          <span
            className="block h-full bg-white"
            style={{ width: `${item.progress}%` }}
          />
        </span>
      )}
    </div>
  )
}

/** Carte cliquable d'une ressource → page lecteur. */
export function ResourceCard({ item }: { item: LibraryItem }) {
  const m = TYPE_META[item.type]
  return (
    <Link
      to="/eleve/bibliotheque/$id"
      params={{ id: item.id }}
      className={cn(
        'group block rounded-3xl border border-border bg-card p-2.5 shadow-soft ring-1 ring-transparent transition-all card-hover',
        m.ring,
      )}
    >
      <ResourceCover item={item} className="aspect-video" />
      <div className="px-1.5 pb-1 pt-2.5">
        <p className="line-clamp-2 font-heading text-sm font-bold leading-snug">{item.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: getSubject(item.subject).color }}
          />
          {themeLabel(item.theme, item.subject)} · {item.chapter}
        </p>
      </div>
    </Link>
  )
}
