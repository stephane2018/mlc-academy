import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShieldCheck, Crown, GraduationCap, Users, Heart, Settings, Loader } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/blocks'
import { permissionCategories } from '@/lib/mock'
import { cn } from '@/lib/utils'
import { useRolePermissions, useSetRolePermission } from '@/hooks/use-role-permissions'
import type { EditableRole, RolePermission } from '@/services/role-permissions'

export const Route = createFileRoute('/admin/permissions')({
  component: AdminPermissions,
})

/** Rôles affichés en colonnes (l'admin a tout → hors matrice). */
const ROLE_ORDER: EditableRole[] = ['gestionnaire', 'prof', 'parent', 'eleve']

const ROLE_LABELS: Record<EditableRole, string> = {
  gestionnaire: 'Gestionnaire',
  prof: 'Professeur',
  parent: 'Parent',
  eleve: 'Élève',
}

const ROLE_ICON: Record<EditableRole, typeof GraduationCap> = {
  gestionnaire: Settings,
  prof: Users,
  parent: Heart,
  eleve: GraduationCap,
}

const ROLE_TONE: Record<EditableRole, string> = {
  gestionnaire: 'bg-amber-soft text-amber-foreground',
  prof: 'bg-violet-soft text-violet',
  parent: 'bg-teal-soft text-teal',
  eleve: 'bg-brand-soft text-brand',
}

/** Libellé d'une catégorie (fallback sur la clé brute si inconnue). */
function categoryLabel(key: string): string {
  return permissionCategories.find((c) => c.key === key)?.label ?? key
}

function AdminPermissions() {
  const { data, isLoading, isError } = useRolePermissions()
  const setPermission = useSetRolePermission()

  const permissions = data?.permissions ?? []
  const matrix = data?.matrix ?? {}

  // Ensembles de clés accordées par rôle (lecture O(1) dans le rendu).
  const granted = useMemo(() => {
    const out = {} as Record<EditableRole, Set<string>>
    for (const role of ROLE_ORDER) out[role] = new Set(matrix[role] ?? [])
    return out
  }, [matrix])

  // Compteurs par rôle pour les vignettes du hero.
  const counts = useMemo(
    () =>
      ROLE_ORDER.reduce(
        (acc, role) => {
          acc[role] = granted[role].size
          return acc
        },
        {} as Record<EditableRole, number>,
      ),
    [granted],
  )

  // Catégories effectivement présentes, dans l'ordre du catalogue mock.
  const categories = useMemo(() => {
    const present = new Set(permissions.map((p) => p.category))
    const ordered: string[] = permissionCategories.map((c) => c.key).filter((k) => present.has(k))
    // Catégories inconnues du mock ajoutées à la fin.
    const extra = [...present].filter((k) => !ordered.includes(k))
    return [...ordered, ...extra]
  }, [permissions])

  const toggle = (role: EditableRole, perm: RolePermission) => {
    const allowed = !granted[role].has(perm.key)
    setPermission.mutate(
      { role, permissionKey: perm.key, allowed },
      {
        onSuccess: () =>
          toast.success(
            `${allowed ? 'Droit accordé' : 'Droit retiré'} — ${perm.label} · ${ROLE_LABELS[role]}`,
          ),
        onError: () => toast.error('Échec de la mise à jour du droit'),
      },
    )
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        eyebrow="Super admin"
        title="Permissions"
        subtitle="Configure ce que chaque rôle peut voir et faire dans l'application. Les droits sont accordés section par section, rôle par rôle."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ROLE_ORDER.map((role) => {
            const Icon = ROLE_ICON[role]
            return (
              <div
                key={role}
                className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3"
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-xl',
                    ROLE_TONE[role],
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{ROLE_LABELS[role]}</div>
                  <div className="text-xs text-muted-foreground">
                    {isLoading
                      ? '…'
                      : `${counts[role]} droit${counts[role] > 1 ? 's' : ''} actif${counts[role] > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </PageHero>

      {/* Encart d'information */}
      <Card className="flex flex-col gap-3 rounded-2xl border-dashed bg-secondary/30 p-4 shadow-none sm:flex-row sm:items-start">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-soft text-amber-foreground">
          <Crown className="size-4" />
        </span>
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">
            Le super admin dispose de tous les accès par défaut — il n'apparaît pas dans la matrice.
          </p>
          <p className="text-muted-foreground">Chaque changement est enregistré immédiatement.</p>
        </div>
      </Card>

      {isError ? (
        <Card className="rounded-2xl border-dashed bg-secondary/30 p-8 text-center text-sm text-muted-foreground shadow-none">
          Impossible de charger la matrice des permissions.
        </Card>
      ) : isLoading ? (
        <MatrixSkeleton />
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => {
            const rows = permissions.filter((p) => p.category === cat)
            if (rows.length === 0) return null

            return (
              <Card key={cat} className="overflow-hidden rounded-2xl p-0 shadow-soft">
                {/* En-tête de catégorie */}
                <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-5 py-3">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{categoryLabel(cat)}</span>
                  <Badge variant="outline" className="ml-auto text-muted-foreground">
                    {rows.length} permission{rows.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* En-têtes de colonnes */}
                <div className="grid grid-cols-[1fr_repeat(4,4rem)] items-center gap-2 border-b border-border bg-card px-5 py-2 sm:grid-cols-[1fr_repeat(4,5rem)]">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Permission
                  </span>
                  {ROLE_ORDER.map((role) => (
                    <span
                      key={role}
                      className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {ROLE_LABELS[role]}
                    </span>
                  ))}
                </div>

                {/* Lignes de permissions */}
                <div className="divide-y divide-border">
                  {rows.map((perm) => (
                    <div
                      key={perm.key}
                      className="grid grid-cols-[1fr_repeat(4,4rem)] items-center gap-2 px-5 py-3 transition-colors hover:bg-secondary/30 sm:grid-cols-[1fr_repeat(4,5rem)]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium">{perm.label}</div>
                        <p className="font-mono text-xs text-muted-foreground">{perm.key}</p>
                      </div>
                      {ROLE_ORDER.map((role) => (
                        <div key={role} className="flex justify-center">
                          <Switch
                            checked={granted[role].has(perm.key)}
                            onCheckedChange={() => toggle(role, perm)}
                            disabled={setPermission.isPending}
                            aria-label={`${perm.label} — ${ROLE_LABELS[role]}`}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Squelette de chargement de la matrice. */
function MatrixSkeleton() {
  return (
    <div className="space-y-5" aria-busy>
      {[0, 1].map((i) => (
        <Card key={i} className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-5 py-3">
            <Loader className="size-4 animate-spin text-muted-foreground" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="grid grid-cols-[1fr_repeat(4,4rem)] items-center gap-2 px-5 py-3 sm:grid-cols-[1fr_repeat(4,5rem)]"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                {ROLE_ORDER.map((role) => (
                  <div key={role} className="flex justify-center">
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
