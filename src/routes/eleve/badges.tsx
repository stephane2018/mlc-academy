import { createFileRoute } from '@tanstack/react-router'
import { Lock, Sparkles } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { PageHero } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { badges, student } from '@/lib/mock'

export const Route = createFileRoute('/eleve/badges')({
  component: BadgesPage,
})

function BadgesPage() {
  const xpPct = Math.round((student.xp / student.xpForNextLevel) * 100)
  const unlocked = badges.filter((b) => b.unlocked)
  const locked = badges.filter((b) => !b.unlocked)

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
              Niveau {student.level}
            </p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl bg-white/15 font-heading text-2xl font-extrabold">
            {student.level}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs font-medium text-white/80">
          <span>{student.xp} XP</span>
          <span>{student.xpForNextLevel} XP — niveau {student.level + 1}</span>
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

function BadgeCard({ badge }: { badge: (typeof badges)[number] }) {
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
        <span className="text-[11px] leading-tight text-muted-foreground">
          {badge.description}
        </span>
      </div>
    )
  }

  return (
    <Card className="items-center gap-2 bg-amber-soft p-4 text-center shadow-sm transition-transform hover:scale-[1.02]">
      <span className="grid size-14 place-items-center rounded-full bg-card text-3xl shadow-sm">
        {badge.emoji}
      </span>
      <span className="text-sm font-bold text-amber-foreground">{badge.name}</span>
      <span className="text-[11px] leading-tight text-amber-foreground/80">
        {badge.description}
      </span>
      <span
        className={cn(
          'mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
          'bg-card text-amber',
        )}
      >
        {badge.tier}
      </span>
    </Card>
  )
}
