import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Users,
  GraduationCap,
  User,
  UserPlus,
  Search,
  Mail,
  CreditCard,
  Bank,
  ShieldCheck,
  Trophy,
  Flame,
  Zap,
  Eye,
  Lock,
  CheckCircle2,
  X,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SectionHeader, SoftIcon, Meter, SKILL_COLOR } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/utilisateurs')({
  component: AdminUtilisateurs,
})

/* ------------------------------------------------------------------ */
/* Types (reflètent la BD : students / teachers / parents / subs)     */
/* ------------------------------------------------------------------ */

type Niveau = 'CE1D' | 'S1' | 'S2' | 'S3'
type SubPlan = 'Découverte' | 'Premium' | 'Famille'
type SubStatus = 'Actif' | 'Essai' | 'Annulé'
type AccountStatus = 'Actif' | 'Suspendu'

type DomainMastery = {
  key: 'nombres' | 'algebre' | 'geometrie' | 'mesures' | 'statistiques'
  label: string
  mastery: number
}

type AdminStudent = {
  id: string
  pseudo: string
  avatar: string
  niveau: Niveau
  group: string
  level: number
  xp: number
  streak: number
  lastActive: string
  plan: SubPlan
  status: AccountStatus
  parentEmail: string | null
  resetEmail: string
  mastery: DomainMastery[]
}

type AdminTeacher = {
  id: string
  fullName: string
  email: string
  status: AccountStatus
  lastSeen: string
  sharedResources: number
  groups: { name: string; level: Niveau; students: number }[]
  recentActivity: { label: string; time: string }[]
}

type LinkedChild = { pseudo: string; avatar: string; niveau: Niveau }

type AdminParent = {
  id: string
  email: string
  status: AccountStatus
  children: LinkedChild[]
  plan: SubPlan
  subStatus: SubStatus
  nextBilling: string
  method: 'Bancontact' | 'Carte'
  payments: { date: string; amount: string; status: 'Payé' | 'À venir' }[]
}

/* ------------------------------------------------------------------ */
/* Données mock inline                                                 */
/* ------------------------------------------------------------------ */

const KPI = {
  students: 42,
  teachers: 3,
  parents: 28,
  active: 38,
}

function mastery(n: number, a: number, g: number, m: number, s: number): DomainMastery[] {
  return [
    { key: 'nombres', label: 'Nombres', mastery: n },
    { key: 'algebre', label: 'Algèbre', mastery: a },
    { key: 'geometrie', label: 'Géométrie', mastery: g },
    { key: 'mesures', label: 'Mesures', mastery: m },
    { key: 'statistiques', label: 'Statistiques', mastery: s },
  ]
}

const students: AdminStudent[] = [
  { id: 'st1', pseudo: 'MaxLeBg', avatar: '🤖', niveau: 'CE1D', group: 'Groupe A', level: 7, xp: 1240, streak: 12, lastActive: 'il y a 2 h', plan: 'Premium', status: 'Actif', parentEmail: 'famille.bauwens@mail.be', resetEmail: 'max@famille.be', mastery: mastery(82, 64, 45, 71, 38) },
  { id: 'st2', pseudo: 'Léa_2012', avatar: '🦊', niveau: 'CE1D', group: 'Groupe A', level: 9, xp: 1980, streak: 21, lastActive: 'il y a 1 j', plan: 'Famille', status: 'Actif', parentEmail: 'parent.dubois@mail.be', resetEmail: 'lea@dubois.be', mastery: mastery(88, 72, 60, 80, 55) },
  { id: 'st3', pseudo: 'NoaMath', avatar: '🚀', niveau: 'CE1D', group: 'Groupe A', level: 5, xp: 820, streak: 0, lastActive: 'il y a 4 j', plan: 'Premium', status: 'Actif', parentEmail: 'noa.parent@mail.be', resetEmail: 'noa@mail.be', mastery: mastery(58, 40, 35, 50, 30) },
  { id: 'st4', pseudo: 'Zoé★', avatar: '🐱', niveau: 'S1', group: 'Tronc Commun S1', level: 6, xp: 1080, streak: 6, lastActive: 'il y a 3 h', plan: 'Découverte', status: 'Actif', parentEmail: null, resetEmail: 'zoe@mail.be', mastery: mastery(70, 55, 48, 62, 44) },
  { id: 'st5', pseudo: 'TomTom', avatar: '🐼', niveau: 'CE1D', group: 'Groupe A', level: 10, xp: 2140, streak: 30, lastActive: "à l'instant", plan: 'Premium', status: 'Actif', parentEmail: 'tom.parent@mail.be', resetEmail: 'tom@mail.be', mastery: mastery(90, 84, 78, 88, 72) },
  { id: 'st6', pseudo: 'Inès.M', avatar: '🐧', niveau: 'S2', group: 'Tronc Commun S2', level: 4, xp: 640, streak: 2, lastActive: 'il y a 6 j', plan: 'Premium', status: 'Suspendu', parentEmail: 'ines.parent@mail.be', resetEmail: 'ines@mail.be', mastery: mastery(48, 38, 30, 42, 28) },
  { id: 'st7', pseudo: 'Sacha', avatar: '🦁', niveau: 'S3', group: 'Tronc Commun S3', level: 8, xp: 1520, streak: 9, lastActive: 'il y a 1 j', plan: 'Famille', status: 'Actif', parentEmail: 'parent.dubois@mail.be', resetEmail: 'sacha@dubois.be', mastery: mastery(80, 68, 64, 75, 58) },
  { id: 'st8', pseudo: 'Hugo', avatar: '🐸', niveau: 'CE1D', group: 'Groupe B', level: 5, xp: 870, streak: 1, lastActive: 'il y a 5 j', plan: 'Découverte', status: 'Actif', parentEmail: null, resetEmail: 'hugo@mail.be', mastery: mastery(55, 42, 40, 52, 35) },
]

const teachers: AdminTeacher[] = [
  {
    id: 'te1', fullName: 'M. Minko', email: 'minko@mlc-academy.be', status: 'Actif', lastSeen: 'il y a 1 h', sharedResources: 12,
    groups: [
      { name: 'Groupe A', level: 'CE1D', students: 8 },
      { name: 'Groupe B', level: 'CE1D', students: 6 },
      { name: 'Tronc Commun S1', level: 'S1', students: 5 },
    ],
    recentActivity: [
      { label: 'Correction « Les fractions » publiée', time: 'il y a 2 h' },
      { label: 'Séance live Groupe A animée', time: 'hier' },
      { label: 'Nouvel examen blanc créé', time: 'il y a 3 j' },
    ],
  },
  {
    id: 'te2', fullName: 'Mme Lambert', email: 'lambert@mlc-academy.be', status: 'Actif', lastSeen: 'il y a 5 h', sharedResources: 7,
    groups: [
      { name: 'Tronc Commun S2', level: 'S2', students: 7 },
      { name: 'Tronc Commun S3', level: 'S3', students: 4 },
    ],
    recentActivity: [
      { label: 'Devoir « Statistiques » assigné', time: 'il y a 5 h' },
      { label: 'Fiche méthode partagée', time: 'il y a 2 j' },
    ],
  },
  {
    id: 'te3', fullName: 'M. Okonkwo', email: 'okonkwo@mlc-academy.be', status: 'Suspendu', lastSeen: 'il y a 12 j', sharedResources: 3,
    groups: [{ name: 'Groupe C', level: 'CE1D', students: 5 }],
    recentActivity: [{ label: 'Dernière connexion', time: 'il y a 12 j' }],
  },
]

const parents: AdminParent[] = [
  {
    id: 'pa1', email: 'famille.bauwens@mail.be', status: 'Actif',
    children: [{ pseudo: 'MaxLeBg', avatar: '🤖', niveau: 'CE1D' }],
    plan: 'Premium', subStatus: 'Actif', nextBilling: '12 juil. 2026', method: 'Bancontact',
    payments: [
      { date: '12 juin 2026', amount: '9,90 €', status: 'Payé' },
      { date: '12 mai 2026', amount: '9,90 €', status: 'Payé' },
      { date: '12 juil. 2026', amount: '9,90 €', status: 'À venir' },
    ],
  },
  {
    id: 'pa2', email: 'parent.dubois@mail.be', status: 'Actif',
    children: [
      { pseudo: 'Léa_2012', avatar: '🦊', niveau: 'CE1D' },
      { pseudo: 'Sacha', avatar: '🦁', niveau: 'S3' },
    ],
    plan: 'Famille', subStatus: 'Actif', nextBilling: '3 juil. 2026', method: 'Carte',
    payments: [
      { date: '3 juin 2026', amount: '14,90 €', status: 'Payé' },
      { date: '3 mai 2026', amount: '14,90 €', status: 'Payé' },
      { date: '3 juil. 2026', amount: '14,90 €', status: 'À venir' },
    ],
  },
  {
    id: 'pa3', email: 'noa.parent@mail.be', status: 'Actif',
    children: [{ pseudo: 'NoaMath', avatar: '🚀', niveau: 'CE1D' }],
    plan: 'Premium', subStatus: 'Essai', nextBilling: '24 juin 2026', method: 'Carte',
    payments: [{ date: '24 juin 2026', amount: '0,00 €', status: 'À venir' }],
  },
  {
    id: 'pa4', email: 'tom.parent@mail.be', status: 'Actif',
    children: [{ pseudo: 'TomTom', avatar: '🐼', niveau: 'CE1D' }],
    plan: 'Premium', subStatus: 'Actif', nextBilling: '8 juil. 2026', method: 'Bancontact',
    payments: [
      { date: '8 juin 2026', amount: '9,90 €', status: 'Payé' },
      { date: '8 mai 2026', amount: '9,90 €', status: 'Payé' },
    ],
  },
  {
    id: 'pa5', email: 'ines.parent@mail.be', status: 'Suspendu',
    children: [{ pseudo: 'Inès.M', avatar: '🐧', niveau: 'S2' }],
    plan: 'Premium', subStatus: 'Annulé', nextBilling: '—', method: 'Carte',
    payments: [
      { date: '4 avr. 2026', amount: '9,90 €', status: 'Payé' },
      { date: '4 mai 2026', amount: '9,90 €', status: 'Payé' },
    ],
  },
]

const niveauOptions: Niveau[] = ['CE1D', 'S1', 'S2', 'S3']
const groupOptions = ['Groupe A', 'Groupe B', 'Groupe C', 'Tronc Commun S1', 'Tronc Commun S2', 'Tronc Commun S3']
const planOptions: SubPlan[] = ['Découverte', 'Premium', 'Famille']

/* ------------------------------------------------------------------ */
/* Petits composants visuels                                          */
/* ------------------------------------------------------------------ */

function NiveauBadge({ niveau }: { niveau: Niveau }) {
  const tones: Record<Niveau, string> = {
    CE1D: 'bg-brand-soft text-brand',
    S1: 'bg-info-soft text-info',
    S2: 'bg-violet-soft text-violet',
    S3: 'bg-teal-soft text-teal',
  }
  return <Badge className={tones[niveau]}>{niveau}</Badge>
}

function PlanBadge({ plan }: { plan: SubPlan }) {
  if (plan === 'Premium') return <Badge className="bg-brand-soft text-brand">Premium</Badge>
  if (plan === 'Famille') return <Badge className="bg-violet-soft text-violet">Famille</Badge>
  return <Badge variant="outline">Découverte</Badge>
}

function SubStatusBadge({ status }: { status: SubStatus }) {
  if (status === 'Actif') return <Badge className="bg-success-soft text-success">Actif</Badge>
  if (status === 'Essai') return <Badge className="bg-info-soft text-info">Essai</Badge>
  return <Badge className="bg-destructive/10 text-destructive">Annulé</Badge>
}

function AccountStatusBadge({ status }: { status: AccountStatus }) {
  if (status === 'Actif') return <Badge className="bg-success-soft text-success">Actif</Badge>
  return <Badge className="bg-amber-soft text-amber-foreground">Suspendu</Badge>
}

function Avatar({ emoji }: { emoji: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-lg">{emoji}</span>
  )
}

function MiniStat({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof Trophy
  tone: 'brand' | 'amber' | 'teal'
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
      <SoftIcon tone={tone} className="mx-auto size-8">
        <Icon className="size-4" />
      </SoftIcon>
      <p className="mt-1.5 font-heading text-lg font-extrabold leading-none">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8"
      />
    </div>
  )
}

function ResultCount({ count }: { count: number }) {
  return (
    <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
      {count} {count > 1 ? 'résultats' : 'résultat'}
    </span>
  )
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
      <div className="overflow-x-auto">{children}</div>
    </Card>
  )
}

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

/* ------------------------------------------------------------------ */
/* Onglet Élèves                                                       */
/* ------------------------------------------------------------------ */

function StudentsTab() {
  const [list, setList] = useState<AdminStudent[]>(students)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | Niveau>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      list.filter(
        (s) =>
          (filter === 'all' || s.niveau === filter) &&
          s.pseudo.toLowerCase().includes(query.toLowerCase().trim()),
      ),
    [list, query, filter],
  )

  const selected = list.find((s) => s.id === openId) ?? null

  const toggleStatus = (id: string) =>
    setList((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Suspendu' ? 'Actif' : 'Suspendu' } : s,
      ),
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un pseudo…" />
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | Niveau)}>
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {niveauOptions.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ResultCount count={rows.length} />
        </div>
      </div>

      <TableCard>
        <table className="w-full min-w-[940px] text-sm">
          <thead>
            <tr className={THEAD}>
              <th className={TH}>Élève</th>
              <th className={TH}>Niveau</th>
              <th className={TH}>Groupe</th>
              <th className={TH}>Niveau de jeu</th>
              <th className={cn(TH, 'text-right')}>XP</th>
              <th className={TH}>Dernière activité</th>
              <th className={TH}>Abonnement</th>
              <th className={TH}>Statut</th>
              <th className={cn(TH, 'text-right')}>Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((s) => (
              <tr
                key={s.id}
                onClick={() => setOpenId(s.id)}
                className="cursor-pointer transition-colors hover:bg-secondary/40"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar emoji={s.avatar} />
                    <span className="font-medium">{s.pseudo}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <NiveauBadge niveau={s.niveau} />
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.group}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline">Lvl {s.level}</Badge>
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{s.xp.toLocaleString('fr-FR')}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.lastActive}</td>
                <td className="px-5 py-3">
                  <PlanBadge plan={s.plan} />
                </td>
                <td className="px-5 py-3">
                  <AccountStatusBadge status={s.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Voir la fiche"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenId(s.id)
                    }}
                  >
                    <Eye />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                  Aucun élève ne correspond à ta recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>

      <StudentSheet
        student={selected}
        onClose={() => setOpenId(null)}
        onToggleStatus={toggleStatus}
      />
    </div>
  )
}

function StudentSheet({
  student,
  onClose,
  onToggleStatus,
}: {
  student: AdminStudent | null
  onClose: () => void
  onToggleStatus: (id: string) => void
}) {
  const [resetSent, setResetSent] = useState(false)

  return (
    <Sheet
      open={!!student}
      onOpenChange={(o) => {
        if (!o) {
          setResetSent(false)
          onClose()
        }
      }}
    >
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {student && (
          <>
            <SheetHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-secondary text-2xl">
                  {student.avatar}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="text-lg">{student.pseudo}</SheetTitle>
                  <SheetDescription className="flex items-center gap-2">
                    <NiveauBadge niveau={student.niveau} />
                    <span>{student.group}</span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-5 p-4">
              <div className="grid grid-cols-3 gap-2">
                <MiniStat icon={Trophy} tone="brand" value={`Lvl ${student.level}`} label="Niveau" />
                <MiniStat icon={Zap} tone="amber" value={student.xp.toLocaleString('fr-FR')} label="XP" />
                <MiniStat icon={Flame} tone="teal" value={`${student.streak} j`} label="Série" />
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-muted-foreground">Parent lié</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail className="size-4 text-muted-foreground" />
                    {student.parentEmail ?? 'Aucun'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-muted-foreground">Abonnement</span>
                  <PlanBadge plan={student.plan} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-muted-foreground">Statut du compte</span>
                  <AccountStatusBadge status={student.status} />
                </div>
              </div>

              <div>
                <SectionHeader title="Maîtrise par domaine" />
                <div className="space-y-3">
                  {student.mastery.map((d) => (
                    <div key={d.key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium">{d.label}</span>
                        <span className="tabular-nums text-muted-foreground">{d.mastery} %</span>
                      </div>
                      <Meter value={d.mastery} color={SKILL_COLOR[d.key]} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-9 justify-center"
                  disabled={resetSent}
                  onClick={() => setResetSent(true)}
                >
                  {resetSent ? (
                    <>
                      <CheckCircle2 className="size-4 text-success" />
                      Lien envoyé
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      Réinitialiser le mot de passe
                    </>
                  )}
                </Button>
                {student.status === 'Suspendu' ? (
                  <Button
                    variant="outline"
                    className="h-9 justify-center"
                    onClick={() => onToggleStatus(student.id)}
                  >
                    <CheckCircle2 className="size-4" />
                    Réactiver
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="h-9 justify-center"
                    onClick={() => onToggleStatus(student.id)}
                  >
                    <X className="size-4" />
                    Suspendre
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Onglet Profs                                                        */
/* ------------------------------------------------------------------ */

function TeachersTab() {
  const [list, setList] = useState<AdminTeacher[]>(teachers)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | string>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      list.filter(
        (t) =>
          (filter === 'all' || t.groups.some((g) => g.name === filter)) &&
          (t.fullName.toLowerCase().includes(query.toLowerCase().trim()) ||
            t.email.toLowerCase().includes(query.toLowerCase().trim())),
      ),
    [list, query, filter],
  )

  const selected = list.find((t) => t.id === openId) ?? null

  const toggleStatus = (id: string) =>
    setList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Suspendu' ? 'Actif' : 'Suspendu' } : t,
      ),
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un nom ou e-mail…" />
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-full sm:w-52">
              <SelectValue placeholder="Groupe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              {groupOptions.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ResultCount count={rows.length} />
        </div>
      </div>

      <TableCard>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className={THEAD}>
              <th className={TH}>Enseignant</th>
              <th className={TH}>E-mail</th>
              <th className={cn(TH, 'text-right')}>Groupes</th>
              <th className={cn(TH, 'text-right')}>Élèves</th>
              <th className={TH}>Dernière connexion</th>
              <th className={TH}>Statut</th>
              <th className={cn(TH, 'text-right')}>Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((t) => {
              const totalStudents = t.groups.reduce((a, g) => a + g.students, 0)
              return (
                <tr
                  key={t.id}
                  onClick={() => setOpenId(t.id)}
                  className="cursor-pointer transition-colors hover:bg-secondary/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <SoftIcon tone="brand" className="size-8">
                        <GraduationCap className="size-4" />
                      </SoftIcon>
                      <span className="font-medium">{t.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{t.email}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{t.groups.length}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{totalStudents}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.lastSeen}</td>
                  <td className="px-5 py-3">
                    <AccountStatusBadge status={t.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Voir la fiche"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenId(t.id)
                      }}
                    >
                      <Eye />
                    </Button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                  Aucun enseignant ne correspond à ta recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>

      <TeacherSheet
        teacher={selected}
        onClose={() => setOpenId(null)}
        onToggleStatus={toggleStatus}
      />
    </div>
  )
}

function TeacherSheet({
  teacher,
  onClose,
  onToggleStatus,
}: {
  teacher: AdminTeacher | null
  onClose: () => void
  onToggleStatus: (id: string) => void
}) {
  return (
    <Sheet open={!!teacher} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {teacher && (
          <>
            <SheetHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <SoftIcon tone="brand" className="size-12">
                  <GraduationCap className="size-5" />
                </SoftIcon>
                <div className="min-w-0">
                  <SheetTitle className="text-lg">{teacher.fullName}</SheetTitle>
                  <SheetDescription className="flex items-center gap-1.5">
                    <Mail className="size-4" />
                    {teacher.email}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-5 p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-muted-foreground">Statut</span>
                  <AccountStatusBadge status={teacher.status} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-muted-foreground">Ressources</span>
                  <span className="font-semibold tabular-nums">{teacher.sharedResources}</span>
                </div>
              </div>

              <div>
                <SectionHeader title="Ses groupes" />
                <div className="space-y-2">
                  {teacher.groups.map((g) => (
                    <div
                      key={g.name}
                      className="flex items-center justify-between rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <span className="font-medium">{g.name}</span>
                        <NiveauBadge niveau={g.level} />
                      </div>
                      <span className="text-sm text-muted-foreground">{g.students} élèves</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionHeader title="Activité récente" />
                <ul className="space-y-2">
                  {teacher.recentActivity.map((a) => (
                    <li key={a.label} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      <span className="flex-1">{a.label}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {teacher.status === 'Suspendu' ? (
                <Button
                  variant="outline"
                  className="h-9 w-full justify-center"
                  onClick={() => onToggleStatus(teacher.id)}
                >
                  <CheckCircle2 className="size-4" />
                  Réactiver le compte
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="h-9 w-full justify-center"
                  onClick={() => onToggleStatus(teacher.id)}
                >
                  <X className="size-4" />
                  Suspendre le compte
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Onglet Parents                                                      */
/* ------------------------------------------------------------------ */

function StackedAvatars({ children }: { children: LinkedChild[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {children.map((c) => (
          <span
            key={c.pseudo}
            className="grid size-7 place-items-center rounded-full bg-secondary text-sm ring-2 ring-card"
          >
            {c.avatar}
          </span>
        ))}
      </div>
      <span className="truncate text-muted-foreground">{children.map((c) => c.pseudo).join(', ')}</span>
    </div>
  )
}

function ParentsTab() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | SubPlan>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      parents.filter(
        (p) =>
          (filter === 'all' || p.plan === filter) &&
          (p.email.toLowerCase().includes(query.toLowerCase().trim()) ||
            p.children.some((c) => c.pseudo.toLowerCase().includes(query.toLowerCase().trim()))),
      ),
    [query, filter],
  )

  const selected = parents.find((p) => p.id === openId) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un e-mail ou enfant…" />
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | SubPlan)}>
            <SelectTrigger className="h-9 w-full sm:w-48">
              <SelectValue placeholder="Abonnement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les abonnements</SelectItem>
              {planOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ResultCount count={rows.length} />
        </div>
      </div>

      <TableCard>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className={THEAD}>
              <th className={TH}>E-mail</th>
              <th className={TH}>Enfants liés</th>
              <th className={TH}>Abonnement</th>
              <th className={TH}>Statut</th>
              <th className={cn(TH, 'text-right')}>Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className="cursor-pointer transition-colors hover:bg-secondary/40"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="size-4 text-muted-foreground" />
                    {p.email}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <StackedAvatars children={p.children} />
                </td>
                <td className="px-5 py-3">
                  <PlanBadge plan={p.plan} />
                </td>
                <td className="px-5 py-3">
                  <AccountStatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Voir la fiche"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenId(p.id)
                    }}
                  >
                    <Eye />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                  Aucun parent ne correspond à ta recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>

      <ParentSheet parent={selected} onClose={() => setOpenId(null)} />
    </div>
  )
}

function ParentSheet({ parent, onClose }: { parent: AdminParent | null; onClose: () => void }) {
  return (
    <Sheet open={!!parent} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {parent && (
          <>
            <SheetHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <SoftIcon tone="violet" className="size-12">
                  <User className="size-5" />
                </SoftIcon>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-lg">{parent.email}</SheetTitle>
                  <SheetDescription>Compte parent</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-5 p-4">
              <div>
                <SectionHeader title="Enfants liés" />
                <div className="space-y-2">
                  {parent.children.map((c) => (
                    <div
                      key={c.pseudo}
                      className="flex items-center justify-between rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar emoji={c.avatar} />
                        <span className="font-medium">{c.pseudo}</span>
                      </div>
                      <NiveauBadge niveau={c.niveau} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionHeader title="Abonnement" />
                <div className="space-y-2 rounded-2xl border border-border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Formule</span>
                    <PlanBadge plan={parent.plan} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <SubStatusBadge status={parent.subStatus} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Prochaine échéance</span>
                    <span className="font-medium tabular-nums">{parent.nextBilling}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Méthode</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      {parent.method === 'Bancontact' ? (
                        <Bank className="size-4 text-muted-foreground" />
                      ) : (
                        <CreditCard className="size-4 text-muted-foreground" />
                      )}
                      {parent.method}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <SectionHeader title="Historique des paiements" />
                <ul className="divide-y divide-border rounded-2xl border border-border">
                  {parent.payments.map((pay, i) => (
                    <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{pay.date}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-semibold tabular-nums">{pay.amount}</span>
                        {pay.status === 'Payé' ? (
                          <Badge className="bg-success-soft text-success">Payé</Badge>
                        ) : (
                          <Badge variant="outline">À venir</Badge>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type UserTab = 'eleves' | 'profs' | 'parents'
const userTabs: { id: UserTab; label: string; icon: typeof Users }[] = [
  { id: 'eleves', label: 'Élèves', icon: Users },
  { id: 'profs', label: 'Profs', icon: GraduationCap },
  { id: 'parents', label: 'Parents', icon: UserPlus },
]

function AdminUtilisateurs() {
  const [tab, setTab] = useState<UserTab>('eleves')
  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
          Gestion des comptes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Élèves, enseignants et parents — recherche, filtres et fiches détaillées.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Users} tone="brand" label="Élèves" value={KPI.students} />
        <StatTile icon={GraduationCap} tone="teal" label="Enseignants" value={KPI.teachers} />
        <StatTile icon={User} tone="info" label="Parents" value={KPI.parents} />
        <StatTile icon={ShieldCheck} tone="success" label="Comptes actifs" value={KPI.active} />
      </div>

      {/* Onglets horizontaux */}
      <div>
        <div className="-mx-1 overflow-x-auto px-1">
          <nav
            role="tablist"
            aria-label="Type de compte"
            className="inline-flex min-w-max items-center gap-1 border-b border-border"
          >
            {userTabs.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-4">
          {tab === 'eleves' && <StudentsTab />}
          {tab === 'profs' && <TeachersTab />}
          {tab === 'parents' && <ParentsTab />}
        </div>
      </div>
    </div>
  )
}
