import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Plus, ShieldCheck, Mail, Trash2, Crown, Settings } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { avatarTint } from '@/components/student/parts'
import { adminSections, allAdminCaps, managers as seedManagers, type Manager } from '@/lib/mock'

export const Route = createFileRoute('/admin/gestionnaires')({
  component: AdminGestionnaires,
})

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

function AdminGestionnaires() {
  const [list, setList] = useState<Manager[]>(() => seedManagers.map((m) => ({ ...m })))
  const [openId, setOpenId] = useState<string | null>(null)

  const selected = list.find((m) => m.id === openId) ?? null

  const addManager = (name: string, email: string) => {
    const id = `g-new-${list.length + 1}`
    setList((prev) => [{ id, name, email, active: true, caps: [] }, ...prev])
    setOpenId(id) // ouvre directement la modale des accès
    toast.success('Gestionnaire ajouté', { description: 'Définis ses accès.' })
  }

  const toggleCap = (id: string, cap: string) =>
    setList((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              caps: m.caps.includes(cap) ? m.caps.filter((c) => c !== cap) : [...m.caps, cap],
            }
          : m,
      ),
    )

  const setSection = (id: string, capKeys: string[], on: boolean) =>
    setList((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const without = m.caps.filter((c) => !capKeys.includes(c))
        return { ...m, caps: on ? [...without, ...capKeys] : without }
      }),
    )

  const toggleActive = (id: string) =>
    setList((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))

  const removeManager = (id: string) => {
    setList((prev) => prev.filter((m) => m.id !== id))
    toast.success('Gestionnaire retiré')
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Super admin"
        title="Gestionnaires"
        subtitle="Délègue la gestion du back-office. Ouvre les accès d'une personne pour cocher les sections qu'elle peut gérer."
        actions={<AddManagerDialog onAdd={addManager} />}
      />

      <Card className="flex flex-row items-start gap-3 border-dashed bg-secondary/40 p-4">
        <Crown className="size-5 shrink-0 text-amber" />
        <p className="text-sm text-muted-foreground">
          Le <span className="font-semibold text-foreground">super admin</span> conserve tous les
          accès. Un gestionnaire accède toujours au tableau de bord ; il ne gère que les sections
          cochées dans ses accès. Maquette — modifications non persistées.
        </p>
      </Card>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className={THEAD}>
                <th className={TH}>Gestionnaire</th>
                <th className={TH}>Accès</th>
                <th className={TH}>Statut</th>
                <th className={cn(TH, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((m) => (
                <ManagerRow
                  key={m.id}
                  manager={m}
                  onOpen={() => setOpenId(m.id)}
                  onToggleActive={() => toggleActive(m.id)}
                  onRemove={() => removeManager(m.id)}
                />
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    Aucun gestionnaire. Ajoute une personne pour déléguer une partie du back-office.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PermissionsDialog
        manager={selected}
        onClose={() => setOpenId(null)}
        onToggleCap={toggleCap}
        onSetSection={setSection}
        onToggleActive={toggleActive}
      />
    </div>
  )
}

function ManagerRow({
  manager: m,
  onOpen,
  onToggleActive,
  onRemove,
}: {
  manager: Manager
  onOpen: () => void
  onToggleActive: () => void
  onRemove: () => void
}) {
  const granted = m.caps.filter((c) => allAdminCaps.includes(c)).length
  const sections = adminSections.filter((s) => s.items.some((i) => m.caps.includes(i.key)))

  return (
    <tr className={cn('transition-colors hover:bg-secondary/40', !m.active && 'opacity-60')}>
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
            {granted} accès
          </Badge>
          {sections.map((s) => (
            <Badge key={s.key} variant="secondary" className="bg-secondary text-muted-foreground">
              {s.label}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-5 py-3">
        <label className="flex w-fit items-center gap-2">
          <Switch checked={m.active} onCheckedChange={onToggleActive} />
          <span className={m.active ? 'font-medium' : 'text-muted-foreground'}>
            {m.active ? 'Actif' : 'Suspendu'}
          </span>
        </label>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" onClick={onOpen}>
            <Settings className="size-4" />
            Gérer les accès
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Retirer le gestionnaire"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function PermissionsDialog({
  manager: m,
  onClose,
  onToggleCap,
  onSetSection,
  onToggleActive,
}: {
  manager: Manager | null
  onClose: () => void
  onToggleCap: (id: string, cap: string) => void
  onSetSection: (id: string, capKeys: string[], on: boolean) => void
  onToggleActive: (id: string) => void
}) {
  return (
    <Dialog open={m !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {m && (
          <>
            <DialogHeader>
              <DialogTitle>Accès de {m.name}</DialogTitle>
              <DialogDescription>
                Coche les sections et éléments du back-office que cette personne peut gérer.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-2.5">
              <span className="text-sm">
                Compte{' '}
                <span className="font-semibold">{m.active ? 'actif' : 'suspendu'}</span>
              </span>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={m.active} onCheckedChange={() => onToggleActive(m.id)} />
                {m.active ? 'Actif' : 'Suspendu'}
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {adminSections.map((section) => {
                const keys = section.items.map((i) => i.key)
                const allOn = keys.every((k) => m.caps.includes(k))
                return (
                  <div key={section.key} className="rounded-xl border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-heading text-sm font-bold">{section.label}</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        Tout
                        <Switch
                          size="sm"
                          checked={allOn}
                          onCheckedChange={() => onSetSection(m.id, keys, !allOn)}
                        />
                      </label>
                    </div>
                    <ul className="space-y-1.5">
                      {section.items.map((item) => (
                        <li key={item.key} className="flex items-center justify-between gap-2">
                          <span className="text-sm">{item.label}</span>
                          <Switch
                            size="sm"
                            checked={m.caps.includes(item.key)}
                            onCheckedChange={() => onToggleCap(m.id, item.key)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button>Terminé</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AddManagerDialog({ onAdd }: { onAdd: (name: string, email: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const reset = () => {
    setName('')
    setEmail('')
  }

  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-white text-brand hover:bg-white/90">
          <Plus className="size-4" />
          Ajouter un gestionnaire
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un gestionnaire</DialogTitle>
          <DialogDescription>
            La personne recevra le rôle « gestionnaire ». Tu définiras ses accès juste après.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="mgr-name">Nom complet</Label>
            <Input
              id="mgr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Awa Traoré"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mgr-email">E-mail</Label>
            <Input
              id="mgr-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@mlc-academy.be"
            />
          </div>
          <p className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            Aucun accès n'est accordé par défaut — tu les coches juste après création.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            disabled={!valid}
            onClick={() => {
              onAdd(name.trim(), email.trim())
              setOpen(false)
              reset()
            }}
          >
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
