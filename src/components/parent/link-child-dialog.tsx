import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Link2 } from '@/components/icons'
import { ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useLinkChild } from '@/hooks/use-parent'

/**
 * Bouton + dialog : un parent déjà connecté rattache un enfant via son code de
 * liaison, sans repasser par l'écran de connexion.
 */
export function LinkChildDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const link = useLinkChild()

  const valid = /^MLC-[A-Z0-9]{3,}$/i.test(code.trim())

  function submit() {
    if (!valid || link.isPending) return
    link.mutate(code, {
      onSuccess: () => {
        toast.success('Enfant rattaché à votre compte')
        setOpen(false)
        setCode('')
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError && err.status === 400
            ? 'Code invalide ou expiré.'
            : 'Liaison impossible. Réessayez.',
        )
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-xl">
            <Link2 className="size-4" /> Lier mon enfant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lier mon enfant</DialogTitle>
          <DialogDescription>
            Votre enfant génère un code de liaison depuis son espace (profil élève), puis vous le
            saisissez ici. Il expire après quelques minutes.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="link-code">Code de liaison</Label>
            <Input
              id="link-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MLC-7K2"
              autoComplete="off"
              className="text-center font-mono text-lg uppercase tracking-[0.3em]"
            />
            <p className="text-xs text-muted-foreground">
              Format <span className="font-mono">MLC-XXX</span>.
            </p>
          </div>
          <Button type="submit" disabled={!valid || link.isPending} className="w-full">
            <Link2 className="size-4" /> {link.isPending ? 'Liaison…' : 'Lier mon enfant'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
