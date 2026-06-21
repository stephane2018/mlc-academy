import { createFileRoute } from '@tanstack/react-router'
import { Lock, Sparkles } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { PageHero } from '@/components/blocks'
import { avatarTint } from '@/components/student/parts'
import { cn } from '@/lib/utils'
import { useBadges } from '@/hooks/use-gamification'
import { useStudentMe } from '@/hooks/use-student'
import type { Badge } from '@/services/gamification'

export const Route = createFileRoute('/eleve/badges')({
  component: BadgesPage,
})

/** Badge enrichi du statut dérivé (unlocked) pour le rendu. */
type BadgeView = Badge & { unlocked: boolean }

function BadgesPage() {
  const { data: badgesData = [], isLoading } = useBadges()
  const { data: me } = useStudentMe()

  const level = me?.level ?? 1
  const xp = me?.xp ?? 0
  const xpForNextLevel = me?.xpForNextLevel ?? null
  const xpPct = xpForNextLevel && xpForNextLevel > 0 ? Math.min(100, Math.round((xp / xpForNextLevel) * 100)) : 100

  const badges: BadgeView[] = badgesData.map((b) => ({ ...b, unlocked: b.unlockedAt !== null }))
  const unlocked = badges.filter((b) => b.unlocked)
  const locked = badges.filter((b) => !b.unlocked)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-sm text-muted-foreground">
        Chargement de tes badges…
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="Récompenses"
        title="Badges & Niveaux"
        subtitle="Débloque des récompenses en progressant dans le jeu."
        actions={
          <span className="flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-bold text-amber-foreground">
            <Sparkles className="size-4 text-amber" />
            {unlocked.length}/{badges.length} débloqués
          </span>
        }
      />

      {/* Niveau + XP */}
      <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-brand to-indigo-500 p-4 text-white shadow-brand-glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
              Niveau actuel
            </p>
            <p className="font-heading text-3xl font-extrabold leading-tight">
              Niveau {level}
            </p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl bg-white/15 font-heading text-2xl font-extrabold">
            {level}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs font-medium text-white/80">
          <span>{xp} XP</span>
          <span>{xpForNextLevel ?? xp} XP — niveau {level + 1}</span>
        </div>
      </Card>

      {/* Débloqués */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold tracking-tight">Débloqués</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {unlocked.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>
      </section>

      {/* Verrouillés */}
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold tracking-tight text-muted-foreground">
          À débloquer
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {locked.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>
      </section>
    </div>
  )
}

function BadgeCard({ badge }: { badge: BadgeView }) {
  if (!badge.unlocked) {
    return (
      <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-center">
        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-card text-locked shadow-sm">
          <Lock className="size-3.5" />
        </span>
        <span className="grid size-14 place-items-center rounded-full bg-secondary text-3xl grayscale opacity-60">
          {badge.emoji}
        </span>
        <span className="text-sm font-semibold text-locked">{badge.name}</span>
        {badge.description && (
          <span className="text-[11px] leading-tight text-muted-foreground">
            {badge.description}
          </span>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'items-center gap-2 p-4 text-center shadow-sm transition-transform hover:scale-[1.02]',
        avatarTint(badge.id),
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-card text-3xl shadow-sm">
        {badge.emoji}
      </span>
      <span className="text-sm font-bold text-foreground">{badge.name}</span>
      {badge.description && (
        <span className="text-[11px] leading-tight text-muted-foreground">
          {badge.description}
        </span>
      )}
      <span className="mt-0.5 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber">
        {badge.tier}
      </span>
    </Card>
  )
}
