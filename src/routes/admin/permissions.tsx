import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShieldCheck, Crown, GraduationCap, Users, Heart } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { PageHero } from '@/components/blocks'
import {
  permissions,
  permissionCategories,
  rolePermissions,
  roleLabels,
  type RoleKey,
} from '@/lib/mock'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/permissions')({
  component: AdminPermissions,
})

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

const ROLE_ORDER: RoleKey[] = ['eleve', 'prof', 'parent']

const ROLE_ICON: Record<RoleKey, typeof GraduationCap> = {
  eleve: GraduationCap,
  prof: Users,
  parent: Heart,
}

const ROLE_TONE: Record<RoleKey, string> = {
  eleve: 'bg-brand-soft text-brand',
  prof: 'bg-violet-soft text-violet',
  parent: 'bg-teal-soft text-teal',
}

function initialMatrix(): Record<RoleKey, Set<string>> {
  return {
    eleve: new Set(rolePermissions.eleve),
    prof: new Set(rolePermissions.prof),
    parent: new Set(rolePermissions.parent),
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminPermissions() {
  const [matrix, setMatrix] = useState<Record<RoleKey, Set<string>>>(initialMatrix)

  const toggle = (role: RoleKey, key: string) => {
    setMatrix((prev) => {
      const next: Record<RoleKey, Set<string>> = {
        eleve: new Set(prev.eleve),
        prof: new Set(prev.prof),
        parent: new Set(prev.parent),
      }
      const set = next[role]
      const granted = !set.has(key)
      if (granted) set.add(key)
      else set.delete(key)
      const perm = permissions.find((p) => p.key === key)
      toast.success(
        `${granted ? 'Droit accordé' : 'Droit retiré'} — ${perm?.label ?? key} · ${roleLabels[role]}`,
      )
      return next
    })
  }

  const counts = useMemo(
    () =>
      ROLE_ORDER.reduce(
        (acc, role) => {
          acc[role] = matrix[role].size
          return acc
        },
        {} as Record<RoleKey, number>,
      ),
    [matrix],
  )

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        eyebrow="Super admin"
        title="Permissions"
        subtitle="Configure ce que chaque rôle peut voir et faire dans l'application. Les droits sont accordés section par section, rôle par rôle."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  <div className="text-sm font-semibold">{roleLabels[role]}</div>
                  <div className="text-xs text-muted-foreground">
                    {counts[role]} droit{counts[role] > 1 ? 's' : ''} actif
                    {counts[role] > 1 ? 's' : ''}
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
          <p className="text-muted-foreground">
            Cet écran est une maquette : les modifications ne sont pas enregistrées.
          </p>
        </div>
      </Card>

      {/* Matrice par catégorie */}
      <div className="space-y-5">
        {permissionCategories.map((cat) => {
          const rows = permissions.filter((p) => p.category === cat.key)
          if (rows.length === 0) return null

          return (
            <Card key={cat.key} className="overflow-hidden rounded-2xl p-0 shadow-soft">
              {/* En-tête de catégorie */}
              <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-5 py-3">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{cat.label}</span>
                <Badge variant="outline" className="ml-auto text-muted-foreground">
                  {rows.length} permission{rows.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* En-têtes de colonnes */}
              <div className="grid grid-cols-[1fr_repeat(3,4rem)] items-center gap-2 border-b border-border bg-card px-5 py-2 sm:grid-cols-[1fr_repeat(3,5rem)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Permission
                </span>
                {ROLE_ORDER.map((role) => (
                  <span
                    key={role}
                    className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {roleLabels[role]}
                  </span>
                ))}
              </div>

              {/* Lignes de permissions */}
              <div className="divide-y divide-border">
                {rows.map((perm) => (
                  <div
                    key={perm.key}
                    className="grid grid-cols-[1fr_repeat(3,4rem)] items-center gap-2 px-5 py-3 transition-colors hover:bg-secondary/30 sm:grid-cols-[1fr_repeat(3,5rem)]"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium">{perm.label}</div>
                      <p className="text-sm text-muted-foreground">{perm.description}</p>
                    </div>
                    {ROLE_ORDER.map((role) => (
                      <div key={role} className="flex justify-center">
                        <Switch
                          checked={matrix[role].has(perm.key)}
                          onCheckedChange={() => toggle(role, perm.key)}
                          aria-label={`${perm.label} — ${roleLabels[role]}`}
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
    </div>
  )
}
