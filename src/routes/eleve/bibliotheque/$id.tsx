import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { RailLayout } from '@/components/blocks'
import { TYPE_META, ResourceCover } from '@/components/student/resource-card'
import { Math as Maths } from '@/components/math'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Maximize,
  Download,
  CheckCircle2,
  Bookmark,
  Clock,
  Lock,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  getLibraryItem,
  library,
  domainLabels,
  type LibraryItem,
} from '@/lib/mock'

export const Route = createFileRoute('/eleve/bibliotheque/$id')({
  component: ReaderPage,
})

function ReaderPage() {
  const { id } = useParams({ from: '/eleve/bibliotheque/$id' })
  const item = getLibraryItem(id)

  if (!item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-heading text-xl font-bold">Ressource introuvable</p>
        <Button asChild>
          <Link to="/eleve/bibliotheque">Retour à la bibliothèque</Link>
        </Button>
      </div>
    )
  }

  const related = library
    .filter((r) => r.domain === item.domain && r.id !== item.id)
    .slice(0, 4)

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <Link
        to="/eleve/bibliotheque"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Bibliothèque
      </Link>

      <RailLayout rail={<ReaderRail item={item} related={related} />}>
        <Viewer item={item} />

        <div>
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', TYPE_META[item.type].chip)}>
            {domainLabels[item.domain]} · {item.chapter}
          </span>
          <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
            {item.title}
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </RailLayout>
    </div>
  )
}

/* --------------------------- Visionneuses ---------------------------- */

function Viewer({ item }: { item: LibraryItem }) {
  if (item.type === 'video') return <VideoPlayer item={item} />
  if (item.type === 'exercice') return <ExerciseIntro item={item} />
  if (item.type === 'pdf') return <PdfViewer item={item} />
  return <FicheViewer item={item} />
}

function VideoPlayer({ item }: { item: LibraryItem }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(item.progress)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPlaying(false)
            return 100
          }
          return p + 0.6
        })
      }, 120)
    }
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing])

  const m = TYPE_META.video
  const total = item.duration ?? '0:00'
  const elapsed = formatElapsed(progress, total)

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-float">
      {/* Scène vidéo */}
      <div className={cn('relative isolate flex aspect-video items-center justify-center bg-gradient-to-br', m.cover)}>
        <m.Icon className="absolute -bottom-8 -right-6 size-48 text-white/10" strokeWidth={1.5} />
        {item.premium && (
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            <Lock className="size-3.5" /> Premium
          </span>
        )}
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="group grid size-20 place-items-center rounded-full bg-white/90 text-brand shadow-xl transition-transform duration-200 hover:scale-105"
          aria-label={playing ? 'Pause' : 'Lecture'}
        >
          {playing ? <Pause className="size-9" /> : <Play className="size-9 translate-x-1" />}
        </button>
        <p className="absolute bottom-14 left-1/2 -translate-x-1/2 text-sm font-medium text-white/70">
          {playing ? 'Lecture en cours…' : progress >= 100 ? 'Vidéo terminée' : 'Appuie pour lancer la vidéo'}
        </p>
      </div>

      {/* Barre de contrôle */}
      <div className="bg-slate-950 px-4 pb-4 pt-2 text-white">
        <div className="group h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2.5 flex items-center gap-4 text-white/80">
          <button type="button" onClick={() => setPlaying((v) => !v)} className="transition-colors hover:text-white">
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <Volume2 className="size-5" />
          <span className="text-xs font-medium tabular-nums">
            {elapsed} / {total}
          </span>
          <span className="flex-1" />
          <Maximize className="size-5" />
        </div>
      </div>
    </div>
  )
}

function ExerciseIntro({ item }: { item: LibraryItem }) {
  const m = TYPE_META.exercice
  return (
    <div className={cn('relative isolate overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-center text-white shadow-float sm:p-12', m.cover)}>
      <m.Icon className="absolute -right-6 -top-6 size-40 text-white/10" strokeWidth={1.5} />
      <span className="grid size-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
        <m.Icon className="size-8" />
      </span>
      <h2 className="mx-auto mt-4 font-heading text-2xl font-extrabold">Prêt à t'entraîner ?</h2>
      <p className="mx-auto mt-1.5 max-w-md text-white/80">
        {item.questions} questions corrigées automatiquement. Tu gagnes de l'XP à chaque bonne réponse.
      </p>
      <Button asChild size="lg" className="mt-6 rounded-xl bg-white text-teal hover:bg-white/90">
        <Link to="/eleve/jeu">Commencer l'exercice</Link>
      </Button>
    </div>
  )
}

function PdfViewer({ item }: { item: LibraryItem }) {
  return (
    <div className="rounded-3xl border border-border bg-secondary/50 p-4 shadow-float sm:p-6">
      {/* Feuille */}
      <div className="mx-auto max-w-xl space-y-3 rounded-xl bg-white p-6 shadow-soft sm:p-8">
        <div className="h-3 w-2/3 rounded bg-foreground/80" />
        <div className="h-2 w-1/3 rounded bg-rose-400" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={cn('h-2 rounded bg-muted-foreground/20', i % 3 === 2 ? 'w-1/2' : 'w-full')} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground">
          Aperçu du document · {item.pages} pages
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button onClick={() => toast.success('Téléchargement du PDF…')} className="rounded-xl">
          <Download className="size-4" /> Télécharger le PDF
        </Button>
        <Button variant="outline" onClick={() => toast.success('Marqué comme lu')} className="rounded-xl">
          <CheckCircle2 className="size-4" /> Marquer comme lu
        </Button>
      </div>
    </div>
  )
}

function FicheViewer({ item }: { item: LibraryItem }) {
  return (
    <Card className="gap-0 rounded-3xl p-6 shadow-float sm:p-8">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber-foreground">
        Fiche mémo
      </span>
      <h2 className="mt-3 font-heading text-xl font-extrabold">{item.title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/80">
        <div>
          <p className="font-heading font-bold text-foreground">À retenir</p>
          <p className="mt-1">
            Une fraction <Maths expr="\frac{a}{b}" /> représente une division : {item.description}
          </p>
        </div>
        <div className="rounded-xl bg-secondary/60 p-4">
          <p className="font-semibold text-foreground">Exemple</p>
          <Maths expr="\frac{3}{4} + \frac{1}{2} = \frac{3}{4} + \frac{2}{4} = \frac{5}{4}" display className="mt-2 text-lg" />
        </div>
        <ul className="list-inside list-disc space-y-1">
          <li>Simplifier en divisant par le même nombre.</li>
          <li>Mettre au même dénominateur pour additionner.</li>
          <li>Toujours vérifier le résultat.</li>
        </ul>
      </div>
      <Button onClick={() => toast.success('Marqué comme lu')} variant="outline" className="mt-6 w-fit rounded-xl">
        <CheckCircle2 className="size-4" /> Marquer comme lu
      </Button>
    </Card>
  )
}

/* ------------------------------- Rail -------------------------------- */

function ReaderRail({ item, related }: { item: LibraryItem; related: LibraryItem[] }) {
  const metaRows: { label: string; value: string }[] = [
    { label: 'Type', value: TYPE_META[item.type].label },
    { label: 'Chapitre', value: item.chapter },
    { label: 'Domaine', value: domainLabels[item.domain] },
  ]
  if (item.type === 'video') metaRows.push({ label: 'Durée', value: item.duration ?? '' })
  if (item.type === 'exercice') metaRows.push({ label: 'Questions', value: String(item.questions) })
  if (item.type !== 'video' && item.type !== 'exercice') metaRows.push({ label: 'Pages', value: String(item.pages) })

  return (
    <>
      <Card className="gap-0 rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold">Détails</p>
          <button type="button" className="text-muted-foreground transition-colors hover:text-brand" aria-label="Enregistrer">
            <Bookmark className="size-5" />
          </button>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          {metaRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-semibold">{r.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Progression</dt>
            <dd className="font-semibold text-brand">{item.progress}%</dd>
          </div>
        </dl>
        {item.premium && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-soft px-3 py-2 text-xs font-semibold text-amber-foreground">
            <Lock className="size-4" /> Contenu Premium
          </div>
        )}
      </Card>

      {related.length > 0 && (
        <Card className="gap-0 rounded-2xl p-4 shadow-soft">
          <p className="mb-3 font-heading font-bold">À suivre</p>
          <ul className="space-y-2.5">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to="/eleve/bibliotheque/$id"
                  params={{ id: r.id }}
                  className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-secondary"
                >
                  <ResourceCover item={r} className="h-12 w-20 shrink-0" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight">{r.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      {r.type === 'video' && <Clock className="size-3" />}
                      {TYPE_META[r.type].label}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}

/* ------------------------------ Utils -------------------------------- */

function formatElapsed(progress: number, total: string): string {
  const [m, s] = total.split(':').map(Number)
  const totalSec = (m || 0) * 60 + (s || 0)
  const cur = Math.round((progress / 100) * totalSec)
  return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`
}
