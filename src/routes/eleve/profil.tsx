import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Flame,
  Trophy,
  Zap,
  Link2,
  Users,
  Crown,
  Award,
  ChevronRight,
  LogOut,
  Smile,
  Copy,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon, SUBJECT_COLOR } from '@/components/student/parts'
import { spreadAvatar } from '@/lib/avatar'
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
import { PageHero } from '@/components/blocks'
import { Input } from '@/components/ui/input'
import { useStudentMe, useStudentSkills, useJoinGroup } from '@/hooks/use-student'
import { useWeeklyLeaderboard } from '@/hooks/use-gamification'
import { useSubjects } from '@/hooks/use-catalog'
import { useAuth } from '@/lib/auth'
import { authService } from '@/services/auth'
import type { MeterColor } from '@/components/student/parts'

export const Route = createFileRoute('/eleve/profil')({
  component: ProfilPage,
})

/** Compétence par matière prête pour le rendu (libellés/couleurs résolus). */
type MasteryView = {
  subject: string
  label: string
  colorHex: string
  meterColor: Exclude<MeterColor, 'auto'>
  mastery: number
  themes: { key: string; label: string; mastery: number }[]
}

function ProfilPage() {
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilterValue>('all')
  const { data: me } = useStudentMe()
  const { data: skills = [] } = useStudentSkills()
  const { data: weekly = [] } = useWeeklyLeaderboard()
  const { data: subjects = [] } = useSubjects()
  const { signOut } = useAuth()

  const codeMutation = useMutation({ mutationFn: () => authService.issueParentCode() })
  const joinGroup = useJoinGroup()
  const [groupCodeInput, setGroupCodeInput] = useState('')

  function submitJoinGroup() {
    const code = groupCodeInput.trim()
    if (!code) return
    joinGroup.mutate(code, {
      onSuccess: (r) =>
        toast.success(r.alreadyMember ? `Tu es déjà dans « ${r.groupName} »` : `Tu as rejoint « ${r.groupName} » 🎉`),
      onError: () => toast.error('Code de groupe invalide.'),
    })
    setGroupCodeInput('')
  }

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const mastery: MasteryView[] = skills.map((sk) => {
    const code = subjectById.get(sk.subjectId)?.code ?? sk.subjectId
    return {
      subject: code,
      label: sk.subjectName,
      colorHex: sk.color ?? 'var(--brand)',
      meterColor: SUBJECT_COLOR[code] ?? 'brand',
      mastery: sk.mastery,
      themes: sk.themes.map((t) => ({ key: t.themeId, label: t.name, mastery: t.mastery })),
    }
  })
  const visibleMastery =
    subjectFilter === 'all' ? mastery : mastery.filter((sm) => sm.subject === subjectFilter)

  const avatar = spreadAvatar(me?.avatar, me?.pseudo ?? '')
  const pseudo = me?.pseudo ?? '…'
  const level = me?.level ?? 1
  const streak = me?.streak ?? 0
  const xp = me?.xp ?? 0
  const rank = me?.weekRank ?? null
  const rankTotal = weekly.length

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      {/* En-tête */}
      <PageHero
        variant="surface"
        eyebrow="Espace élève"
        title={
          <span className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-3xl">
              {avatar}
            </span>
            {pseudo}
          </span>
        }
        subtitle="Suis ta progression, tes compétences et tes récompenses."
        actions={
          <>
            <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber-foreground">
              Niv. {level}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber-foreground">
              <Flame className="size-3.5 text-amber" /> {streak} jours
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
        <StatCard icon={<Zap className="size-5 text-violet" />} value={`${xp}`} label="XP total" />
        <StatCard
          icon={<Trophy className="size-5 text-amber" />}
          value={rank ? `${rank}ᵉ` : '—'}
          label={rankTotal ? `/ ${rankTotal}` : 'cette semaine'}
        />
        <StatCard
          icon={<Flame className="size-5 text-amber" />}
          value={`${streak}`}
          label="jours"
        />
      </div>

      {/* Compétences — par matière */}
      <Card className="p-4 shadow-soft">
        <SectionHeader title="Mes compétences" />
        <SubjectFilter value={subjectFilter} onChange={setSubjectFilter} className="mb-4" />
        {visibleMastery.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Joue et fais tes devoirs pour révéler tes compétences.
          </p>
        ) : (
        <div className="space-y-5">
          {visibleMastery.map((sm) => (
              <div key={sm.subject}>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: sm.colorHex }}
                    />
                    {sm.label}
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
                      <Meter value={t.mastery} color={sm.meterColor} />
                      <span className="w-9 shrink-0 text-right text-sm font-bold tabular-nums">
                        {t.mastery}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
          ))}
        </div>
        )}
      </Card>
      </div>

      {/* Colonne droite : badges/abonnement + code parent + paramètres */}
      <div className="space-y-5 xl:col-span-1">
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
        <Dialog onOpenChange={(open) => { if (open && !codeMutation.data) codeMutation.mutate() }}>
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
            <button
              type="button"
              onClick={() => {
                if (codeMutation.data) {
                  navigator.clipboard?.writeText(codeMutation.data.code)
                  toast.success('Code copié')
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-soft py-6"
            >
              <span className="font-heading text-3xl font-extrabold tracking-widest text-brand">
                {codeMutation.isPending ? '…' : codeMutation.isError ? 'Erreur' : (codeMutation.data?.code ?? '…')}
              </span>
              <Copy className="size-5 text-brand/70" />
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Ce code expire dans 1 heure.
            </p>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Rejoindre un groupe (code prof) */}
      <Card className="flex-row items-center gap-3 p-4 shadow-soft">
        <SoftIcon tone="brand">
          <Users className="size-5" />
        </SoftIcon>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Rejoindre un groupe</p>
          <p className="text-xs text-muted-foreground">
            Saisis le code donné par ton prof pour rejoindre sa classe.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-full">
              Rejoindre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejoindre un groupe</DialogTitle>
              <DialogDescription>
                Entre le code d'invitation (ex. MLC-AB12) communiqué par ton professeur.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input
                value={groupCodeInput}
                onChange={(e) => setGroupCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitJoinGroup()
                }}
                placeholder="MLC-XXXX"
                className="flex-1 text-center font-heading text-lg font-bold tracking-widest"
              />
              <Button onClick={submitJoinGroup} disabled={!groupCodeInput.trim() || joinGroup.isPending}>
                Valider
              </Button>
            </div>
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
          onClick={() => void signOut()}
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
