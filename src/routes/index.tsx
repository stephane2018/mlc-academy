import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Gamepad2,
  CheckSquare,
  Radio,
  Users,
  Heart,
  Trophy,
  Flame,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Crown,
  GraduationCap,
  Zap,
} from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { ThemeToggle } from '@/components/theme'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <Nav />
      <Hero />
      <Pillars />
      <Features />
      <HowItWorks />
      <Gamification />
      <Audience />
      <Pricing />
      <Edge />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  )
}

/* ------------------------------- Nav --------------------------------- */

function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-white shadow-brand-glow">
        M
      </span>
      <span className="font-heading text-lg font-extrabold tracking-tight">MLC Academy</span>
    </Link>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#fonctionnalites" className="transition-colors hover:text-foreground">Fonctionnalités</a>
          <a href="#methode" className="transition-colors hover:text-foreground">Comment ça marche</a>
          <a href="#tarifs" className="transition-colors hover:text-foreground">Tarifs</a>
          <a href="#pour-qui" className="transition-colors hover:text-foreground">Pour qui</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/connexion-parent"
            className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:block"
          >
            Se connecter
          </Link>
          <Link
            to="/onboarding"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ------------------------------- Hero -------------------------------- */

const heroFormulas = [
  { expr: 'a^2 + b^2 = c^2', cls: 'left-[4%] top-[18%] rotate-[-6deg]' },
  { expr: '\\frac{3}{4} + \\frac{1}{2}', cls: 'right-[6%] top-[12%] rotate-[5deg]' },
  { expr: '2x + 5 = 17', cls: 'left-[8%] bottom-[14%] rotate-[4deg]' },
  { expr: '\\pi r^2', cls: 'right-[10%] bottom-[20%] rotate-[-7deg]' },
]

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-grid">
      {/* lueur */}
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
      {/* formules flottantes (desktop) */}
      {heroFormulas.map((f) => (
        <span
          key={f.expr}
          className={cn(
            'pointer-events-none absolute hidden select-none rounded-xl border border-border bg-card/70 px-3 py-1.5 text-base text-muted-foreground shadow-soft backdrop-blur animate-float lg:block',
            f.cls,
          )}
        >
          <Maths expr={f.expr} />
        </span>
      ))}

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            CE1D · Mathématiques · Fédération Wallonie-Bruxelles
          </p>
          <h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Réussis ton CE1D en t&apos;entraînant{' '}
            <span className="text-gradient-brand">comme dans un jeu.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            La plateforme qui transforme tout le programme de maths en missions, XP et défis —
            avec des vidéos, des examens blancs et des cours en direct animés par un professeur
            statutaire WBE.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3.5 font-bold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/eleve/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 font-bold transition-colors hover:bg-secondary"
            >
              <Gamepad2 className="size-5 text-brand" /> Voir la démo
            </Link>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5"><Check className="size-4 text-success" /> 100 % du référentiel FWB</li>
            <li className="flex items-center gap-1.5"><Check className="size-4 text-success" /> Sans donnée personnelle</li>
            <li className="flex items-center gap-1.5"><Check className="size-4 text-success" /> Sans engagement</li>
          </ul>
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-700">
          <HeroQuiz />
        </div>
      </div>
    </section>
  )
}

function HeroQuiz() {
  const options = [
    { id: 'a', label: '4/6' },
    { id: 'b', label: '5/4' },
    { id: 'c', label: '1' },
    { id: 'd', label: '2/3' },
  ]
  const correct = 'b'
  const [picked, setPicked] = useState<string | null>(null)
  const solved = picked === correct

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* chips gamifiées */}
      <div className="absolute -left-4 -top-4 z-10 flex items-center gap-1.5 rounded-full bg-amber px-3 py-1.5 text-sm font-bold text-amber-foreground shadow-float animate-float">
        <Flame className="size-4" /> Série · 7
      </div>
      <div className="absolute -right-3 top-1/3 z-10 grid size-12 place-items-center rounded-2xl bg-card text-2xl shadow-float animate-float [animation-delay:1.5s]">
        🏆
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">
            Échauffement · Fractions
          </span>
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
              solved ? 'bg-success-soft text-success' : 'bg-secondary text-muted-foreground',
            )}
          >
            <Zap className={cn('size-3.5', solved && 'fill-success')} /> {solved ? '+50 XP' : '0 XP'}
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-secondary/60 py-6 text-center text-3xl">
          <Maths expr="\frac{3}{4} + \frac{1}{2} = \;?" display />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {options.map((o, i) => {
            const isPicked = picked === o.id
            const isAnswer = o.id === correct
            const showOk = picked && isAnswer
            const showNo = isPicked && !isAnswer
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setPicked(o.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 p-3 text-left text-lg font-bold transition-all',
                  !picked && 'border-border hover:border-brand/50',
                  showOk && 'border-success bg-success-soft text-success',
                  showNo && 'border-destructive bg-destructive/5 text-destructive',
                  picked && !showOk && !showNo && 'border-border opacity-60',
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary font-mono text-xs">
                  {String.fromCharCode(65 + i)}
                </span>
                {o.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4 min-h-11">
          {solved ? (
            <Link
              to="/onboarding"
              className="flex animate-in fade-in zoom-in-95 items-center justify-center gap-2 rounded-xl bg-brand py-3 font-bold text-white"
            >
              <Sparkles className="size-4" /> Bien joué ! Commence pour de vrai
            </Link>
          ) : picked ? (
            <p className="text-center text-sm font-medium text-muted-foreground">
              Presque — pense au même dénominateur, puis réessaie.
            </p>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Réponds pour gagner tes premiers XP 👆
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Piliers ------------------------------ */

const pillars = [
  { icon: Gamepad2, tone: 'bg-brand text-white', title: 'En autonomie', body: 'Le jeu CE1D, des vidéos courtes par chapitre et des examens blancs corrigés. On apprend en jouant, à son rythme.' },
  { icon: Radio, tone: 'bg-teal text-white', title: 'En direct', body: 'Des cours live en petit groupe (60 min) animés par M. Minko, professeur statutaire WBE. La méthode officielle, expliquée.' },
  { icon: Users, tone: 'bg-amber text-amber-foreground', title: 'Bien accompagné', body: 'Un suivi visible par l’élève, le professeur et les parents : devoirs, résultats, progression, rapports.' },
]

function Pillars() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
      <SectionEyebrow>Trois piliers</SectionEyebrow>
      <h2 className="mt-3 max-w-2xl font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Tout pour réussir le CE1D, au même endroit.
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.title} className="card-hover rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className={cn('grid size-12 place-items-center rounded-2xl', p.tone)}>
              <p.icon className="size-6" />
            </span>
            <h3 className="mt-4 font-heading text-xl font-bold">{p.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------- Features ------------------------------ */

function Features() {
  return (
    <section id="fonctionnalites" className="border-y border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl space-y-16 px-5 py-16 sm:px-8 lg:space-y-24 lg:py-24">
        <FeatureRow
          eyebrow="Le jeu CE1D"
          title="Chaque exercice rapporte des points."
          body="Réponds, gagne de l’XP, débloque des badges et grimpe au classement de ton groupe. La correction est instantanée et bienveillante : se tromper, c’est apprendre."
          points={['100 % du référentiel FWB', 'Correction expliquée en direct', 'XP, niveaux, séries quotidiennes']}
        >
          <VignetteQuiz />
        </FeatureRow>

        <FeatureRow
          reverse
          eyebrow="Suivi & gamification"
          title="On voit ses progrès, on garde la motivation."
          body="Tableau de bord clair, compétences par domaine, classement hebdomadaire et badges à collectionner. L’élève sait toujours quoi travailler ensuite."
          points={['5 compétences suivies', 'Classement remis à zéro chaque lundi', 'Badges et niveaux à débloquer']}
        >
          <VignetteProgress />
        </FeatureRow>

        <FeatureRow
          eyebrow="Cours live & examens blancs"
          title="Un vrai prof, et l’entraînement de l’épreuve."
          body="Des séances en visio en petit groupe avec M. Minko, et des examens blancs chronométrés et corrigés automatiquement pour arriver prêt le jour J."
          points={['Cours live 60 min en groupe', 'Examens blancs chronométrés', 'Replay pour les absents']}
        >
          <VignetteLive />
        </FeatureRow>
      </div>
    </section>
  )
}

function FeatureRow({
  eyebrow, title, body, points, children, reverse,
}: {
  eyebrow: string; title: string; body: string; points: string[]; children: React.ReactNode; reverse?: boolean
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={cn(reverse && 'lg:order-2')}>
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <h3 className="mt-3 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 font-medium">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                <Check className="size-3.5" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn(reverse && 'lg:order-1')}>{children}</div>
    </div>
  )
}

function VignetteQuiz() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-brand">Algèbre · Équation</p>
      <div className="mt-3 rounded-2xl bg-secondary/60 py-5 text-center text-2xl">
        <Maths expr="2x + 5 = 17" display />
      </div>
      <div className="mt-3 space-y-2">
        {['x = 12', 'x = 6', 'x = 11'].map((o, i) => (
          <div
            key={o}
            className={cn(
              'flex items-center gap-2 rounded-xl border-2 p-2.5 font-bold',
              i === 1 ? 'border-success bg-success-soft text-success' : 'border-border',
            )}
          >
            <span className="grid size-6 place-items-center rounded-md bg-secondary font-mono text-xs">
              {i === 1 ? <Check className="size-3.5" /> : String.fromCharCode(65 + i)}
            </span>
            {o}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-sm font-bold text-success">
        <Zap className="size-4 fill-success" /> +10 XP
      </div>
    </div>
  )
}

function VignetteProgress() {
  const skills = [
    { label: 'Nombres', v: 82, c: 'bg-success' },
    { label: 'Algèbre', v: 64, c: 'bg-brand' },
    { label: 'Géométrie', v: 45, c: 'bg-amber' },
  ]
  const board = [
    { r: 1, p: 'TomTom', a: '🐼', pts: 2140 },
    { r: 2, p: 'Léa_2012', a: '🦊', pts: 1980 },
    { r: 5, p: 'MaxLeBg', a: '🤖', pts: 1240, me: true },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
        <p className="font-heading font-bold">Mes compétences</p>
        <ul className="mt-3 space-y-3">
          {skills.map((s) => (
            <li key={s.label}>
              <div className="flex justify-between text-sm font-medium">
                <span>{s.label}</span>
                <span className="font-mono text-xs">{s.v}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                <div className={cn('h-full rounded-full', s.c)} style={{ width: `${s.v}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
        <p className="flex items-center gap-1.5 font-heading font-bold"><Trophy className="size-4 text-amber" /> Classement</p>
        <ul className="mt-3 space-y-1.5">
          {board.map((b) => (
            <li
              key={b.r}
              className={cn('flex items-center gap-2.5 rounded-xl p-2 text-sm', b.me ? 'bg-brand-soft' : '')}
            >
              <span className="w-5 font-mono text-xs font-bold text-muted-foreground">{b.r}</span>
              <span className="text-lg">{b.a}</span>
              <span className={cn('flex-1 truncate font-semibold', b.me && 'text-brand')}>{b.p}</span>
              <span className="font-mono text-xs font-bold">{b.pts}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function VignetteLive() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col justify-between rounded-3xl border-0 bg-gradient-to-br from-teal to-emerald-600 p-5 text-white shadow-float">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
          <span className="size-2 animate-pulse rounded-full bg-white" /> En direct · 18:00
        </div>
        <div>
          <p className="mt-6 font-heading text-lg font-bold">Fractions & proportions</p>
          <p className="text-sm text-white/80">Groupe A · M. Minko</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-teal">
            <Radio className="size-4" /> Rejoindre
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-float">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <CheckSquare className="size-5" />
        </span>
        <p className="mt-3 font-heading font-bold">Examen blanc CE1D</p>
        <p className="text-sm text-muted-foreground">Chronométré · 20 questions</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[72%] rounded-full bg-brand" />
          </div>
          <span className="font-mono text-sm font-bold">72%</span>
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-success">
          <Check className="size-3.5" /> Validé · +50 XP
        </p>
      </div>
    </div>
  )
}

/* ---------------------------- How it works --------------------------- */

const steps = [
  { n: '01', title: 'Crée ton compte', body: 'Un pseudo, un avatar, c’est tout. Aucun nom réel, aucun email, aucune photo. 100 % anonyme et conforme RGPD.' },
  { n: '02', title: 'Entraîne-toi chaque jour', body: 'Le jeu CE1D, les vidéos, les devoirs de ton prof : une mission par jour, des XP à chaque bonne réponse.' },
  { n: '03', title: 'Réussis le jour J', body: 'Examens blancs, cours live avec M. Minko et suivi parent : tu arrives au CE1D prêt et confiant.' },
]

function HowItWorks() {
  return (
    <section id="methode" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <SectionEyebrow>Comment ça marche</SectionEyebrow>
      <h2 className="mt-3 max-w-2xl font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        Trois étapes, du premier clic au CE1D.
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="font-mono text-4xl font-extrabold text-brand/20">{s.n}</span>
            <h3 className="mt-2 font-heading text-xl font-bold">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------------- Gamification ---------------------------- */

const gameStats = [
  { icon: Zap, label: 'XP à chaque exercice' },
  { icon: Flame, label: 'Séries quotidiennes' },
  { icon: Trophy, label: 'Classement hebdo' },
  { icon: Crown, label: 'Badges & niveaux' },
]

function Gamification() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-indigo-600 to-indigo-800 p-8 text-white sm:p-12">
        <div className="absolute inset-0 bg-grid-strong opacity-60" />
        <div className="relative">
          <SectionEyebrow tone="light">Inspiré des meilleurs</SectionEyebrow>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            La rigueur de Khan Academy, l’addiction de Duolingo.
          </h2>
          <p className="mt-3 max-w-xl text-white/80">
            On a pris ce qui marche dans les meilleures apps et on l’a appliqué au programme officiel
            de maths. Résultat : on révise sans s’en rendre compte.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {gameStats.map((g) => (
              <div key={g.label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
                  <g.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- Audience ------------------------------ */

const audiences = [
  { icon: GraduationCap, tone: 'brand', title: 'Élèves', body: 'Apprendre les maths sans stress, en gagnant des points et en se mesurant à ses amis.', to: '/onboarding', cta: 'Créer mon compte' },
  { icon: Heart, tone: 'amber', title: 'Parents', body: 'Suivre la progression de son enfant, recevoir ses rapports — en lecture seule, en toute sérénité.', to: '/connexion-parent', cta: 'Espace parent' },
  { icon: Users, tone: 'teal', title: 'Professeurs', body: 'Gérer ses groupes, créer des devoirs interactifs et suivre chaque élève depuis un seul tableau de bord.', to: '/prof', cta: 'Espace prof' },
] as const

function Audience() {
  return (
    <section id="pour-qui" className="border-y border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <SectionEyebrow>Pour qui</SectionEyebrow>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Une plateforme, trois points de vue.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {audiences.map((a) => (
            <div key={a.title} className="card-hover flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft">
              <span className={cn(
                'grid size-12 place-items-center rounded-2xl',
                a.tone === 'brand' && 'bg-brand-soft text-brand',
                a.tone === 'amber' && 'bg-amber-soft text-amber-foreground',
                a.tone === 'teal' && 'bg-teal-soft text-teal',
              )}>
                <a.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold">{a.title}</h3>
              <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">{a.body}</p>
              <Link to={a.to} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                {a.cta} <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Pricing ------------------------------ */

const plans = [
  {
    name: 'Découverte', price: 'Gratuit', period: '', tagline: 'Pour tester sans risque',
    features: ['20 questions/jour dans le jeu', '3 vidéos par chapitre', 'Aperçu du tableau de bord'],
    cta: 'Commencer', to: '/onboarding', highlight: false,
  },
  {
    name: 'Premium', price: '9,90 €', period: '/mois', tagline: 'Le plus choisi', badge: 'Populaire',
    features: ['Jeu CE1D complet illimité', 'Toutes les vidéos', 'Examens blancs corrigés', 'Badges & classement', 'Devoirs et suivi'],
    cta: 'Choisir Premium', to: '/onboarding', highlight: true,
  },
  {
    name: 'Famille', price: '14,90 €', period: '/mois', tagline: 'Jusqu’à 3 enfants',
    features: ['3 accès Premium indépendants', 'Tableau de bord parent unifié', 'Suivi de chaque enfant'],
    cta: 'Choisir Famille', to: '/onboarding', highlight: false,
  },
] as const

function Pricing() {
  return (
    <section id="tarifs" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="text-center">
        <SectionEyebrow center>Tarifs</SectionEyebrow>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Le prix d’un café par semaine.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Commence gratuitement, passe à Premium quand tu veux. Sans engagement, résiliable à tout moment.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              'relative flex flex-col rounded-3xl border bg-card p-6 shadow-soft',
              p.highlight ? 'border-brand shadow-brand-glow lg:-mt-3 lg:pb-8' : 'border-border',
            )}
          >
            {'badge' in p && p.badge && (
              <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                {p.badge}
              </span>
            )}
            <p className="font-heading text-lg font-bold">{p.name}</p>
            <p className="text-sm text-muted-foreground">{p.tagline}</p>
            <p className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
              {p.price}
              {p.period && <span className="text-base font-medium text-muted-foreground">{p.period}</span>}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                    <Check className="size-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={p.to}
              className={cn(
                'mt-6 rounded-xl py-3 text-center font-bold transition-colors',
                p.highlight ? 'bg-brand text-white hover:bg-brand/90' : 'border border-border hover:bg-secondary',
              )}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Besoin de cours en direct ? Les <span className="font-semibold text-foreground">cours live en groupe</span>{' '}
        démarrent à 18 € la séance (pack mensuel 59 €).
      </p>
    </section>
  )
}

/* ------------------------------- Edge -------------------------------- */

const edge = [
  'Jeu CE1D 100 % gamifié',
  'Professeur statutaire WBE',
  'Vidéos de révision par chapitre',
  'Examens blancs corrigés',
  'Classement entre élèves',
  'Centré uniquement sur le CE1D',
]

function Edge() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div>
          <SectionEyebrow>Notre différence</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ce qu’aucune autre plateforme belge ne réunit.
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Les sites de profs particuliers sont chers et génériques. Les apps de vidéos n’ont pas de
            prof. MLC Academy combine les deux — et se concentre sur une seule chose : ton CE1D
            de maths.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {edge.map((e) => (
            <li key={e} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Check className="size-4" />
              </span>
              <span className="text-sm font-semibold">{e}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* -------------------------------- FAQ -------------------------------- */

const faq = [
  { q: 'Mon enfant doit-il donner ses données personnelles ?', a: 'Non. L’inscription se fait avec un pseudo et un avatar — aucun nom réel, email ou photo. Les rappels arrivent dans l’app (et en notification sur le téléphone si l’app est installée). L’email du parent, facultatif, sert à recevoir les rapports et alertes.' },
  { q: 'Comment se passent les cours en direct ?', a: 'En petit groupe (minimum 5 élèves), des séances de 60 minutes en visioconférence animées par M. Minko, professeur statutaire WBE. Un replay est disponible pour les absents.' },
  { q: 'Pour quel niveau ?', a: 'Le CE1D Mathématiques, et le Tronc Commun S1, S2 et S3 de la Fédération Wallonie-Bruxelles.' },
  { q: 'Puis-je résilier facilement ?', a: 'Oui, à tout moment et sans frais. L’offre Découverte reste gratuite tant que vous le souhaitez.' },
]

function Faq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
      <SectionEyebrow center>Questions fréquentes</SectionEyebrow>
      <h2 className="mt-3 text-center font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        On répond avant que vous demandiez.
      </h2>
      <div className="mt-10 space-y-3">
        {faq.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 shadow-soft">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-heading font-bold marker:content-none">
              {f.q}
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-transform group-open:rotate-45">
                <span className="text-lg leading-none">+</span>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------- Final CTA ----------------------------- */

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-float">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="relative mx-auto max-w-xl">
          <div className="mx-auto mb-4 flex justify-center gap-1 text-2xl">🔥 🏆 ⚡</div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Prêt à réussir ton CE1D ?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Crée ton compte en 30 secondes et gagne tes premiers XP aujourd’hui.
          </p>
          <Link
            to="/onboarding"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-brand px-7 py-4 font-bold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5"
          >
            Commencer gratuitement <ArrowRight className="size-5" />
          </Link>
          <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" /> Sans donnée personnelle · sans engagement
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Footer ------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              La plateforme d’entraînement au CE1D Mathématiques. Par Léopold Minko, professeur
              statutaire WBE.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol title="Produit" links={[['Fonctionnalités', '#fonctionnalites'], ['Tarifs', '#tarifs'], ['Pour qui', '#pour-qui']]} />
            <FooterCol
              title="Démo des espaces"
              routes={[['Élève', '/eleve/dashboard'], ['Professeur', '/prof'], ['Parent', '/connexion-parent'], ['Admin', '/admin']]}
            />
            <FooterCol title="Légal" routes={[['Confidentialité', '/confidentialite'], ['CGU', '/cgu']]} />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 MLC Academy · mathslaclasse.com</span>
          <span className="font-mono">academy.mathslaclasse.com</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title, links, routes,
}: {
  title: string
  links?: [string, string][]
  routes?: [string, string][]
}) {
  return (
    <div>
      <p className="font-heading text-sm font-bold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links?.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="transition-colors hover:text-foreground">{label}</a>
          </li>
        ))}
        {routes?.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="transition-colors hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------ Shared ------------------------------- */

function SectionEyebrow({
  children, center, tone = 'brand',
}: {
  children: React.ReactNode; center?: boolean; tone?: 'brand' | 'light'
}) {
  return (
    <p
      className={cn(
        'font-mono text-xs font-semibold uppercase tracking-[0.22em]',
        tone === 'light' ? 'text-white/70' : 'text-brand',
        center && 'text-center',
      )}
    >
      {children}
    </p>
  )
}
