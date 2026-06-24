import { AlertCircle, RotateCcw } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * État d'erreur réutilisable pour une requête TanStack Query.
 * À afficher quand `query.isError` ; `onRetry` rebranche `query.refetch()`.
 */
export function QueryError({
  onRetry,
  message = 'Impossible de charger les données.',
  className,
}: {
  onRetry?: () => void
  message?: string
  className?: string
}) {
  return (
    <Card className={cn('items-center gap-3 rounded-2xl p-8 text-center shadow-soft', className)}>
      <span className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="size-4" />
          Réessayer
        </Button>
      ) : null}
    </Card>
  )
}
