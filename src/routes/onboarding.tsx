import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, ShieldCheck, AlertCircle } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

const avatars = ['🤖', '🦊', '🚀', '🐱', '🐼', '🦁', '🐸', '🦉', '🐯', '🐧', '🦄', '🐙']
const levels = ['CE1D', 'S1', 'S2', 'S3']
const STEPS = ['Pseudo', 'Avatar', 'Mot de passe', 'Niveau', 'Groupe']

function OnboardingPage() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Panneau gauche (desktop only) : réassurance */}
      <aside className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand to-indigo-600 p-12 text-white lg:flex">
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
  const [step, setStep] = useState(0)
  const [pseudo, setPseudo] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [level, setLevel] = useState<string | null>(null)
  const [groupCode, setGroupCode] = useState('')

  const passwordMismatch = confirm.length > 0 && password !== confirm
  const isLast = step === STEPS.length - 1

  const canNext = (() => {
    switch (step) {
      case 0:
        return pseudo.trim().length >= 3 && pseudo.trim().length <= 16
      case 1:
        return avatar !== null
      case 2:
        return password.length >= 4 && password === confirm
      case 3:
        return level !== null
      default:
        return true
    }
  })()

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
            <Label htmlFor="pwd">Mot de passe</Label>
            <Input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
            <Label htmlFor="pwd2">Confirme le mot de passe</Label>
            <Input
              id="pwd2"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••"
              aria-invalid={passwordMismatch}
            />
            {passwordMismatch && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="size-4" /> Les mots de passe ne correspondent pas.
              </p>
            )}
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
          <Button asChild size="lg" className="flex-1 rounded-xl text-base">
            <Link to="/eleve/dashboard">
              <Check className="size-5" /> Créer mon compte
            </Link>
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
  return (
    <div className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">Se connecter</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Content de te revoir ! Entre tes identifiants.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-pseudo">Pseudo</Label>
          <Input id="login-pseudo" placeholder="MaxLeBg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-pwd">Mot de passe</Label>
          <Input id="login-pwd" type="password" placeholder="••••••" />
        </div>
      </div>

      <Button asChild size="lg" className="mt-6 w-full rounded-xl text-base">
        <Link to="/eleve/dashboard">Se connecter</Link>
      </Button>

      <button
        type="button"
        onClick={onSwitchSignup}
        className="mt-4 text-center text-sm font-semibold text-brand hover:underline"
      >
        Pas encore de compte ? Crée-en un
      </button>
    </div>
  )
}
