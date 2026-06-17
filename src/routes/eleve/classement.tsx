import { createFileRoute } from '@tanstack/react-router'
import {
  Crown,
  Award,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { PageHero } from '@/components/blocks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { leaderboard, type LeaderRow } from '@/lib/mock'

export const Route = createFileRoute('/eleve/classement')({
  component: ClassementPage,
})

/** Tendance → icône + libellé (jamais la couleur seule). */
function Trend({ trend }: { trend: LeaderRow['trend'] }) {
  if (trend === 'up')
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-success">
        <TrendingUp className="size-3.5" /> En hausse
      </span>
    )
  if (trend === 'down')
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-destructive">
        <TrendingDown className="size-3.5" /> En baisse
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
      <Minus className="size-3.5" /> Stable
    </span>
  )
}

/** Un emplacement du podium (top 3). */
function PodiumSpot({ row, place }: { row: LeaderRow; place: 1 | 2 | 3 }) {
  const config = {
    1: {
      height: 'h-32 sm:h-40',
      pedestal: 'bg-gradient-to-b from-amber to-amber/70',
      ring: 'ring-amber',
      Icon: Crown,
      iconClass: 'text-amber',
      badge: 'bg-amber text-amber-foreground',
      avatar: 'size-16 text-3xl',
      order: 'order-2',
    },
    2: {
      height: 'h-24 sm:h-28',
      pedestal: 'bg-gradient-to-b from-slate-300 to-slate-300/60',
      ring: 'ring-slate-300',
      Icon: Award,
      iconClass: 'text-slate-400',
      badge: 'bg-slate-300 text-slate-700',
      avatar: 'size-14 text-2xl',
      order: 'order-1',
    },
    3: {
      height: 'h-20 sm:h-24',
      pedestal: 'bg-gradient-to-b from-amber-700/60 to-amber-700/30',
      ring: 'ring-amber-700/50',
      Icon: Award,
      iconClass: 'text-amber-700',
      badge: 'bg-amber-700/80 text-white',
      avatar: 'size-14 text-2xl',
      order: 'order-3',
    },
  }[place]
  const { Icon } = config
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-end', config.order)}>
      <Icon className={cn('mb-1.5 size-6', config.iconClass)} />
      <div className="relative">
        <span
          className={cn(
            'grid place-items-center rounded-full bg-card shadow-soft ring-4',
            config.avatar,
            config.ring,
          )}
        >
          {row.avatar}
        </span>
        <span
          className={cn(
            'absolute -bottom-1.5 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full font-heading text-xs font-extrabold shadow-sm',
            config.badge,
          )}
        >
          {place}
        </span>
      </div>
      <p className="mt-3 max-w-full truncate px-1 text-sm font-bold">{row.pseudo}</p>
      <p className="text-xs font-semibold tabular-nums text-muted-foreground">
        {row.points} pts
      </p>
      <div
        className={cn(
          'mt-2 w-full rounded-t-2xl shadow-inner',
          config.height,
          config.pedestal,
        )}
      />
    </div>
  )
}

function ClassementPage() {
  const me = leaderboard.find((r) => r.me) ?? leaderboard[leaderboard.length - 1]
  const top3 = leaderboard.slice(0, 3)
  const podium = {
    1: top3.find((r) => r.rank === 1)!,
    2: top3.find((r) => r.rank === 2)!,
    3: top3.find((r) => r.rank === 3)!,
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1100px]">
      <PageHero
        variant="surface"
        eyebrow="Gamification"
        title="Classement"
        subtitle="Affronte tes camarades et grimpe dans le tableau cette semaine."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select defaultValue="week">
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="a">
              <SelectTrigger className="w-[130px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Groupe A</SelectItem>
                <SelectItem value="b">Groupe B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Podium top 3 */}
      <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-amber-soft via-card to-brand-soft/40 p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-center gap-2">
          <Trophy className="size-5 text-amber" />
          <h2 className="font-heading text-lg font-extrabold">Le podium de la semaine</h2>
        </div>
        <div className="flex items-end justify-center gap-3 sm:gap-5">
          <PodiumSpot row={podium[2]} place={2} />
          <PodiumSpot row={podium[1]} place={1} />
          <PodiumSpot row={podium[3]} place={3} />
        </div>
      </Card>

      {/* Ta position */}
      <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-r from-brand to-indigo-600 p-5 text-white shadow-brand-glow">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl">
            {me.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Ta position
            </p>
            <p className="font-heading text-2xl font-extrabold leading-tight">
              {me.pseudo} <span className="text-base font-medium text-white/70">(toi)</span>
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/80">
              {me.trend === 'up' ? (
                <>
                  <TrendingUp className="size-4" /> En progression cette semaine
                </>
              ) : me.trend === 'down' ? (
                <>
                  <TrendingDown className="size-4" /> En baisse cette semaine
                </>
              ) : (
                <>
                  <Minus className="size-4" /> Stable cette semaine
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="font-heading text-3xl font-extrabold leading-none tabular-nums">
              #{me.rank}
            </span>
            <span className="mt-1 rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-bold tabular-nums">
              {me.points} pts
            </span>
          </div>
        </div>
      </Card>

      {/* Liste complète */}
      <Card className="gap-0 p-4 shadow-soft sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-bold">Classement complet</h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {leaderboard.length} joueurs
          </span>
        </div>
        <ul className="space-y-1.5">
          {leaderboard.map((row) => (
            <li
              key={row.rank}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 transition',
                row.me
                  ? 'bg-brand-soft ring-1 ring-brand/20'
                  : 'card-hover bg-card',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-lg font-heading text-sm font-extrabold tabular-nums',
                  row.rank <= 3
                    ? 'bg-amber-soft text-amber-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {row.rank}
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                {row.avatar}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {row.pseudo}
                {row.me && <span className="font-medium text-brand/70"> (toi)</span>}
              </span>
              <Trend trend={row.trend} />
              <span className="w-16 shrink-0 text-right text-sm font-extrabold tabular-nums">
                {row.points}
                <span className="ml-0.5 text-xs font-medium text-muted-foreground">pts</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <RotateCcw className="size-3.5 text-brand" />
          Le classement se réinitialise chaque lundi.
        </p>
      </Card>
    </div>
  )
}
