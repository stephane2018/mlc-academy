/**
 * Blocs de mise en page desktop réutilisables (refonte « marquée »).
 * Partagés entre les espaces Élève / Prof / Parent / Admin pour la cohérence.
 */
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SoftIcon } from '@/components/student/parts'
import { TrendingUp, TrendingDown, type IconComponent } from '@/components/icons'

type Tone = 'brand' | 'teal' | 'amber' | 'success' | 'info'

/* ------------------------------------------------------------------ */
/* En-tête de page (héros) — surface claire ou bandeau de marque       */
/* ------------------------------------------------------------------ */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  variant = 'surface',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  variant?: 'surface' | 'brand'
  className?: string
}) {
  const brand = variant === 'brand'
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border p-5 sm:p-6 lg:p-8',
        brand
          ? 'border-transparent bg-gradient-to-br from-brand via-indigo-600 to-indigo-700 text-white shadow-brand-glow'
          : 'border-border bg-card shadow-soft',
        className,
      )}
    >
      {brand && (
        <span className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 bg-dotted text-white/20" />
      )}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p
              className={cn(
                'text-[11px] font-bold uppercase tracking-[0.18em]',
                brand ? 'text-white/70' : 'text-brand',
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'mt-1 font-heading text-2xl font-extrabold tracking-tight lg:text-3xl xl:text-4xl',
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={cn('mt-2 max-w-2xl text-sm lg:text-base', brand ? 'text-white/80' : 'text-muted-foreground')}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="relative mt-5">{children}</div>}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Disposition contenu + rail latéral sticky (xl+)                     */
/* ------------------------------------------------------------------ */
export function RailLayout({
  children,
  rail,
  railWidth = '340px',
}: {
  children: ReactNode
  rail: ReactNode
  railWidth?: string
}) {
  return (
    <div
      className="gap-6 xl:grid"
      style={{ gridTemplateColumns: `minmax(0,1fr) ${railWidth}` }}
    >
      <div className="min-w-0 space-y-5">{children}</div>
      <aside className="mt-5 space-y-5 xl:mt-0 xl:sticky xl:top-6 xl:self-start">{rail}</aside>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tuile statistique avec tendance et mini-graphe optionnel            */
/* ------------------------------------------------------------------ */
export function StatTile({
  icon,
  tone = 'brand',
  label,
  value,
  delta,
  trend,
  spark,
  className,
}: {
  icon?: IconComponent
  tone?: Tone
  label: string
  value: ReactNode
  delta?: string
  trend?: 'up' | 'down'
  spark?: ReactNode
  className?: string
}) {
  const Icon = icon
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <SoftIcon tone={tone}>
            <Icon className="size-5" />
          </SoftIcon>
        )}
        {delta && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-bold',
              trend === 'down' ? 'text-destructive' : 'text-success',
            )}
          >
            {trend === 'down' ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-2xl font-extrabold leading-none lg:text-3xl">{value}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
      {spark && <div className="mt-3">{spark}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mini-graphe en barres (SVG, SSR-safe)                               */
/* ------------------------------------------------------------------ */
export function SparkBars({
  data,
  labels,
  className,
  color = 'var(--brand)',
  height = 64,
}: {
  data: number[]
  labels?: string[]
  className?: string
  color?: string
  height?: number
}) {
  const max = Math.max(...data, 1)
  const n = data.length
  const gap = 6
  const bw = (100 - gap * (n - 1)) / n
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((v, i) => {
          const h = (v / max) * 96
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={100 - h}
              width={bw}
              height={h}
              rx={2.5}
              fill={color}
              opacity={i === n - 1 ? 1 : 0.45}
            />
          )
        })}
      </svg>
      {labels && (
        <div className="mt-1.5 flex justify-between text-[10px] font-medium text-muted-foreground">
          {labels.map((l) => (
            <span key={l} className="flex-1 text-center">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mini-graphe d'aire (SVG, SSR-safe) — pour tendances                 */
/* ------------------------------------------------------------------ */
export function SparkArea({
  data,
  className,
  color = 'var(--brand)',
  height = 56,
}: {
  data: number[]
  className?: string
  color?: string
  height?: number
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const span = max - min || 1
  const n = data.length
  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * 100
    const y = 100 - ((v - min) / span) * 92 - 4
    return [x, y] as const
  })
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `0,100 ${line} 100,100`
  const gid = `sa-${Math.round(data.reduce((a, b) => a + b, 0))}-${n}`
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn('w-full', className)} style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
