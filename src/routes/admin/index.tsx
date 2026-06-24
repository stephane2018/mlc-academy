import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Users,
  Boxes,
  MessageSquare,
  Store,
  GraduationCap,
  Library,
  CircleHelp,
  ArrowRight,
  Loader,
  AlertCircle,
} from '@/components/icons'
import type { IconComponent } from '@/components/icons'
import { AdminPageHeader, KpiCard, Panel, type AdminTone } from '@/components/admin/ui'
import { useManagers, useModerationProducts } from '@/hooks/use-admin'
import { useSupportTickets } from '@/hooks/use-support'
import { useClasses, useSubjects } from '@/hooks/use-catalog'

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
})

/** Valeur d'un KPI selon l'état de la requête (chargement / erreur). */
function KpiValue({ isLoading, isError, value }: { isLoading: boolean; isError: boolean; value: number }) {
  if (isLoading) return <Loader className="size-5 animate-spin text-muted-foreground" />
  if (isError) return <span className="text-destructive">—</span>
  return <>{value}</>
}

/** Lien « Tout voir » en en-tête de panneau. */
function SeeAll({ to }: { to: string }) {
  return (
    <Link to={to} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
      Tout voir
      <ArrowRight className="size-3.5" />
    </Link>
  )
}

/* ------------------------------- Raccourcis ------------------------------- */
type Shortcut = { to: string; icon: IconComponent; tone: AdminTone; label: string; description: string }

const shortcuts: Shortcut[] = [
  { to: '/admin/utilisateurs', icon: Users, tone: 'brand', label: 'Utilisateurs', description: 'Comptes élèves, profs et parents' },
  { to: '/admin/gestionnaires', icon: Boxes, tone: 'teal', label: 'Gestionnaires', description: 'Rôles et permissions' },
  { to: '/admin/marketplace', icon: Store, tone: 'amber', label: 'Marketplace', description: 'Modération des produits' },
  { to: '/admin/support', icon: MessageSquare, tone: 'info', label: 'Support', description: 'Tickets et conversations' },
  { to: '/admin/questions', icon: CircleHelp, tone: 'success', label: 'Questions', description: "Banque d'exercices" },
  { to: '/admin/classes', icon: GraduationCap, tone: 'brand', label: 'Classes', description: 'Référentiel des niveaux' },
  { to: '/admin/matieres', icon: Library, tone: 'teal', label: 'Matières', description: 'Référentiel des matières' },
]

const TINT: Record<AdminTone, string> = {
  brand: 'bg-brand-soft text-brand',
  teal: 'bg-teal-soft text-teal',
  amber: 'bg-amber-soft text-amber-foreground',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  violet: 'bg-violet-soft text-violet',
  destructive: 'bg-destructive/10 text-destructive',
}

function ShortcutsList() {
  return (
    <ul className="divide-y divide-border">
      {shortcuts.map((s) => {
        const Icon = s.icon
        return (
          <li key={s.to}>
            <Link to={s.to} className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/50">
              <span className={`grid size-8 shrink-0 place-items-center rounded-md ${TINT[s.tone]}`}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{s.label}</p>
                <p className="truncate text-xs text-muted-foreground">{s.description}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/* --------------------------- Files (modération/support) --------------------------- */
function QueueState({
  icon: Icon,
  children,
  error,
  spin,
}: {
  icon: IconComponent
  children: string
  error?: boolean
  spin?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 px-4 py-8 text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
      <Icon className={`size-4 ${spin ? 'animate-spin' : ''}`} />
      {children}
    </div>
  )
}

function ModerationQueue() {
  const { data, isLoading, isError } = useModerationProducts('en_attente')
  if (isLoading) return <QueueState icon={Loader} spin>Chargement de la file…</QueueState>
  if (isError) return <QueueState icon={AlertCircle} error>Impossible de charger la file de modération.</QueueState>

  const products = data ?? []
  if (products.length === 0) return <QueueState icon={Store}>Aucun produit en attente de modération.</QueueState>

  return (
    <ul className="divide-y divide-border">
      {products.slice(0, 6).map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-amber-soft text-amber-foreground">
              <Store className="size-4" />
            </span>
            <span className="truncate text-sm font-medium">{p.title}</span>
          </div>
          <Link
            to="/admin/marketplace"
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-secondary/60"
          >
            Examiner
          </Link>
        </li>
      ))}
    </ul>
  )
}

function SupportQueue() {
  const { data, isLoading, isError } = useSupportTickets()
  if (isLoading) return <QueueState icon={Loader} spin>Chargement des tickets…</QueueState>
  if (isError) return <QueueState icon={AlertCircle} error>Impossible de charger les tickets de support.</QueueState>

  const open = (data ?? []).filter((t) => t.status !== 'resolu')
  if (open.length === 0) return <QueueState icon={MessageSquare}>Aucun ticket en attente. Tout est traité.</QueueState>

  return (
    <ul className="divide-y divide-border">
      {open.slice(0, 6).map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.subject}</p>
            <p className="text-xs text-muted-foreground">
              {t.authorName ?? 'Anonyme'}
              {t.category ? ` · ${t.category}` : ''}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              t.status === 'ouvert' ? 'bg-amber-soft text-amber-foreground' : 'bg-info-soft text-info'
            }`}
          >
            {t.status === 'ouvert' ? 'Ouvert' : 'En cours'}
          </span>
        </li>
      ))}
    </ul>
  )
}

function AdminOverview() {
  const managers = useManagers()
  const moderation = useModerationProducts('en_attente')
  const tickets = useSupportTickets()
  const classes = useClasses()
  const subjects = useSubjects()

  const openTickets = (tickets.data ?? []).filter((t) => t.status === 'ouvert')

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <AdminPageHeader
        eyebrow="Administration"
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la plateforme MLC Academy."
      />

      {/* KPI réels */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard
          label="Gestionnaires"
          icon={Users}
          tone="brand"
          value={<KpiValue isLoading={managers.isLoading} isError={managers.isError} value={managers.data?.length ?? 0} />}
        />
        <KpiCard
          label="Produits à modérer"
          icon={Store}
          tone="amber"
          value={<KpiValue isLoading={moderation.isLoading} isError={moderation.isError} value={moderation.data?.length ?? 0} />}
        />
        <KpiCard
          label="Tickets ouverts"
          icon={MessageSquare}
          tone="info"
          value={<KpiValue isLoading={tickets.isLoading} isError={tickets.isError} value={openTickets.length} />}
        />
        <KpiCard
          label="Classes"
          icon={GraduationCap}
          tone="success"
          value={<KpiValue isLoading={classes.isLoading} isError={classes.isError} value={classes.data?.length ?? 0} />}
        />
        <KpiCard
          label="Matières"
          icon={Library}
          tone="teal"
          value={<KpiValue isLoading={subjects.isLoading} isError={subjects.isError} value={subjects.data?.length ?? 0} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="File de modération" tone="amber" action={<SeeAll to="/admin/marketplace" />}>
            <ModerationQueue />
          </Panel>
          <Panel title="Support à traiter" tone="info" action={<SeeAll to="/admin/support" />}>
            <SupportQueue />
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Accès rapides" tone="brand">
            <ShortcutsList />
          </Panel>
        </div>
      </div>
    </div>
  )
}
