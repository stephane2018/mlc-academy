import { useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, User, Mail, Crown, CheckCircle2, X, CalendarDays, Boxes, Users, Flame, Zap, Link2 } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Meter } from '@/components/student/parts'
import type { AdminUserDetail } from '@/services/admin-users'
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

function StatChip({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
      <Icon className="size-4 text-brand" />
      <div className="leading-tight">
        <p className="text-sm font-bold tabular-nums">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function StudentBlock({ s }: { s: NonNullable<AdminUserDetail['student']> }) {
  return (
    <Card className="gap-4 rounded-2xl p-5 shadow-soft">
      <h2 className="font-heading text-base font-bold">Profil élève</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip icon={Zap} label="Niveau" value={s.level} />
        <StatChip icon={Crown} label="XP" value={s.nextLevelXp ? `${s.xp}/${s.nextLevelXp}` : s.xp} />
        <StatChip icon={Flame} label="Série" value={s.streak} />
        <StatChip icon={Boxes} label="Classe" value={s.classCode ?? '—'} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">Groupes :</span>
        {s.groups.length === 0 ? (
          <span className="text-xs text-muted-foreground">aucun</span>
        ) : (
          s.groups.map((g) => (
            <Badge key={g} variant="secondary" className="bg-brand-soft text-brand">
              <Users className="size-3" /> {g}
            </Badge>
          ))
        )}
      </div>

      {s.parents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Parent(s) :</span>
          {s.parents.map((p) => (
            <Link key={p.id} to="/admin/utilisateurs/$id" params={{ id: p.id }}>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground transition-colors hover:bg-brand-soft hover:text-brand">
                <Link2 className="size-3" /> {p.email}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {s.skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compétences</p>
          {s.skills.map((sk) => (
            <div key={sk.subjectId} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm font-medium">{sk.subjectName}</span>
              <Meter value={sk.mastery} color="auto" className="flex-1" />
              <span className="w-10 text-right text-xs font-bold tabular-nums">{Math.round(sk.mastery)}%</span>
            </div>
          ))}
        </div>
      )}

      {s.recentSubmissions.length > 0 && (
        <ActivityList
          title="Dernières copies"
          items={s.recentSubmissions.map((r) => ({
            label: r.title,
            value: r.score !== null ? `${r.score}%` : 'à corriger',
          }))}
        />
      )}
      {s.recentExams.length > 0 && (
        <ActivityList
          title="Examens"
          items={s.recentExams.map((r) => ({ label: r.title, value: r.score !== null ? `${r.score}%` : '—' }))}
        />
      )}
    </Card>
  )
}

/** Petite liste libellé → valeur, réutilisée par les sections d'activité. */
function ActivityList({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
            <span className="truncate">{it.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TeacherBlock({ t }: { t: NonNullable<AdminUserDetail['teacher']> }) {
  return (
    <Card className="gap-4 rounded-2xl p-5 shadow-soft">
      <h2 className="font-heading text-base font-bold">Profil enseignant</h2>
      <div className="grid grid-cols-2 gap-2">
        <StatChip icon={Boxes} label="Groupes" value={t.groups.length} />
        <StatChip icon={Users} label="Élèves suivis" value={t.studentCount} />
      </div>
      {t.groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {t.groups.map((g) => (
            <Badge key={g.name} variant="secondary" className="bg-brand-soft text-brand">
              {g.name} · {g.memberCount}
            </Badge>
          ))}
        </div>
      )}
      {t.recentAssignments.length > 0 && (
        <ActivityList
          title="Devoirs récents"
          items={t.recentAssignments.map((a) => ({ label: a.title, value: a.status }))}
        />
      )}
    </Card>
  )
}

function ParentBlock({ p }: { p: NonNullable<AdminUserDetail['parent']> }) {
  return (
    <Card className="gap-3 rounded-2xl p-5 shadow-soft">
      <h2 className="font-heading text-base font-bold">Enfants rattachés</h2>
      {p.children.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun enfant rattaché.</p>
      ) : (
        <ul className="space-y-2">
          {p.children.map((c) => (
            <li key={c.id}>
              <Link
                to="/admin/utilisateurs/$id"
                params={{ id: c.id }}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2 transition-colors hover:border-brand/40 hover:bg-secondary/40"
              >
                <span className="text-sm font-medium">{c.pseudo}</span>
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">{c.classCode ?? '—'}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {p.subscription && (
        <div className="rounded-xl border border-border px-3 py-2 text-sm">
          <span className="font-semibold">Abonnement :</span> {p.subscription.status}
          {p.subscription.planId ? ` · ${p.subscription.planId}` : ''}
        </div>
      )}
      {p.invoices.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Factures</p>
          <ul className="space-y-1.5">
            {p.invoices.map((inv, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                <span className="truncate">
                  {(inv.amountCents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} · {inv.status}
                </span>
                {inv.pdfUrl ? (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-semibold text-brand hover:underline"
                  >
                    PDF
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString('fr-FR') : '—'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

function CapsBlock({ caps }: { caps: string[] }) {
  return (
    <Card className="gap-3 rounded-2xl p-5 shadow-soft">
      <h2 className="font-heading text-base font-bold">Accès back-office</h2>
      {caps.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun accès attribué.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {caps.map((c) => (
            <Badge key={c} variant="secondary" className="bg-violet-soft text-violet">{c}</Badge>
          ))}
        </div>
      )}
    </Card>
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

      {/* Détail selon le rôle */}
      {user.student && <StudentBlock s={user.student} />}
      {user.teacher && <TeacherBlock t={user.teacher} />}
      {user.parent && <ParentBlock p={user.parent} />}
      {user.caps && <CapsBlock caps={user.caps} />}

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
