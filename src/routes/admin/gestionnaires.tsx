import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Crown, Loader, Mail, Settings } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { avatarTint } from '@/components/student/parts'
import { useManagers, useManagerCapabilities, useSetManagerPermissions } from '@/hooks/use-admin'
import type { Capability } from '@/services/admin'

export const Route = createFileRoute('/admin/gestionnaires')({
  component: AdminGestionnaires,
})

type Manager = { id: string; name: string; email: string; caps: string[] }

/** Titre de groupe lisible dérivé d'une catégorie BD (ex. 'admin_contenu' → 'Contenu'). */
function categoryTitle(category: string): string {
  const base = category.replace(/^admin_?/, '').replace(/_/g, ' ').trim() || 'Général'
  return base.charAt(0).toUpperCase() + base.slice(1)
}

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

function AdminGestionnaires() {
  const { data, isLoading, isError } = useManagers()
  const { data: capsData } = useManagerCapabilities()
  const [openId, setOpenId] = useState<string | null>(null)

  const managers = data ?? []
  const catalog = capsData ?? []
  const labelByKey = useMemo(() => new Map(catalog.map((c) => [c.key, c.label])), [catalog])
  const selected = managers.find((m) => m.id === openId) ?? null

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Super admin"
        title="Gestionnaires"
        subtitle="Délègue la gestion du back-office. Ouvre les accès d'une personne pour cocher les sections qu'elle peut gérer."
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
                managers.map((m) => (
                  <ManagerRow key={m.id} manager={m} labelByKey={labelByKey} onOpen={() => setOpenId(m.id)} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PermissionsDialog
        manager={selected}
        catalog={catalog}
        labelByKey={labelByKey}
        onClose={() => setOpenId(null)}
      />
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

function ManagerRow({
  manager: m,
  labelByKey,
  onOpen,
}: {
  manager: Manager
  labelByKey: Map<string, string>
  onOpen: () => void
}) {
  // N'affiche que les caps présentes au catalogue (BD) — ignore les clés obsolètes.
  const granted = m.caps.filter((c) => labelByKey.has(c))

  return (
    <tr className="transition-colors hover:bg-secondary/40">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold',
              avatarTint(m.name),
            )}
          >
            {m.name.charAt(0).toUpperCase()}
          </span>
          <div className="leading-tight">
            <p className="font-semibold">{m.name}</p>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" />
              {m.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="bg-brand-soft text-brand">
            {granted.length} accès
          </Badge>
          {granted.map((c) => (
            <Badge key={c} variant="secondary" className="bg-secondary text-muted-foreground">
              {labelByKey.get(c) ?? c}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onOpen}>
            <Settings className="size-4" />
            Gérer les accès
          </Button>
        </div>
      </td>
    </tr>
  )
}

function PermissionsDialog({
  manager: m,
  catalog,
  labelByKey,
  onClose,
}: {
  manager: Manager | null
  catalog: Capability[]
  labelByKey: Map<string, string>
  onClose: () => void
}) {
  const setPermissions = useSetManagerPermissions()
  const [caps, setCaps] = useState<string[]>([])

  // Synchronise les cases avec le gestionnaire sélectionné à l'ouverture.
  useEffect(() => {
    setCaps(m ? m.caps.filter((c) => labelByKey.has(c)) : [])
  }, [m, labelByKey])

  const dirty = useMemo(() => {
    if (!m) return false
    const current = m.caps.filter((c) => labelByKey.has(c))
    return current.length !== caps.length || current.some((c) => !caps.includes(c))
  }, [m, caps, labelByKey])

  // Capacités groupées par catégorie (issues du catalogue BD).
  const grouped = useMemo(() => {
    const map = new Map<string, Capability[]>()
    for (const cap of catalog) {
      const list = map.get(cap.category) ?? []
      list.push(cap)
      map.set(cap.category, list)
    }
    return [...map.entries()]
  }, [catalog])

  const toggle = (key: string) =>
    setCaps((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]))

  const save = () => {
    if (!m) return
    setPermissions.mutate(
      { id: m.id, caps },
      {
        onSuccess: () => {
          toast.success('Accès mis à jour', { description: m.name })
          onClose()
        },
        onError: () => toast.error('Échec de la mise à jour des accès'),
      },
    )
  }

  return (
    <Dialog open={m !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {m && (
          <>
            <DialogHeader>
              <DialogTitle>Accès de {m.name}</DialogTitle>
              <DialogDescription>
                Coche les sections du back-office que cette personne peut gérer.
              </DialogDescription>
            </DialogHeader>

            {grouped.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune capacité disponible dans le catalogue.
              </p>
            ) : (
              <div className="space-y-4">
                {grouped.map(([category, caps_]) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {categoryTitle(category)}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {caps_.map((cap) => (
                        <li
                          key={cap.key}
                          className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5"
                        >
                          <span className="text-sm">
                            {cap.label}
                            {cap.description && (
                              <span className="block text-xs text-muted-foreground">{cap.description}</span>
                            )}
                          </span>
                          <Switch checked={caps.includes(cap.key)} onCheckedChange={() => toggle(cap.key)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} disabled={setPermissions.isPending}>
                Annuler
              </Button>
              <Button onClick={save} disabled={!dirty || setPermissions.isPending}>
                {setPermissions.isPending && <Loader className="size-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
