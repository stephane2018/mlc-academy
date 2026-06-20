import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { authService } from '@/services/auth'
import { ApiError } from '@/lib/api-client'
import {
  AlertCircle,
  ArrowRight,
  Check,
  GraduationCap,
  Heart,
  Link2,
  Lock,
  ShieldCheck,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/connexion-parent')({
  component: ConnexionParentPage,
})

type Mode = 'login' | 'signup' | 'link'

const reassurances = [
  'Suivez la progression de votre enfant en temps réel',
  'Rapports hebdomadaires par email, sans effort',
  'Lecture seule : aucune donnée pédagogique modifiable',
] as const

function ConnexionParentPage() {
  const [mode, setMode] = useState<Mode>('login')

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Panneau gauche (desktop) : pitch + réassurance */}
      <aside className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand to-indigo-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 font-heading text-2xl font-extrabold text-white">
            M
          </span>
          <span className="font-heading text-base font-bold">MLC Academy</span>
        </div>

        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <Heart className="size-4" /> Espace parent
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight">
            Suivez la progression de votre enfant
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Un tableau de bord clair pour rester proche de ses apprentissages, sans jamais
            perturber son travail.
          </p>
          <ul className="mt-7 space-y-3">
            {reassurances.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check className="size-4" />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
          <Lock className="mt-0.5 size-5 shrink-0 text-white" />
          <p className="text-sm leading-snug text-white/85">
            Accès en <strong>lecture seule</strong> : vous consultez les résultats et le temps de
            travail, mais aucune donnée pédagogique n&apos;est modifiable depuis votre compte.
          </p>
        </div>
      </aside>

      {/* Panneau droit : formulaire */}
      <div className="flex min-h-dvh w-full flex-col lg:w-1/2 lg:items-center lg:justify-center">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background sm:border-x sm:border-border lg:min-h-0 lg:border-0">
          {/* Header */}
          <header className="flex items-center justify-between gap-2 px-5 pt-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-white">
                M
              </span>
              <span className="font-heading text-sm font-bold text-foreground">
                MLC Academy
              </span>
            </Link>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:underline"
            >
              <GraduationCap className="size-4" /> Espace élève
            </Link>
          </header>

          <div className="flex flex-1 flex-col px-5 pb-8 pt-6">
            {/* Bascule de mode */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
              {(
                [
                  ['login', 'Connexion'],
                  ['signup', 'Créer'],
                  ['link', 'Lier'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={cn(
                    'rounded-lg py-2 text-sm font-semibold transition-colors',
                    mode === value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 pt-7">
              {mode === 'login' && <LoginForm />}
              {mode === 'signup' && <SignupForm />}
              {mode === 'link' && <LinkChildForm />}
            </div>

            {/* Mention email adulte */}
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-info-soft p-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-info" />
              <p className="text-[11px] leading-snug text-muted-foreground">
                Le compte parent utilise une adresse email : il s&apos;agit d&apos;une donnée
                d&apos;adulte, sans la restriction RGPD applicable aux comptes mineurs.{' '}
                <Link to="/confidentialite" className="font-semibold text-brand hover:underline">
                  Confidentialité
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
  const { signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithPassword(email, password)
      // Le garde de route /parent redirige vers la bonne home si le rôle diffère.
      await navigate({ to: '/parent' })
    } catch {
      toast.error('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">Se connecter</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Accédez au suivi de votre enfant.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@email.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-pwd">Mot de passe</Label>
          <Input
            id="login-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full rounded-xl text-base">
        {loading ? 'Connexion…' : 'Se connecter'}
      </Button>

      <button
        type="button"
        className="mt-4 block w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Mot de passe oublié ?
      </button>
    </form>
  )
}

function SignupForm() {
  const { signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm
  const valid = email.includes('@') && password.length >= 8 && password === confirm

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    try {
      await authService.signupParent(email, password)
      await signInWithPassword(email, password) // connexion automatique
      await navigate({ to: '/parent' })
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 409
          ? 'Un compte existe déjà avec cet e-mail.'
          : 'Inscription impossible. Réessayez.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">Créer un compte parent</h1>
      <p className="mt-1 text-sm text-muted-foreground">Une adresse email suffit pour démarrer.</p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="su-email">Email</Label>
          <Input
            id="su-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@email.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-pwd">Mot de passe</Label>
          <Input
            id="su-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-pwd2">Confirmer le mot de passe</Label>
          <Input
            id="su-pwd2"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={mismatch}
            required
          />
          {mismatch && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="size-4" /> Les mots de passe ne correspondent pas.
            </p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={!valid || loading} className="mt-6 w-full rounded-xl text-base">
        {loading ? 'Création…' : <>Créer mon compte <ArrowRight className="size-5" /></>}
      </Button>
    </form>
  )
}

function LinkChildForm() {
  const [code, setCode] = useState('')
  const valid = /^MLC-[A-Z0-9]{3,}$/i.test(code.trim())

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">Lier mon enfant</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Votre enfant génère un code de liaison depuis son tableau de bord élève.
      </p>

      <div className="mt-6 space-y-2">
        <Label htmlFor="link-code">Code de liaison</Label>
        <Input
          id="link-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="MLC-7K2"
          className="font-mono uppercase tracking-widest"
        />
        <p className="text-xs text-muted-foreground">
          Format <span className="font-mono">MLC-XXX</span>. Il expire après quelques minutes pour
          votre sécurité.
        </p>
      </div>

      {valid ? (
        <Button asChild size="lg" className="mt-6 w-full rounded-xl text-base">
          <Link to="/parent" onClick={() => toast.success('Enfant lié à votre compte')}>
            <Link2 className="size-5" /> Lier
          </Link>
        </Button>
      ) : (
        <Button size="lg" disabled className="mt-6 w-full rounded-xl text-base">
          <Link2 className="size-5" /> Lier
        </Button>
      )}
    </div>
  )
}
