import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  Link2,
  Lock,
  ShieldCheck,
} from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Public visé : élève (pseudo + code) vs adulte parent/prof/admin (email + mot de passe). */
type Audience = 'eleve' | 'autre'
/** Sous-mode du parcours adulte. */
type Mode = 'login' | 'signup' | 'link'

export const Route = createFileRoute('/connexion-parent')({
  // `?mode=link` (ou signup/login) ouvre directement le parcours adulte sur le bon onglet,
  // ex. depuis « Lier mon enfant » du dashboard parent.
  validateSearch: (search: Record<string, unknown>): { mode?: Mode } => {
    const m = search.mode
    return m === 'login' || m === 'signup' || m === 'link' ? { mode: m } : {}
  },
  component: ConnexionPage,
})

/** Contenu du panneau gauche (desktop) selon le public. */
const ASIDE = {
  eleve: {
    Icon: GraduationCap,
    eyebrow: 'Espace élève',
    title: "Réviser en s'amusant",
    intro:
      'Reprends ta progression, gagne des points et relève des défis — sans aucune donnée personnelle.',
    points: [
      'Gagne des points et débloque des badges',
      'Progresse à ton rythme, matière par matière',
      'Juste un pseudo et un code : pas d’email',
    ],
  },
  autre: {
    Icon: ShieldCheck,
    eyebrow: 'Parent · Professeur · Admin',
    title: 'Accédez à votre espace',
    intro:
      'Connectez-vous avec votre adresse email. Vous êtes redirigé automatiquement vers l’espace correspondant à votre rôle.',
    points: [
      'Suivez la progression en temps réel',
      'Rapports et tableaux de bord clairs',
      'Accès sécurisé selon votre rôle',
    ],
  },
} as const

function ConnexionPage() {
  const { mode: initialMode } = Route.useSearch()
  // Un `mode` adulte dans l'URL ouvre directement le parcours « autre » sur cet onglet.
  const [audience, setAudience] = useState<Audience>(initialMode ? 'autre' : 'eleve')
  const [mode, setMode] = useState<Mode>(initialMode ?? 'login')
  const aside = ASIDE[audience]

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Panneau gauche (desktop) : pitch adapté au public */}
      <aside className="hidden w-1/2 flex-col justify-between bg-brand-gradient p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15 font-heading text-2xl font-extrabold text-white">
            M
          </span>
          <span className="font-heading text-base font-bold">MLC Academy</span>
        </div>

        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <aside.Icon className="size-4" /> {aside.eyebrow}
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight">{aside.title}</h2>
          <p className="mt-3 text-lg text-white/80">{aside.intro}</p>
          <ul className="mt-7 space-y-3">
            {aside.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check className="size-4" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-white/10 p-4">
          <Lock className="mt-0.5 size-5 shrink-0 text-white" />
          <p className="text-sm leading-snug text-white/85">
            {audience === 'eleve' ? (
              <>
                Connexion <strong>au pseudo et au code</strong> : aucune donnée personnelle n&apos;est
                demandée à l&apos;élève (RGPD mineur).
              </>
            ) : (
              <>
                Accès <strong>sécurisé</strong> : vos droits dépendent de votre rôle (parent en lecture
                seule, professeur, administrateur).
              </>
            )}
          </p>
        </div>
      </aside>

      {/* Panneau droit : choix du public + formulaire */}
      <div className="flex min-h-dvh w-full flex-col lg:w-1/2 lg:items-center lg:justify-center">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background sm:border-x sm:border-border lg:min-h-0 lg:border-0">
          {/* Header */}
          <header className="flex items-center justify-between gap-2 px-5 pt-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-white">
                M
              </span>
              <span className="font-heading text-sm font-bold text-foreground">MLC Academy</span>
            </Link>
          </header>

          <div className="flex flex-1 flex-col px-5 pb-8 pt-6">
            {/* Choix du public : élève vs autre */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
              {(
                [
                  ['eleve', 'Je suis un élève'],
                  ['autre', 'Je ne suis pas un élève'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAudience(value)}
                  className={cn(
                    'rounded-lg px-2 py-2 text-sm font-semibold transition-colors',
                    audience === value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {audience === 'eleve' ? (
              <div className="flex-1 pt-7">
                <StudentLoginForm />
              </div>
            ) : (
              <>
                {/* Sous-bascule du parcours adulte */}
                <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
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
                  {mode === 'link' && <LinkChildForm onNeedLogin={() => setMode('login')} />}
                </div>

                {/* Mention email adulte */}
                <div className="mt-6 flex items-start gap-2 rounded-xl bg-info-soft p-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-info" />
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Les comptes parent / professeur / administrateur utilisent une adresse email
                    (donnée d&apos;adulte).{' '}
                    <Link to="/confidentialite" className="font-semibold text-brand hover:underline">
                      Confidentialité
                    </Link>
                    .
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Connexion élève : pseudo + code PIN à 6 chiffres. */
function StudentLoginForm() {
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
    <form onSubmit={onSubmit}>
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

      <Link
        to="/onboarding"
        className="mt-4 block text-center text-sm font-semibold text-brand hover:underline"
      >
        Pas encore de compte ? Crée-en un
      </Link>
    </form>
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
      // Le garde de route redirige vers la home du bon rôle (parent / prof / admin).
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
        Parent, professeur ou administrateur.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@email.com"
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

function LinkChildForm({ onNeedLogin }: { onNeedLogin: () => void }) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [code, setCode] = useState('')
  const valid = /^MLC-[A-Z0-9]{3,}$/i.test(code.trim())

  const linkMutation = useMutation({
    mutationFn: () => authService.linkChild(code.trim().toUpperCase()),
    onSuccess: async () => {
      // Rafraîchit la liste des enfants rattachés (dashboard parent).
      await qc.invalidateQueries({ queryKey: ['parent'] })
      toast.success('Enfant lié à votre compte')
      await navigate({ to: '/parent' })
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError && err.status === 400
          ? 'Code invalide ou expiré.'
          : 'Liaison impossible. Réessayez.'
      toast.error(msg)
    },
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || linkMutation.isPending) return
    linkMutation.mutate()
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight">Lier mon enfant</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Votre enfant génère un code de liaison depuis son espace, dans son profil.
      </p>

      {/* La liaison écrit sur le compte parent → il faut être connecté. */}
      {!session && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-soft p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber" />
          <p className="text-xs leading-snug text-muted-foreground">
            Connectez-vous d'abord à votre compte parent.{' '}
            <button type="button" onClick={onNeedLogin} className="font-semibold text-brand hover:underline">
              Se connecter
            </button>
            .
          </p>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <Label htmlFor="link-code">Code de liaison</Label>
        <Input
          id="link-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="MLC-7K2"
          className="font-mono uppercase tracking-widest"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Format <span className="font-mono">MLC-XXX</span>. Il expire après quelques minutes pour
          votre sécurité.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!valid || !session || linkMutation.isPending}
        className="mt-6 w-full rounded-xl text-base"
      >
        <Link2 className="size-5" /> {linkMutation.isPending ? 'Liaison…' : 'Lier'}
      </Button>
    </form>
  )
}
