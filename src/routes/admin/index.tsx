import { createFileRoute } from '@tanstack/react-router'
import {
  Users,
  Boxes,
  Activity,
  MessageSquare,
  Euro,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  FileText,
  Plus,
  CheckSquare,
  Sparkles,
} from '@/components/icons'
import type { LucideIcon } from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/student/parts'
import { RailLayout, StatTile, SparkBars, SparkArea } from '@/components/blocks'
import { adminStats } from '@/lib/mock'

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
})

type Tone = 'brand' | 'teal' | 'amber' | 'success' | 'info'

/* ----- Données de tendance locales (mockées, ~7 points) ----- */
const trendActiveStudents = [34, 36, 35, 38, 39, 40, 42]
const trendWeeklyActivity = [71, 74, 70, 79, 76, 81, 83]
const trendMrr = [980, 1020, 1010, 1080, 1100, 1140, 1180]
const signups = [3, 5, 2, 7, 4, 6, 3]
const signupLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

type ActivityEvent = {
  icon: LucideIcon
  tone: Tone
  text: string
  time: string
}

const recentActivity: ActivityEvent[] = [
  { icon: CheckCircle2, tone: 'success', text: 'NoaMath a terminé un examen blanc (Géométrie)', time: 'il y a 12 min' },
  { icon: UserPlus, tone: 'brand', text: 'Nouveau compte créé : Zoé★', time: 'il y a 38 min' },
  { icon: FileText, tone: 'teal', text: 'Vidéo « Théorème de Pythagore » publiée', time: 'il y a 1 h' },
  { icon: MessageSquare, tone: 'amber', text: 'Nouveau message de support de Léa_2012', time: 'il y a 2 h' },
  { icon: CheckCircle2, tone: 'success', text: 'TomTom a atteint le niveau 8', time: 'il y a 3 h' },
  { icon: UserPlus, tone: 'brand', text: 'Abonnement Premium activé pour MaxLeBg', time: 'il y a 5 h' },
]

type AccountRow = {
  pseudo: string
  avatar: string
  plan: string
  joined: string
}

const recentAccounts: AccountRow[] = [
  { pseudo: 'Zoé★', avatar: '🐱', plan: 'Découverte', joined: "Aujourd'hui" },
  { pseudo: 'NoaMath', avatar: '🚀', plan: 'Premium (essai)', joined: 'Hier' },
  { pseudo: 'MaxLeBg', avatar: '🤖', plan: 'Premium', joined: 'il y a 2 j' },
  { pseudo: 'Inès.M', avatar: '🐧', plan: 'Premium', joined: 'il y a 4 j' },
  { pseudo: 'TomTom', avatar: '🐼', plan: 'Premium', joined: 'il y a 6 j' },
]

function ActivityTimeline() {
  return (
    <ol className="relative space-y-4 pl-5">
      <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {recentActivity.map((event, i) => {
        const Icon = event.icon
        const dot =
          event.tone === 'success'
            ? 'bg-success'
            : event.tone === 'brand'
              ? 'bg-brand'
              : event.tone === 'teal'
                ? 'bg-teal'
                : 'bg-amber'
        return (
          <li key={i} className="relative">
            <span
              className={`absolute -left-5 top-1 size-3.5 rounded-full ring-4 ring-card ${dot}`}
              aria-hidden
            />
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{event.text}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function QuickActions() {
  return (
    <div className="grid gap-2.5">
      <Button className="justify-start" onClick={() => toast.success('Ressource ajoutée (démo)')}>
        <Plus className="size-4" />
        Ajouter une ressource
      </Button>
      <Button
        variant="outline"
        className="justify-start"
        onClick={() => toast.success("Examen blanc créé (démo)")}
      >
        <CheckSquare className="size-4" />
        Créer un examen blanc
      </Button>
      <Button
        variant="secondary"
        className="justify-start"
        onClick={() => toast('Invitation envoyée (démo)')}
      >
        <UserPlus className="size-4" />
        Inviter un élève
      </Button>
    </div>
  )
}

function AdminOverview() {
  const totalSignups = signups.reduce((acc, n) => acc + n, 0)

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      {/* Bandeau d'accueil compact (carte, pas un 2e gros header) */}
      <Card className="flex flex-col gap-3 rounded-2xl border-brand/15 bg-brand-soft/40 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-heading text-base font-bold">Bonjour, l'équipe MLC Academy 👋</p>
            <p className="text-sm text-muted-foreground">
              Voici l'état de la plateforme aujourd'hui — tout roule.
            </p>
          </div>
        </div>
        <Button onClick={() => toast.success('Ressource ajoutée (démo)')}>
          <Plus className="size-4" />
          Ajouter une ressource
        </Button>
      </Card>

      {/* KPI en StatTile avec mini-graphes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatTile
          icon={Users}
          tone="brand"
          label="Élèves actifs"
          value={adminStats.activeStudents}
          delta="+6 cette sem."
          trend="up"
          spark={<SparkBars data={trendActiveStudents} color="var(--brand)" height={40} />}
        />
        <StatTile
          icon={Boxes}
          tone="teal"
          label="Groupes"
          value={adminStats.groups}
          delta="+1 ce mois"
          trend="up"
        />
        <StatTile
          icon={Activity}
          tone="success"
          label="Activité hebdo"
          value={`${adminStats.weeklyActivity}%`}
          delta="+4 pts"
          trend="up"
          spark={<SparkArea data={trendWeeklyActivity} color="var(--success)" height={40} />}
        />
        <StatTile
          icon={MessageSquare}
          tone="amber"
          label="Support en attente"
          value={adminStats.pendingSupport}
          delta="-2 vs hier"
          trend="down"
        />
        <StatTile
          icon={Euro}
          tone="brand"
          label="MRR"
          value={`${adminStats.mrr.toLocaleString('fr-FR')} €`}
          delta="+120 € ce mois"
          trend="up"
          spark={<SparkArea data={trendMrr} color="var(--brand)" height={40} />}
          className="border-brand/30 bg-brand-soft/40 ring-1 ring-brand/15 sm:col-span-2 xl:col-span-1"
        />
      </div>

      <RailLayout
        rail={
          <>
            <Card className="rounded-2xl p-5 shadow-soft">
              <SectionHeader title="Activité récente" />
              <ActivityTimeline />
            </Card>
            <Card className="rounded-2xl p-5 shadow-soft">
              <SectionHeader title="Actions rapides" />
              <QuickActions />
            </Card>
          </>
        }
      >
        {/* Grand graphe inscriptions */}
        <Card className="rounded-2xl p-5 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
                Croissance
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold lg:text-2xl">
                Inscriptions — 7 derniers jours
              </h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
              <TrendingUp className="size-4" />
              {totalSignups} au total
            </span>
          </div>
          <SparkBars
            data={signups}
            labels={signupLabels}
            color="var(--brand)"
            height={200}
            className="mt-5"
          />
        </Card>

        {/* Derniers comptes */}
        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="border-b border-border px-5 py-4">
            <SectionHeader title="Derniers comptes créés" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Élève</th>
                  <th className="px-5 py-3 font-semibold">Formule</th>
                  <th className="px-5 py-3 font-semibold text-right">Inscrit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAccounts.map((acc) => (
                  <tr key={acc.pseudo} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-lg bg-secondary text-lg">
                          {acc.avatar}
                        </span>
                        <span className="font-medium">{acc.pseudo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{acc.plan}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{acc.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </RailLayout>
    </div>
  )
}
