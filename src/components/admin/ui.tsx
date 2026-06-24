import type { ReactNode } from 'react'
import type { IconComponent } from '@/components/icons'
import { cn } from '@/lib/utils'

/**
 * Primitives du back-office — « dark SaaS, mais vivant » : couleur maîtrisée
 * (KPI teintés à pastille colorée, accents par section) + hiérarchie marquée.
 * Scopé à l'admin (ne touche pas aux tokens globaux).
 */

export type AdminTone = 'brand' | 'teal' | 'amber' | 'success' | 'info' | 'violet' | 'destructive'

/** Carte KPI : fond teinté + pastille pleine. */
const KPI: Record<AdminTone, { card: string; chip: string }> = {
  brand: { card: 'border-brand/15 bg-brand-soft/50', chip: 'bg-brand text-white' },
  teal: { card: 'border-teal/20 bg-teal-soft/40', chip: 'bg-teal text-white' },
  amber: { card: 'border-amber/25 bg-amber-soft/50', chip: 'bg-amber text-white' },
  success: { card: 'border-success/20 bg-success-soft/40', chip: 'bg-success text-white' },
  info: { card: 'border-info/20 bg-info-soft/40', chip: 'bg-info text-white' },
  violet: { card: 'border-violet/20 bg-violet-soft/40', chip: 'bg-violet text-white' },
  destructive: { card: 'border-destructive/20 bg-destructive/5', chip: 'bg-destructive text-white' },
}

/** Barre d'accent (en-tête de panneau / titre). */
const BAR: Record<AdminTone, string> = {
  brand: 'bg-brand',
  teal: 'bg-teal',
  amber: 'bg-amber',
  success: 'bg-success',
  info: 'bg-info',
  violet: 'bg-violet',
  destructive: 'bg-destructive',
}

/** En-tête de page : eyebrow coloré + titre fort + sous-titre + actions. */
export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        )}
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Carte d'indicateur : fond teinté, pastille colorée, grand chiffre tabulaire. */
export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  hint,
}: {
  label: string
  value: ReactNode
  icon: IconComponent
  tone?: AdminTone
  hint?: string
}) {
  return (
    <div className={cn('rounded-xl border p-4 transition-shadow hover:shadow-soft', KPI[tone].card)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg shadow-sm', KPI[tone].chip)}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 flex h-9 items-center font-heading text-3xl font-extrabold tabular-nums">
        {value}
      </div>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Panneau : en-tête à barre d'accent colorée (hiérarchie) + corps. */
export function Panel({
  title,
  tone = 'brand',
  action,
  children,
  bodyClassName,
  className,
}: {
  title?: string
  tone?: AdminTone
  action?: ReactNode
  children: ReactNode
  bodyClassName?: string
  className?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-soft', className)}>
      {(title || action) && (
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          {title && <span className={cn('h-4 w-1 shrink-0 rounded-full', BAR[tone])} />}
          {title && <h2 className="text-sm font-bold tracking-tight">{title}</h2>}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
