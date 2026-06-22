import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Users,
  Boxes,
  MessageSquare,
  Store,
  GraduationCap,
  Library,
  Sparkles,
  CircleHelp,
  ArrowRight,
  Loader,
  AlertCircle,
} from '@/components/icons'
import type { IconComponent } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { SectionHeader } from '@/components/student/parts'
import { RailLayout, StatTile } from '@/components/blocks'
import { useManagers, useModerationProducts } from '@/hooks/use-admin'
import { useSupportTickets } from '@/hooks/use-support'
import { useClasses, useSubjects } from '@/hooks/use-catalog'

export const Route = createFileRoute('/admin/')({
  component: AdminOverview,
})

type Tone = 'brand' | 'teal' | 'amber' | 'success' | 'info'

/* ------------------------------------------------------------------ */
/* Valeur d'un KPI selon l'état de la requête (chargement / erreur)    */
/* ------------------------------------------------------------------ */
function KpiValue({
  isLoading,
  isError,
  value,
}: {
  isLoading: boolean
  isError: boolean
  value: number
}) {
  if (isLoading) {
    return <Loader className="size-6 animate-spin text-muted-foreground" />
  }
  if (isError) {
    return <span className="text-base font-bold text-destructive">—</span>
  }
  return <>{value}</>
}

/* ------------------------------------------------------------------ */
/* Raccourcis vers les sections admin                                  */
/* ------------------------------------------------------------------ */
type Shortcut = {
  to: string
  icon: IconComponent
  tone: Tone
  label: string
  description: string
}

const shortcuts: Shortcut[] = [
  {
    to: '/admin/utilisateurs',
    icon: Users,
    tone: 'brand',
    label: 'Utilisateurs',
    description: 'Comptes élèves, profs et parents',
  },
  {
    to: '/admin/gestionnaires',
    icon: Boxes,
    tone: 'teal',
    label: 'Gestionnaires',
    description: 'Rôles et permissions',
  },
  {
    to: '/admin/marketplace',
    icon: Store,
    tone: 'amber',
    label: 'Marketplace',
    description: 'Modération des produits',
  },
  {
    to: '/admin/support',
    icon: MessageSquare,
    tone: 'info',
    label: 'Support',
    description: 'Tickets et conversations',
  },
  {
    to: '/admin/questions',
    icon: CircleHelp,
    tone: 'success',
    label: 'Questions',
    description: "Banque d'exercices",
  },
  {
    to: '/admin/classes',
    icon: GraduationCap,
    tone: 'brand',
    label: 'Classes',
    description: 'Référentiel des niveaux',
  },
  {
    to: '/admin/matieres',
    icon: Library,
    tone: 'teal',
    label: 'Matières',
    description: 'Référentiel des matières',
  },
]

function ShortcutsGrid() {
  return (
    <div className="grid gap-2.5">
      {shortcuts.map((s) => {
        const Icon = s.icon
        const tint =
          s.tone === 'brand'
            ? 'bg-brand-soft text-brand'
            : s.tone === 'teal'
              ? 'bg-teal-soft text-teal'
              : s.tone === 'amber'
                ? 'bg-amber-soft text-amber-foreground'
                : s.tone === 'success'
                  ? 'bg-success-soft text-success'
                  : 'bg-info-soft text-info'
        return (
          <Link
            key={s.to}
            to={s.to}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary/50"
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tint}`}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">{s.label}</p>
              <p className="truncate text-xs text-muted-foreground">{s.description}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* File de modération marketplace (produits en attente)               */
/* ------------------------------------------------------------------ */
function ModerationQueue() {
  const { data, isLoading, isError } = useModerationProducts('en_attente')

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
        <Loader className="size-4 animate-spin" />
        Chargement de la file…
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex items-center gap-2 px-5 py-8 text-sm text-destructive">
        <AlertCircle className="size-4" />
        Impossible de charger la file de modération.
      </div>
    )
  }

  const products = data ?? []
  if (products.length === 0) {
    return (
      <div className="px-5 py-8 text-sm text-muted-foreground">
        Aucun produit en attente de modération.
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {products.slice(0, 6).map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-soft text-amber-foreground">
              <Store className="size-4" />
            </span>
            <span className="truncate text-sm font-medium">{p.title}</span>
          </div>
          <Link
            to="/admin/marketplace"
            className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-secondary/60"
          >
            Examiner
          </Link>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Tickets de support récents (statut != résolu)                      */
/* ------------------------------------------------------------------ */
function SupportQueue() {
  const { data, isLoading, isError } = useSupportTickets()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
        <Loader className="size-4 animate-spin" />
        Chargement des tickets…
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex items-center gap-2 px-5 py-8 text-sm text-destructive">
        <AlertCircle className="size-4" />
        Impossible de charger les tickets de support.
      </div>
    )
  }

  const open = (data ?? []).filter((t) => t.status !== 'resolu')
  if (open.length === 0) {
    return (
      <div className="px-5 py-8 text-sm text-muted-foreground">
        Aucun ticket en attente. Tout est traité.
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {open.slice(0, 6).map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.subject}</p>
            <p className="text-xs text-muted-foreground">
              {t.authorName ?? 'Anonyme'}
              {t.category ? ` · ${t.category}` : ''}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
              t.status === 'ouvert'
                ? 'bg-amber-soft text-amber-foreground'
                : 'bg-info-soft text-info'
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
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      {/* Bandeau d'accueil compact */}
      <Card className="flex flex-col gap-3 rounded-2xl border-brand/15 bg-brand-soft/40 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-heading text-base font-bold">Tableau de bord administration</p>
            <p className="text-sm text-muted-foreground">
              Vue d'ensemble de la plateforme MLC Academy.
            </p>
          </div>
        </div>
      </Card>

      {/* KPI réels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatTile
          icon={Users}
          tone="brand"
          label="Gestionnaires"
          value={
            <KpiValue
              isLoading={managers.isLoading}
              isError={managers.isError}
              value={managers.data?.length ?? 0}
            />
          }
        />
        <StatTile
          icon={Store}
          tone="amber"
          label="Produits à modérer"
          value={
            <KpiValue
              isLoading={moderation.isLoading}
              isError={moderation.isError}
              value={moderation.data?.length ?? 0}
            />
          }
        />
        <StatTile
          icon={MessageSquare}
          tone="info"
          label="Tickets ouverts"
          value={
            <KpiValue
              isLoading={tickets.isLoading}
              isError={tickets.isError}
              value={openTickets.length}
            />
          }
        />
        <StatTile
          icon={GraduationCap}
          tone="success"
          label="Classes"
          value={
            <KpiValue
              isLoading={classes.isLoading}
              isError={classes.isError}
              value={classes.data?.length ?? 0}
            />
          }
        />
        <StatTile
          icon={Library}
          tone="teal"
          label="Matières"
          value={
            <KpiValue
              isLoading={subjects.isLoading}
              isError={subjects.isError}
              value={subjects.data?.length ?? 0}
            />
          }
        />
      </div>

      <RailLayout
        rail={
          <Card className="rounded-2xl p-5 shadow-soft">
            <SectionHeader title="Accès rapides" />
            <ShortcutsGrid />
          </Card>
        }
      >
        {/* File de modération */}
        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <SectionHeader title="File de modération" />
            <Link
              to="/admin/marketplace"
              className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              Tout voir
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <ModerationQueue />
        </Card>

        {/* Tickets de support à traiter */}
        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <SectionHeader title="Support à traiter" />
            <Link
              to="/admin/support"
              className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              Tout voir
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <SupportQueue />
        </Card>
      </RailLayout>
    </div>
  )
}
