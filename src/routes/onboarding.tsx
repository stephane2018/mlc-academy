import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check, ShieldCheck, AlertCircle } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { authService } from '@/services/auth'
import { ApiError } from '@/lib/api-client'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

const avatars = ['🤖', '🦊', '🚀', '🐱', '🐼', '🦁', '🐸', '🦉', '🐯', '🐧', '🦄', '🐙']
const levels = ['CE1D', 'S1', 'S2', 'S3']
const STEPS = ['Pseudo', 'Avatar', 'Code secret', 'Niveau', 'Groupe']

function OnboardingPage() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Panneau gauche (desktop only) : réassurance */}
      <aside className="hidden w-1/2 flex-col justify-between bg-brand-gradient p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 font-heading text-2xl font-extrabold text-white">
            M
          </span>
          <span className="font-heading text-base font-bold">MLC Academy</span>
        </div>

        <div className="max-w-sm">
          <h2 className="font-heading text-4xl font-extrabold leading-tight">
            Réussis ton CE1D
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Le jeu, les vidéos et les cours live pour progresser en maths, à ton rythme.
          </p>
          <div className="mt-6 flex -space-x-2">
            {['🤖', '🦊', '🚀', '🐼', '🦁', '🦉'].map((a) => (
              <span
                key={a}
                className="grid size-10 place-items-center rounded-full bg-white/15 text-xl ring-2 ring-brand"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-white/10 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-white" />
          <p className="text-sm leading-snug text-white/85">
            Aucune donnée personnelle : pas de nom réel, pas d'email, pas de photo.
          </p>
        </div>
      </aside>

      {/* Panneau droit : formulaire */}
      <div className="flex min-h-dvh w-full flex-col lg:w-1/2 lg:items-center lg:justify-center">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background sm:border-x sm:border-border lg:min-h-0 lg:border-0">
          {/* Header (mobile/tablette) */}
          <header className="flex items-center gap-2 px-4 pt-6 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-white">
              M
            </span>
            <span className="font-heading text-sm font-bold text-foreground">
              MLC Academy
            </span>
          </header>

          {mode === 'signup' ? (
            <SignupFlow onSwitchLogin={() => setMode('login')} />
          ) : (
            <LoginForm onSwitchSignup={() => setMode('signup')} />
          )}
        </div>
      </div>
    </div>
  )
}

function SignupFlow({ onSwitchLogin }: { onSwitchLogin: () => void }) {
  const { signInStudent } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [pseudo, setPseudo] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [level, setLevel] = useState<string | null>(null)
  const [groupCode, setGroupCode] = useState('')
  const [loading, setLoading] = useState(false)

  const pinMismatch = confirm.length === 6 && pin !== confirm
  const isLast = step === STEPS.length - 1

  const canNext = (() => {
    switch (step) {
      case 0:
        return pseudo.trim().length >= 3 && pseudo.trim().length <= 16
      case 1:
        return avatar !== null
      case 2:
        return /^\d{6}$/.test(pin) && pin === confirm
      case 3:
        return level !== null
      default:
        return true
    }
  })()

  async function submit() {
    setLoading(true)
    try {
      await authService.signupStudent({
        pseudo: pseudo.trim(),
        pin,
        classCode: level ?? undefined,
        avatar: avatar ?? undefined,
      })
      await signInStudent(pseudo.trim(), pin) // connexion automatique
      await navigate({ to: '/eleve/dashboard' })
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? 'Ce pseudo est déjà pris.'
          : 'Inscription impossible. Réessaie.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col px-5 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Crée ton compte</h1>
        <button
          type="button"
          onClick={onSwitchLogin}
          className="text-sm font-semibold text-brand hover:underline"
        >
          Déjà un compte ?
        </button>
      </div>

      {/* Barre de progression d'étapes */}
      <div className="mt-4 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= step ? 'bg-brand' : 'bg-secondary',
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-muted-foreground">
        Étape {step + 1}/{STEPS.length} · {STEPS[step]}
      </p>

      <div className="flex-1 pt-6">
        {step === 0 && (
          <div className="space-y-3">
            <Label htmlFor="pseudo">Choisis un pseudo</Label>
            <Input
              id="pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="MaxLeBg"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              3 à 16 caractères, lettres et chiffres. Pas de vrai nom.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <Label>Choisis ton avatar</Label>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={cn(
                    'grid aspect-square place-items-center rounded-2xl bg-secondary text-3xl transition-all',
                    avatar === a ? 'bg-brand-soft ring-2 ring-brand' : 'hover:bg-secondary/70',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Label htmlFor="pin">Choisis un code secret (6 chiffres)</Label>
            <Input
              id="pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="text-center text-2xl font-bold tracking-[0.5em]"
            />
            <Label htmlFor="pin2">Confirme ton code</Label>
            <Input
              id="pin2"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              aria-invalid={pinMismatch}
              className="text-center text-2xl font-bold tracking-[0.5em]"
            />
            {pinMismatch && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="size-4" /> Les deux codes ne correspondent pas.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Facile à retenir, comme un code de téléphone. Tes parents pourront le réinitialiser si tu l'oublies.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <Label>Quel est ton niveau ?</Label>
            <div className="grid grid-cols-2 gap-3">
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={cn(
                    'rounded-2xl border-2 py-6 font-heading text-xl font-bold transition-all',
                    level === l
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-border bg-card hover:border-brand/40',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <Label htmlFor="group">Code de groupe (facultatif)</Label>
            <Input
              id="group"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Ex. CE1D-MINKO"
            />
            <p className="text-xs text-muted-foreground">
              Donné par ton prof si tu rejoins une classe. Tu peux le laisser vide.
            </p>
          </div>
        )}
      </div>

      {/* RGPD */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
        <p className="text-[11px] leading-snug text-muted-foreground">
          Aucune donnée personnelle : pas de nom réel, pas d'email, pas de photo.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 py-5">
        {step > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="size-5" /> Précédent
          </Button>
        )}
        {isLast ? (
          <Button size="lg" disabled={loading} onClick={submit} className="flex-1 rounded-xl text-base">
            <Check className="size-5" /> {loading ? 'Création…' : 'Créer mon compte'}
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={!canNext}
            className="flex-1 rounded-xl text-base"
            onClick={() => setStep((s) => s + 1)}
          >
            Suivant <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

function LoginForm({ onSwitchSignup }: { onSwitchSignup: () => void }) {
  const { signInStudent } = useAuth()
  const navigate = useNavigate()
  const [pseudo, setPseudo] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(pin)) return
    setLoading(true)
    try {
      await signInStudent(pseudo.trim(), pin)
      await navigate({ to: '/eleve/dashboard' })
    } catch {
      toast.error('Pseudo ou code incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">Se connecter</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Content de te revoir ! Entre ton pseudo et ton code.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-pseudo">Pseudo</Label>
          <Input
            id="login-pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="MaxLeBg"
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-pin">Code secret</Label>
          <Input
            id="login-pin"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            autoComplete="off"
            className="text-center text-2xl font-bold tracking-[0.5em]"
            required
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full rounded-xl text-base">
        {loading ? 'Connexion…' : 'Se connecter'}
      </Button>

      <button
        type="button"
        onClick={onSwitchSignup}
        className="mt-4 text-center text-sm font-semibold text-brand hover:underline"
      >
        Pas encore de compte ? Crée-en un
      </button>
    </form>
  )
}
