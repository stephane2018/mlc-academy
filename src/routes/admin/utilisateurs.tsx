import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Users,
  User,
  Search,
  Mail,
  ShieldCheck,
  CheckCircle2,
  X,
  Shield,
  Crown,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { useAdminUsers, useSetUserRole, useBlockUser, useUnblockUser } from '@/hooks/use-admin-users'
import type { AdminUser, UserRole } from '@/services/admin-users'

export const Route = createFileRoute('/admin/utilisateurs')({
  component: AdminUtilisateurs,
})

/* ------------------------------------------------------------------ */
/* Rôles                                                               */
/* ------------------------------------------------------------------ */

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'eleve', label: 'Élève' },
  { value: 'prof', label: 'Prof' },
  { value: 'parent', label: 'Parent' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'admin', label: 'Admin' },
]

const ROLE_LABEL: Record<UserRole, string> = {
  eleve: 'Élève',
  prof: 'Prof',
  parent: 'Parent',
  gestionnaire: 'Gestionnaire',
  admin: 'Admin',
}

function RoleBadge({ role }: { role: UserRole | null }) {
  if (role === null) return <Badge variant="outline">Sans rôle</Badge>
  const tones: Record<UserRole, string> = {
    eleve: 'bg-brand-soft text-brand',
    prof: 'bg-teal-soft text-teal',
    parent: 'bg-info-soft text-info',
    gestionnaire: 'bg-violet-soft text-violet',
    admin: 'bg-amber-soft text-amber-foreground',
  }
  return <Badge className={tones[role]}>{ROLE_LABEL[role]}</Badge>
}

function StatusBadge({ blocked }: { blocked: boolean }) {
  if (blocked) return <Badge className="bg-destructive/10 text-destructive">Bloqué</Badge>
  return <Badge className="bg-success-soft text-success">Actif</Badge>
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d)
}

/* ------------------------------------------------------------------ */
/* Petits composants                                                   */
/* ------------------------------------------------------------------ */

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
/* Dialog : changer le rôle                                            */
/* ------------------------------------------------------------------ */

function RoleDialog({
  user,
  onClose,
}: {
  user: AdminUser | null
  onClose: () => void
}) {
  const setRole = useSetUserRole()
  const [role, setRoleValue] = useState<UserRole | ''>(user?.role ?? '')

  const submit = () => {
    if (!user || role === '') return
    setRole.mutate(
      { id: user.id, role },
      {
        onSuccess: () => {
          toast.success('Rôle mis à jour')
          onClose()
        },
        onError: () => toast.error('Impossible de changer le rôle'),
      },
    )
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle>Changer le rôle</DialogTitle>
              <DialogDescription className="truncate">
                {user.displayName ?? user.email}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <Select value={role} onValueChange={(v) => setRoleValue(v as UserRole)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={setRole.isPending}>
                Annuler
              </Button>
              <Button onClick={submit} disabled={role === '' || setRole.isPending}>
                <Crown className="size-4" />
                Enregistrer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Dialog : bloquer / débloquer                                        */
/* ------------------------------------------------------------------ */

function BlockDialog({
  user,
  onClose,
}: {
  user: AdminUser | null
  onClose: () => void
}) {
  const block = useBlockUser()
  const unblock = useUnblockUser()
  const isBlocked = user?.blocked ?? false
  const pending = block.isPending || unblock.isPending

  const submit = () => {
    if (!user) return
    const action = isBlocked ? unblock : block
    action.mutate(user.id, {
      onSuccess: () => {
        toast.success(isBlocked ? 'Compte débloqué' : 'Compte bloqué')
        onClose()
      },
      onError: () => toast.error("Action impossible"),
    })
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {user && (
          <>
            <DialogHeader>
              <DialogTitle>{isBlocked ? 'Débloquer le compte' : 'Bloquer le compte'}</DialogTitle>
              <DialogDescription>
                {isBlocked
                  ? `Réactiver l'accès de ${user.displayName ?? user.email} ?`
                  : `Suspendre l'accès de ${user.displayName ?? user.email} ?`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={pending}>
                Annuler
              </Button>
              {isBlocked ? (
                <Button onClick={submit} disabled={pending}>
                  <CheckCircle2 className="size-4" />
                  Débloquer
                </Button>
              ) : (
                <Button variant="destructive" onClick={submit} disabled={pending}>
                  <X className="size-4" />
                  Bloquer
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* États de table                                                      */
/* ------------------------------------------------------------------ */

const COLSPAN = 5

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          <td colSpan={COLSPAN} className="px-5 py-3">
            <Skeleton className="h-6 w-full" />
          </td>
        </tr>
      ))}
    </>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={COLSPAN} className="px-5 py-10 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminUtilisateurs() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null)

  const query = useMemo(
    () => ({
      role: roleFilter === 'all' ? undefined : roleFilter,
      search: search.trim() || undefined,
    }),
    [roleFilter, search],
  )

  const { data, isLoading, isError } = useAdminUsers(query)
  const users = data ?? []

  const activeCount = users.filter((u) => !u.blocked).length

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
          Gestion des comptes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tous les comptes — recherche, filtre par rôle, gestion des accès.
        </p>
      </div>

      {/* KPI (sur la page courante) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile icon={Users} tone="brand" label="Comptes affichés" value={users.length} />
        <StatTile icon={ShieldCheck} tone="success" label="Actifs" value={activeCount} />
        <StatTile
          icon={Shield}
          tone="info"
          label="Bloqués"
          value={users.length - activeCount}
        />
      </div>

      {/* Recherche + filtre */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un e-mail ou un nom…"
            className="h-9 pl-8"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as 'all' | UserRole)}>
            <SelectTrigger className="h-9 w-full sm:w-48">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ResultCount count={users.length} />
        </div>
      </div>

      <TableCard>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className={THEAD}>
              <th className={TH}>Compte</th>
              <th className={TH}>Rôle</th>
              <th className={TH}>Statut</th>
              <th className={TH}>Inscrit le</th>
              <th className={cn(TH, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <LoadingRows />
            ) : isError ? (
              <EmptyRow message="Impossible de charger les comptes." />
            ) : users.length === 0 ? (
              <EmptyRow message="Aucun compte ne correspond à ta recherche." />
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary">
                        <User className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.displayName ?? '—'}</p>
                        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <Mail className="size-3.5 shrink-0" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge blocked={u.blocked} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setRoleTarget(u)}>
                        <Crown className="size-4" />
                        Rôle
                      </Button>
                      {u.blocked ? (
                        <Button variant="outline" size="sm" onClick={() => setBlockTarget(u)}>
                          <CheckCircle2 className="size-4" />
                          Débloquer
                        </Button>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={() => setBlockTarget(u)}>
                          <X className="size-4" />
                          Bloquer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      <RoleDialog key={roleTarget?.id ?? 'none'} user={roleTarget} onClose={() => setRoleTarget(null)} />
      <BlockDialog user={blockTarget} onClose={() => setBlockTarget(null)} />
    </div>
  )
}
