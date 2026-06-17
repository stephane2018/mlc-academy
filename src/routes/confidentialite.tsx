import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, X } from '@/components/icons'

export const Route = createFileRoute('/confidentialite')({
  component: ConfidentialitePage,
})

type DataRow = {
  data: string
  collected: boolean
  purpose: string
}

const dataRows: DataRow[] = [
  { data: 'Nom et prénom de l’élève', collected: false, purpose: 'Jamais collectés — pseudonyme uniquement' },
  { data: 'Email de l’élève', collected: false, purpose: 'Optionnel, uniquement pour réinitialiser le mot de passe' },
  { data: 'Photo / image de l’élève', collected: false, purpose: 'Jamais collectée — avatars illustrés au choix' },
  { data: 'Email du parent', collected: true, purpose: 'Notifications et rapports de progression' },
  { data: 'Résultats aux exercices', collected: true, purpose: 'Finalité pédagogique : adapter le parcours' },
  { data: 'Temps de connexion', collected: true, purpose: 'Suivi de l’assiduité et statistiques anonymisées' },
  { data: 'Adresse IP / géolocalisation', collected: false, purpose: 'Non conservées à des fins de profilage' },
]

const sections = [
  {
    title: 'Finalités du traitement',
    body: (
      <ul className="ml-5 list-disc space-y-2">
        <li>Fournir le parcours pédagogique et adapter les exercices au niveau de l’élève.</li>
        <li>Permettre au parent de suivre la progression via des rapports synthétiques.</li>
        <li>Assurer le bon fonctionnement, la sécurité et l’amélioration du service.</li>
        <li>Gérer les abonnements et la facturation (via notre prestataire de paiement).</li>
      </ul>
    ),
  },
  {
    title: 'Base légale',
    body: (
      <p>
        Le traitement repose sur l’<strong>exécution du contrat</strong> (fourniture du service)
        et, pour les comptes de mineurs, sur le <strong>consentement du titulaire de
        l’autorité parentale</strong> conformément au RGPD (art. 6 et 8). Les données strictement
        nécessaires au fonctionnement sont fondées sur notre intérêt légitime à fournir un service
        fiable et sécurisé.
      </p>
    ),
  },
  {
    title: 'Durée de conservation',
    body: (
      <p>
        Les données de compte sont conservées pendant la durée d’utilisation du service. En cas
        d’inactivité prolongée (24 mois) ou de demande de suppression, le compte et les données
        associées sont supprimés ou anonymisés. Les données de facturation sont conservées pour la
        durée légale applicable en Belgique.
      </p>
    ),
  },
  {
    title: 'Vos droits',
    body: (
      <ul className="ml-5 list-disc space-y-2">
        <li><strong>Accès</strong> : obtenir une copie des données traitées.</li>
        <li><strong>Rectification</strong> : corriger des informations inexactes.</li>
        <li><strong>Suppression</strong> : demander l’effacement du compte et des données.</li>
        <li><strong>Opposition et limitation</strong> : restreindre certains traitements.</li>
        <li><strong>Portabilité</strong> : récupérer vos données dans un format lisible.</li>
      </ul>
    ),
  },
  {
    title: 'Contact',
    body: (
      <p>
        Pour exercer vos droits ou poser une question, écrivez à{' '}
        <a href="mailto:privacy@mathslaclasse.com" className="font-semibold text-brand hover:underline">
          privacy@mathslaclasse.com
        </a>
        . Vous pouvez également introduire une réclamation auprès de l’Autorité de protection des
        données (APD, Belgique).
      </p>
    ),
  },
]

function ConfidentialitePage() {
  return (
    <div className="min-h-dvh bg-background">
      <LegalHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Protection des données
        </span>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-muted-foreground">
          Dernière mise à jour : juin 2026. MLC Academy est une plateforme conçue pour des
          mineurs : nous appliquons le principe de <strong>minimisation des données</strong> et ne
          collectons que ce qui est strictement nécessaire à l’apprentissage.
        </p>

        <div className="mt-6 rounded-xl border border-amber/30 bg-amber-soft p-4 text-sm text-amber-foreground">
          Modèle indicatif à faire valider par un juriste avant mise en production.
        </div>

        {/* Tableau des données */}
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold">Quelles données traitons-nous ?</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Donnée</th>
                  <th className="px-4 py-3 font-semibold">Collectée</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Finalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dataRows.map((row) => (
                  <tr key={row.data} className="align-top">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.data}
                      <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
                        {row.purpose}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.collected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                          <Check className="size-3.5" /> Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          <X className="size-3.5" /> Non
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {row.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sections texte */}
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-heading text-xl font-bold">{s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>

        {/* Lien CGU */}
        <Link
          to="/cgu"
          className="mt-12 flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="font-heading font-bold">Conditions générales d’utilisation</p>
            <p className="text-sm text-muted-foreground">
              Objet, abonnements, responsabilité et droit applicable.
            </p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" />
        </Link>
      </main>
    </div>
  )
}

function LegalHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-white">
            M
          </span>
          <span className="font-heading text-sm font-bold text-foreground">
            academy.mathslaclasse.com
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" /> Accueil
        </Link>
      </div>
    </header>
  )
}
