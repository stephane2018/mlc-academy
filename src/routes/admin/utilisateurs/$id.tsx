import { useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, User, Mail, Crown, CheckCircle2, X, CalendarDays } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminUser, useSetUserRole, useBlockUser, useUnblockUser } from '@/hooks/use-admin-users'
import type { UserRole } from '@/services/admin-users'

export const Route = createFileRoute('/admin/utilisateurs/$id')({
  component: UserDetail,
})

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

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d)
}

function BackLink() {
  return (
    <Link
      to="/admin/utilisateurs"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Comptes
    </Link>
  )
}

function UserDetail() {
  const { id } = useParams({ from: '/admin/utilisateurs/$id' })
  const userQ = useAdminUser(id)
  const setRole = useSetUserRole()
  const block = useBlockUser()
  const unblock = useUnblockUser()
  const [role, setRoleValue] = useState<UserRole | ''>('')

  const user = userQ.data
  // Initialise le rôle sélectionné quand les données arrivent.
  const selectedRole = role || (user?.role as UserRole | undefined) || ''

  if (userQ.isLoading) {
    return <p className="px-6 py-10 text-center text-sm text-muted-foreground">Chargement du compte…</p>
  }
  if (userQ.isError || !user) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <BackLink />
        <Card className="rounded-2xl p-8 text-center text-sm text-destructive shadow-soft">
          Compte introuvable.
        </Card>
      </div>
    )
  }

  const saveRole = () => {
    if (selectedRole === '') return
    setRole.mutate(
      { id: user.id, role: selectedRole },
      {
        onSuccess: () => toast.success('Rôle mis à jour'),
        onError: () => toast.error('Impossible de changer le rôle'),
      },
    )
  }

  const toggleBlock = () => {
    const action = user.blocked ? unblock : block
    action.mutate(user.id, {
      onSuccess: () => toast.success(user.blocked ? 'Compte débloqué' : 'Compte bloqué'),
      onError: () => toast.error('Action impossible'),
    })
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[900px]">
      <BackLink />

      {/* Identité */}
      <Card className="gap-0 rounded-2xl p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary">
            <User className="size-6 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-xl font-extrabold tracking-tight">
              {user.displayName ?? user.email ?? 'Compte'}
            </h1>
            <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" /> {user.email ?? '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.role ? (
              <Badge className="bg-brand-soft text-brand">{ROLE_LABEL[user.role as UserRole] ?? user.role}</Badge>
            ) : (
              <Badge variant="outline">Sans rôle</Badge>
            )}
            {user.blocked ? (
              <Badge className="bg-destructive/10 text-destructive">Bloqué</Badge>
            ) : (
              <Badge className="bg-success-soft text-success">Actif</Badge>
            )}
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" /> Inscrit le {formatDate(user.createdAt)}
        </p>
      </Card>

      {/* Rôle */}
      <Card className="gap-3 rounded-2xl p-5 shadow-soft">
        <h2 className="font-heading text-base font-bold">Rôle</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="role">Rôle du compte</Label>
            <Select value={selectedRole} onValueChange={(v) => setRoleValue(v as UserRole)}>
              <SelectTrigger id="role" className="h-10 w-full">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={saveRole} disabled={selectedRole === '' || selectedRole === user.role || setRole.isPending}>
            <Crown className="size-4" /> Enregistrer
          </Button>
        </div>
      </Card>

      {/* Accès */}
      <Card className="gap-3 rounded-2xl p-5 shadow-soft">
        <h2 className="font-heading text-base font-bold">Accès</h2>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {user.blocked
              ? 'Ce compte est bloqué — il ne peut pas se connecter.'
              : 'Ce compte est actif.'}
          </p>
          {user.blocked ? (
            <Button onClick={toggleBlock} disabled={unblock.isPending}>
              <CheckCircle2 className="size-4" /> Débloquer
            </Button>
          ) : (
            <Button variant="destructive" onClick={toggleBlock} disabled={block.isPending}>
              <X className="size-4" /> Bloquer
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
