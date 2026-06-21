import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Download, CheckCircle2, Lock } from '@/components/icons'
import { RailLayout } from '@/components/blocks'
import { TYPE_META } from '@/components/student/resource-card'
import { LibraryResourceCard } from '@/components/student/library-resource-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useResource, useResources, useUpdateProgress } from '@/hooks/use-library'
import { useSubjects } from '@/hooks/use-catalog'
import type { Resource, ResourceDetail } from '@/services/library'

export const Route = createFileRoute('/eleve/bibliotheque/$id')({
  component: ReaderPage,
})

function ReaderPage() {
  const { id } = useParams({ from: '/eleve/bibliotheque/$id' })
  const { data: item, isLoading, isError } = useResource(id)
  const subjectsQuery = useSubjects()
  const allResources = useResources().data ?? []

  if (isLoading) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Chargement…</div>
  }
  if (isError || !item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-heading text-xl font-bold">Ressource introuvable</p>
        <Button asChild>
          <Link to="/eleve/bibliotheque">Retour à la bibliothèque</Link>
        </Button>
      </div>
    )
  }

  const subject = subjectsQuery.data?.find((s) => s.id === item.subjectId)
  const themeName = (item.themeId && subject?.themes.find((t) => t.id === item.themeId)?.name) || 'Général'
  const related = allResources.filter((r) => r.subjectId === item.subjectId && r.themeId === item.themeId && r.id !== item.id).slice(0, 4)

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <Link to="/eleve/bibliotheque" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Bibliothèque
      </Link>

      <RailLayout rail={<ReaderRail item={item} subjectName={subject?.name ?? '—'} themeName={themeName} related={related} subjectColor={subject?.color ?? null} />}>
        <Viewer item={item} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: subject?.color ?? 'var(--brand)' }}>
              {subject?.name ?? '—'}
            </span>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', TYPE_META[item.type].chip)}>
              {themeName}
              {item.chapter ? ` · ${item.chapter}` : ''}
            </span>
          </div>
          <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">{item.title}</h1>
          {item.description && <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{item.description}</p>}
        </div>
      </RailLayout>
    </div>
  )
}

/* --------------------------- Visionneuses ---------------------------- */

function Viewer({ item }: { item: ResourceDetail }) {
  const updateProgress = useUpdateProgress()
  const markDone = () =>
    updateProgress.mutate({ id: item.id, progress: 100 }, { onSuccess: () => toast.success('Marqué comme terminé') })

  if (item.type === 'exercice') {
    const m = TYPE_META.exercice
    return (
      <div className={cn('relative isolate overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-center text-white shadow-float sm:p-12', m.cover)}>
        <m.Icon className="absolute -right-6 -top-6 size-40 text-white/10" strokeWidth={1.5} />
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <m.Icon className="size-8" />
        </span>
        <h2 className="mt-4 font-heading text-2xl font-extrabold">Prêt à t'entraîner ?</h2>
        <p className="mx-auto mt-1.5 max-w-md text-white/80">
          {item.questionCount ? `${item.questionCount} questions corrigées automatiquement. ` : ''}Tu gagnes de l'XP à chaque bonne réponse.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-xl bg-white text-success hover:bg-white/90">
          <Link to="/eleve/jeu">Commencer</Link>
        </Button>
      </div>
    )
  }

  if (item.type === 'video') {
    const m = TYPE_META.video
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-float">
        {item.videoUrl ? (
          <div className="aspect-video w-full">
            <iframe src={item.videoUrl} title={item.title} allowFullScreen className="size-full" />
          </div>
        ) : (
          <div className={cn('grid aspect-video place-items-center bg-gradient-to-br text-white', m.cover)}>
            <p className="text-sm text-white/80">Vidéo bientôt disponible</p>
          </div>
        )}
        <div className="flex justify-end p-3">
          <Button variant="secondary" size="sm" onClick={markDone} disabled={updateProgress.isPending}>
            <CheckCircle2 className="size-4" /> Marquer comme vue
          </Button>
        </div>
      </div>
    )
  }

  // pdf / fiche
  return (
    <div className="rounded-3xl border border-border bg-secondary/50 p-4 shadow-float sm:p-6">
      {item.fileUrl ? (
        <iframe src={item.fileUrl} title={item.title} className="h-[60vh] w-full rounded-xl bg-white" />
      ) : (
        <div className="grid h-48 place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          {item.premium ? (
            <span className="flex items-center gap-2"><Lock className="size-4" /> Contenu Premium</span>
          ) : (
            'Document bientôt disponible'
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {item.fileUrl && (
          <Button asChild className="rounded-xl">
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
              <Download className="size-4" /> Télécharger
            </a>
          </Button>
        )}
        <Button variant="outline" onClick={markDone} disabled={updateProgress.isPending} className="rounded-xl">
          <CheckCircle2 className="size-4" /> Marquer comme lu
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------- Rail -------------------------------- */

function ReaderRail({
  item,
  subjectName,
  themeName,
  subjectColor,
  related,
}: {
  item: ResourceDetail
  subjectName: string
  themeName: string
  subjectColor: string | null
  related: Resource[]
}) {
  const metaRows: { label: string; value: string }[] = [
    { label: 'Type', value: TYPE_META[item.type].label },
    { label: 'Matière', value: subjectName },
    { label: 'Thème', value: themeName },
  ]
  if (item.chapter) metaRows.push({ label: 'Chapitre', value: item.chapter })
  if (item.type === 'video' && item.duration) metaRows.push({ label: 'Durée', value: item.duration })
  if (item.type === 'exercice' && item.questionCount) metaRows.push({ label: 'Questions', value: String(item.questionCount) })
  if ((item.type === 'pdf' || item.type === 'fiche') && item.pages) metaRows.push({ label: 'Pages', value: String(item.pages) })

  return (
    <>
      <Card className="gap-0 rounded-2xl p-4 shadow-soft">
        <p className="font-heading font-bold">Détails</p>
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
          <div className="grid grid-cols-2 gap-3">
            {related.map((r) => (
              <LibraryResourceCard key={r.id} resource={r} subjectColor={subjectColor} themeName={themeName} />
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
