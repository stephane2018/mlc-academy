import { TYPE_META } from '@/components/student/resource-card'
import { Badge } from '@/components/ui/badge'
import { Lock } from '@/components/icons'
import { cn } from '@/lib/utils'
import type { SharedResource } from '@/lib/mock'

/** Couverture stylée d'une ressource partagée (dégradé par type + filigrane). */
export function ProfResourceCover({
  type,
  className,
}: {
  type: SharedResource['type']
  className?: string
}) {
  const m = TYPE_META[type]
  return (
    <div
      className={cn(
        'group/cover relative isolate overflow-hidden rounded-2xl bg-gradient-to-br text-white',
        m.cover,
        className,
      )}
    >
      <m.Icon className="absolute -bottom-5 -right-4 size-28 text-white/15" strokeWidth={1.5} />
      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
        <m.Icon className="size-3.5" />
        {m.label}
      </span>
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur transition-transform duration-200 group-hover:scale-110 group-hover/cover:scale-110">
          <m.Icon className="size-6" />
        </span>
      </span>
    </div>
  )
}

const STATUS_META: Record<
  SharedResource['status'],
  { variant: 'default' | 'secondary' | 'outline'; className: string; label: string }
> = {
  publié: { variant: 'secondary', className: 'bg-success-soft text-success', label: 'Publié' },
  planifié: { variant: 'secondary', className: 'bg-info-soft text-info', label: 'Planifié' },
  brouillon: { variant: 'outline', className: 'text-muted-foreground', label: 'Brouillon' },
}

/** Badge de statut (icône + libellé, jamais la couleur seule). */
export function StatusBadge({ status, className }: { status: SharedResource['status']; className?: string }) {
  const m = STATUS_META[status]
  return (
    <Badge variant={m.variant} className={cn(m.className, className)}>
      {status === 'brouillon' && <Lock className="size-3" />}
      {m.label}
    </Badge>
  )
}

/** Résumé textuel de la cible d'une ressource (groupes / élèves). */
export function targetSummary(groups: string[], students: string[]): string {
  if (groups.length === 0 && students.length === 0) return 'Non partagé'
  if (groups.length === 1 && students.length === 0) return groups[0]
  if (groups.length === 0 && students.length === 1) return students[0]
  const parts: string[] = []
  if (groups.length > 0) parts.push(`${groups.length} groupe${groups.length > 1 ? 's' : ''}`)
  if (students.length > 0) parts.push(`${students.length} élève${students.length > 1 ? 's' : ''}`)
  return parts.join(' · ')
}
