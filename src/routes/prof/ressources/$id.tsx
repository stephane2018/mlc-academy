import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Users } from '@/components/icons'
import { TYPE_META } from '@/components/student/resource-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QueryError } from '@/components/query-error'
import { cn } from '@/lib/utils'
import type { ResourceType } from '@/lib/mock'
import { useResources } from '@/hooks/use-resources'

export const Route = createFileRoute('/prof/ressources/$id')({
  component: ResourceDetail,
})

const STATUS_LABEL: Record<string, string> = { publie: 'Publié', planifie: 'Planifié', brouillon: 'Brouillon' }
const STATUS_TONE: Record<string, string> = {
  publie: 'bg-teal-soft text-teal-foreground',
  planifie: 'bg-info-soft text-info',
  brouillon: 'bg-secondary text-muted-foreground',
}

function BackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
      <Link to="/prof/ressources">
        <ArrowLeft className="size-4" />
        Retour aux ressources
      </Link>
    </Button>
  )
}

function ResourceDetail() {
  const { id } = useParams({ from: '/prof/ressources/$id' })
  const resourcesQ = useResources()
  const resources = resourcesQ.data ?? []
  const isLoading = resourcesQ.isLoading
  const r = resources.find((x) => x.id === id)

  if (isLoading) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <BackLink />
        <Card className="py-12 text-center text-sm text-muted-foreground">Chargement…</Card>
      </div>
    )
  }
  if (resourcesQ.isError) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <BackLink />
        <QueryError onRetry={() => resourcesQ.refetch()} />
      </div>
    )
  }
  if (!r) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <BackLink />
        <Card className="py-12 text-center text-sm text-muted-foreground">Ressource introuvable.</Card>
      </div>
    )
  }

  const meta = TYPE_META[r.type as ResourceType]

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[900px]">
      <BackLink />
      <Card className="gap-0 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn('grid size-14 place-items-center rounded-2xl', meta.chip)}>
              <meta.Icon className="size-6" />
            </span>
            <div>
              <p className="font-heading text-xl font-bold">{r.title}</p>
              <p className="text-sm text-muted-foreground">{meta.label}</p>
            </div>
          </div>
          <Badge variant="secondary" className={cn('shrink-0', STATUS_TONE[r.status])}>
            {STATUS_LABEL[r.status] ?? r.status}
          </Badge>
        </div>

        {r.description && <p className="mt-4 text-sm text-muted-foreground">{r.description}</p>}
        {r.message && (
          <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm">
            <span className="font-semibold">Message : </span>
            {r.message}
          </p>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="size-3.5" /> Groupes ayant accès
          </p>
          {r.groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore partagée.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {r.groups.map((g) => (
                <Badge key={g} variant="secondary" className="bg-brand-soft text-brand">{g}</Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
