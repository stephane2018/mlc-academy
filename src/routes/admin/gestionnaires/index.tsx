import { useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Crown, Loader, Mail, ArrowRight } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { avatarTint } from '@/components/student/parts'
import { useManagers, useManagerCapabilities } from '@/hooks/use-admin'

export const Route = createFileRoute('/admin/gestionnaires/')({
  component: AdminGestionnaires,
})

type Manager = { id: string; name: string; email: string; caps: string[] }

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

function AdminGestionnaires() {
  const { data, isLoading, isError } = useManagers()
  const { data: capsData } = useManagerCapabilities()

  const managers = data ?? []
  const catalog = capsData ?? []
  const labelByKey = useMemo(() => new Map(catalog.map((c) => [c.key, c.label])), [catalog])

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Super admin"
        title="Gestionnaires"
        subtitle="Délègue la gestion du back-office. Ouvre la fiche d'une personne pour cocher les sections qu'elle peut gérer."
      />

      <Card className="flex flex-row items-start gap-3 border-dashed bg-secondary/40 p-4">
        <Crown className="size-5 shrink-0 text-amber" />
        <p className="text-sm text-muted-foreground">
          Le <span className="font-semibold text-foreground">super admin</span> conserve tous les
          accès. Un gestionnaire ne gère que les sections cochées dans ses accès.
        </p>
      </Card>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className={THEAD}>
                <th className={TH}>Gestionnaire</th>
                <th className={TH}>Accès</th>
                <th className={cn(TH, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <StateRow>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader className="size-4 animate-spin" />
                    Chargement des gestionnaires…
                  </span>
                </StateRow>
              ) : isError ? (
                <StateRow>Impossible de charger les gestionnaires.</StateRow>
              ) : managers.length === 0 ? (
                <StateRow>
                  Aucun gestionnaire pour le moment. Les comptes ayant le rôle « gestionnaire »
                  apparaîtront ici.
                </StateRow>
              ) : (
                managers.map((m) => <ManagerRow key={m.id} manager={m} labelByKey={labelByKey} />)
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StateRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
        {children}
      </td>
    </tr>
  )
}

function ManagerRow({ manager: m, labelByKey }: { manager: Manager; labelByKey: Map<string, string> }) {
  // N'affiche que les caps présentes au catalogue (BD) — ignore les clés obsolètes.
  const granted = m.caps.filter((c) => labelByKey.has(c))

  return (
    <tr className="transition-colors hover:bg-secondary/40">
      <td className="px-5 py-3">
        <Link to="/admin/gestionnaires/$id" params={{ id: m.id }} className="group flex items-center gap-3">
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', avatarTint(m.name))}>
            {m.name.charAt(0).toUpperCase()}
          </span>
          <div className="leading-tight">
            <p className="font-semibold group-hover:text-brand">{m.name}</p>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" />
              {m.email}
            </p>
          </div>
        </Link>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="bg-brand-soft text-brand">{granted.length} accès</Badge>
          {granted.map((c) => (
            <Badge key={c} variant="secondary" className="bg-secondary text-muted-foreground">
              {labelByKey.get(c) ?? c}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/gestionnaires/$id" params={{ id: m.id }}>
              Gérer les accès <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  )
}
