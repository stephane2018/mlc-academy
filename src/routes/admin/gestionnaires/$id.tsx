import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Loader } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { avatarTint } from '@/components/student/parts'
import { useManagers, useManagerCapabilities, useSetManagerPermissions } from '@/hooks/use-admin'

export const Route = createFileRoute('/admin/gestionnaires/$id')({
  component: ManagerDetail,
})

/** Titre de groupe lisible dérivé d'une catégorie BD (ex. 'admin_contenu' → 'Contenu'). */
function categoryTitle(category: string): string {
  const base = category.replace(/^admin_?/, '').replace(/_/g, ' ').trim() || 'Général'
  return base.charAt(0).toUpperCase() + base.slice(1)
}

function BackLink() {
  return (
    <Link
      to="/admin/gestionnaires"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Gestionnaires
    </Link>
  )
}

function ManagerDetail() {
  const { id } = useParams({ from: '/admin/gestionnaires/$id' })
  const managersQ = useManagers()
  const capsQ = useManagerCapabilities()
  const setPermissions = useSetManagerPermissions()

  const manager = (managersQ.data ?? []).find((m) => m.id === id) ?? null
  const catalog = capsQ.data ?? []
  const labelByKey = useMemo(() => new Map(catalog.map((c) => [c.key, c.label])), [catalog])

  const [caps, setCaps] = useState<string[]>([])
  useEffect(() => {
    setCaps(manager ? manager.caps.filter((c) => labelByKey.has(c)) : [])
  }, [manager, labelByKey])

  const dirty = useMemo(() => {
    if (!manager) return false
    const current = manager.caps.filter((c) => labelByKey.has(c))
    return current.length !== caps.length || current.some((c) => !caps.includes(c))
  }, [manager, caps, labelByKey])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof catalog>()
    for (const cap of catalog) {
      const list = map.get(cap.category) ?? []
      list.push(cap)
      map.set(cap.category, list)
    }
    return [...map.entries()]
  }, [catalog])

  if (managersQ.isLoading) {
    return <p className="px-6 py-10 text-center text-sm text-muted-foreground">Chargement…</p>
  }
  if (managersQ.isError || !manager) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
        <BackLink />
        <Card className="rounded-2xl p-8 text-center text-sm text-destructive shadow-soft">
          Gestionnaire introuvable.
        </Card>
      </div>
    )
  }

  const toggle = (key: string) =>
    setCaps((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]))

  const save = () => {
    setPermissions.mutate(
      { id: manager.id, caps },
      {
        onSuccess: () => toast.success('Accès mis à jour', { description: manager.name }),
        onError: () => toast.error('Échec de la mise à jour des accès'),
      },
    )
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[900px]">
      <BackLink />

      <Card className="flex flex-wrap items-center gap-4 rounded-2xl p-6 shadow-soft">
        <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-bold', avatarTint(manager.name))}>
          {manager.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-xl font-extrabold tracking-tight">{manager.name}</h1>
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" /> {manager.email}
          </p>
        </div>
      </Card>

      <Card className="gap-4 rounded-2xl p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-bold">Accès au back-office</h2>
            <p className="text-sm text-muted-foreground">Coche les sections que cette personne peut gérer.</p>
          </div>
          <Button onClick={save} disabled={!dirty || setPermissions.isPending}>
            {setPermissions.isPending && <Loader className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>

        {grouped.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucune capacité disponible.</p>
        ) : (
          <div className="space-y-4">
            {grouped.map(([category, caps_]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {categoryTitle(category)}
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {caps_.map((cap) => (
                    <li key={cap.key} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5">
                      <span className="text-sm">
                        {cap.label}
                        {cap.description && <span className="block text-xs text-muted-foreground">{cap.description}</span>}
                      </span>
                      <Switch checked={caps.includes(cap.key)} onCheckedChange={() => toggle(cap.key)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
