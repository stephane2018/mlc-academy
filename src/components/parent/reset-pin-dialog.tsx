import { useState } from 'react'
import { toast } from 'sonner'
import { Lock } from '@/components/icons'
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
import { useResetChildPin } from '@/hooks/use-parent'

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 6)

/** Bouton + dialog : le parent définit un nouveau code PIN pour son enfant. */
export function ResetPinDialog({ childId, childName }: { childId: string; childName: string }) {
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const reset = useResetChildPin()

  const valid = /^\d{6}$/.test(pin) && pin === confirm

  function submit() {
    if (!valid) return
    reset.mutate(
      { childId, pin },
      {
        onSuccess: () => {
          toast.success('Nouveau code enregistré', { description: `Communiquez-le à ${childName}.` })
          setOpen(false)
          setPin('')
          setConfirm('')
        },
        onError: () => toast.error('Échec de la réinitialisation.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Lock className="size-4" /> Réinitialiser le code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau code de connexion</DialogTitle>
          <DialogDescription>
            Choisissez un code à 6 chiffres pour {childName}, puis communiquez-le-lui. Il remplacera l'ancien.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="new-pin">Nouveau code</Label>
            <Input
              id="new-pin"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(onlyDigits(e.target.value))}
              placeholder="••••••"
              className="text-center text-2xl font-bold tracking-[0.5em]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pin2">Confirmer</Label>
            <Input
              id="new-pin2"
              inputMode="numeric"
              maxLength={6}
              value={confirm}
              onChange={(e) => setConfirm(onlyDigits(e.target.value))}
              placeholder="••••••"
              className="text-center text-2xl font-bold tracking-[0.5em]"
            />
          </div>
        </div>
        <Button onClick={submit} disabled={!valid || reset.isPending} className="w-full">
          {reset.isPending ? 'Enregistrement…' : 'Enregistrer le code'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
