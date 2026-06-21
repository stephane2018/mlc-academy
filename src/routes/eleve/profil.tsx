import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Flame,
  Trophy,
  Zap,
  Link2,
  Crown,
  Award,
  ChevronRight,
  LogOut,
  Smile,
  Copy,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon, SUBJECT_COLOR } from '@/components/student/parts'
import {
  SubjectFilter,
  type SubjectFilterValue,
} from '@/components/student/subject-filter'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PageHero, SparkBars } from '@/components/blocks'
import { student, subjectMastery, getSubject, weeklyActivity } from '@/lib/mock'

export const Route = createFileRoute('/eleve/profil')({
  component: ProfilPage,
})

const PARENT_CODE = 'MLC-7K2'

function ProfilPage() {
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilterValue>('all')
  const visibleMastery =
    subjectFilter === 'all'
      ? subjectMastery
      : subjectMastery.filter((sm) => sm.subject === subjectFilter)

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      {/* En-tête */}
      <PageHero
        variant="surface"
        eyebrow="Espace élève"
        title={
          <span className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-3xl">
              {student.avatar}
            </span>
            {student.pseudo}
          </span>
        }
        subtitle="Suis ta progression, tes compétences et tes récompenses."
        actions={
          <>
            <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber-foreground">
              Niv. {student.level}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber-foreground">
              <Flame className="size-3.5 text-amber" /> {student.streak} jours
            </span>
          </>
        }
      />

      {/* Corps : 2 colonnes sur lg, 3 sur xl */}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {/* Colonne gauche : compétences + stats */}
      <div className="space-y-5 xl:col-span-2">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Zap className="size-5 text-violet" />} value={`${student.xp}`} label="XP total" />
        <StatCard
          icon={<Trophy className="size-5 text-amber" />}
          value={`${student.rank}ᵉ`}
          label={`/ ${student.rankTotal}`}
        />
        <StatCard
          icon={<Flame className="size-5 text-amber" />}
          value={`${student.streak}`}
          label="jours"
        />
      </div>

      {/* Compétences — par matière */}
      <Card className="p-4 shadow-soft">
        <SectionHeader title="Mes compétences" />
        <SubjectFilter value={subjectFilter} onChange={setSubjectFilter} className="mb-4" />
        <div className="space-y-5">
          {visibleMastery.map((sm) => {
            const subject = getSubject(sm.subject)
            return (
              <div key={sm.subject}>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-muted-foreground">
                    {sm.mastery}%
                  </span>
                </div>
                <ul className="space-y-3">
                  {sm.themes.map((t) => (
                    <li key={t.key} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-sm font-medium">
                        {t.label}
                      </span>
                      <Meter value={t.mastery} color={SUBJECT_COLOR[sm.subject]} />
                      <span className="w-9 shrink-0 text-right text-sm font-bold tabular-nums">
                        {t.mastery}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Card>
      </div>

      {/* Colonne droite : activité + badges/abonnement + code parent + paramètres */}
      <div className="space-y-5 xl:col-span-1">
      {/* Activité de la semaine */}
      <Card className="p-4 shadow-soft">
        <SectionHeader title="Activité de la semaine" />
        <SparkBars
          data={weeklyActivity.map((d) => d.minutes)}
          labels={weeklyActivity.map((d) => d.label)}
          height={96}
          color="var(--brand)"
        />
        <p className="mt-3 text-center text-xs text-muted-foreground">Minutes par jour</p>
      </Card>

      {/* Lier un parent */}
      <Card className="flex-row items-center gap-3 p-4 shadow-soft">
        <SoftIcon tone="info">
          <Link2 className="size-5" />
        </SoftIcon>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Lier un parent</p>
          <p className="text-xs text-muted-foreground">
            Partage un code pour qu'il suive tes progrès.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-full">
              Générer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Code de liaison parent</DialogTitle>
              <DialogDescription>
                Transmets ce code à ton parent. Il l'entrera dans son espace pour suivre ton
                activité.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-6">
              <span className="font-heading text-3xl font-extrabold tracking-widest text-brand">
                {PARENT_CODE}
              </span>
              <Copy className="size-5 text-brand/70" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Ce code expire dans 24 heures.
            </p>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Liens */}
      <div className="space-y-3">
        <NavRow
          to="/eleve/badges"
          icon={<Award className="size-5 text-amber" />}
          label="Mes badges & niveaux"
        />
        <NavRow
          to="/eleve/abonnement"
          icon={<Crown className="size-5 text-brand" />}
          label="Mon abonnement"
        />
      </div>

      {/* Paramètres */}
      <Card className="gap-0 p-2">
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary"
        >
          <Smile className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Changer d'avatar</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="size-5" />
          <span className="flex-1 text-sm font-medium">Se déconnecter</span>
        </button>
      </Card>
      </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <Card className="items-center gap-1 p-3 text-center shadow-soft">
      {icon}
      <p className="font-heading text-lg font-bold leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  )
}

function NavRow({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link to={to} className="block">
      <Card className="card-hover flex-row items-center gap-3 p-4 shadow-soft">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
          {icon}
        </span>
        <span className="flex-1 text-sm font-semibold">{label}</span>
        <ChevronRight className="size-5 text-muted-foreground" />
      </Card>
    </Link>
  )
}
