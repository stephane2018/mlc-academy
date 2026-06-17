import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from '@/components/icons'

export const Route = createFileRoute('/cgu')({
  component: CguPage,
})

type Section = {
  n: number
  title: string
  body: React.ReactNode
}

const sections: Section[] = [
  {
    n: 1,
    title: 'Objet',
    body: (
      <p>
        Les présentes conditions générales d’utilisation (CGU) régissent l’accès et l’usage de la
        plateforme MLC Academy, service éducatif en ligne d’accompagnement en mathématiques
        (préparation au CE1D et au premier degré du secondaire). L’utilisation du service implique
        l’acceptation pleine et entière des présentes CGU.
      </p>
    ),
  },
  {
    n: 2,
    title: 'Compte et accès',
    body: (
      <ul className="ml-5 list-disc space-y-2">
        <li>
          Le compte élève est créé avec un pseudonyme : aucune donnée personnelle directement
          identifiante n’est requise.
        </li>
        <li>
          Le compte parent requiert une adresse email valide et donne un accès en lecture seule au
          suivi de l’enfant lié.
        </li>
        <li>
          L’utilisateur est responsable de la confidentialité de ses identifiants et de toute
          activité réalisée depuis son compte.
        </li>
      </ul>
    ),
  },
  {
    n: 3,
    title: 'Abonnements et paiement',
    body: (
      <p>
        Certaines fonctionnalités premium sont accessibles via un abonnement payant. Les paiements
        sont traités de manière sécurisée par notre prestataire <strong>Mollie</strong>. Les prix
        sont indiqués toutes taxes comprises. L’abonnement est renouvelé automatiquement à échéance,
        sauf résiliation avant la fin de la période en cours. Aucun moyen de paiement n’est stocké
        sur nos serveurs.
      </p>
    ),
  },
  {
    n: 4,
    title: 'Comportement de l’utilisateur',
    body: (
      <ul className="ml-5 list-disc space-y-2">
        <li>Utiliser le service de manière loyale et conforme à sa finalité éducative.</li>
        <li>Ne pas tenter de contourner les mesures de sécurité ou de perturber le service.</li>
        <li>Ne pas publier de contenu illicite, offensant ou portant atteinte aux droits de tiers.</li>
        <li>Respecter les autres utilisateurs lors des sessions live et des interactions.</li>
      </ul>
    ),
  },
  {
    n: 5,
    title: 'Responsabilité',
    body: (
      <p>
        MLC Academy met en œuvre les moyens raisonnables pour assurer la disponibilité et
        l’exactitude des contenus pédagogiques, sans garantie de résultat scolaire. Le service est
        fourni « en l’état ». Notre responsabilité ne saurait être engagée en cas d’interruption
        temporaire, de force majeure ou d’usage non conforme aux présentes CGU.
      </p>
    ),
  },
  {
    n: 6,
    title: 'Résiliation',
    body: (
      <p>
        L’utilisateur peut résilier son compte à tout moment depuis son espace ou en nous
        contactant. En cas de manquement grave aux présentes CGU, nous nous réservons le droit de
        suspendre ou de clôturer un compte. La résiliation entraîne la suppression ou
        l’anonymisation des données conformément à notre{' '}
        <Link to="/confidentialite" className="font-semibold text-brand hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>
    ),
  },
  {
    n: 7,
    title: 'Droit applicable et juridiction',
    body: (
      <p>
        Les présentes CGU sont régies par le <strong>droit belge</strong>. Tout litige relatif à
        leur interprétation ou exécution relève de la compétence des tribunaux belges, sous réserve
        des dispositions impératives protégeant le consommateur.
      </p>
    ),
  },
]

function CguPage() {
  return (
    <div className="min-h-dvh bg-background">
      <LegalHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Cadre juridique
        </span>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Conditions générales d’utilisation
        </h1>
        <p className="mt-3 text-muted-foreground">
          Dernière mise à jour : juin 2026.
        </p>

        <div className="mt-6 rounded-xl border border-amber/30 bg-amber-soft p-4 text-sm text-amber-foreground">
          Modèle indicatif à faire valider par un juriste avant mise en production.
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.n}>
              <h2 className="font-heading text-xl font-bold">
                <span className="text-muted-foreground">{s.n}.</span> {s.title}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>

        <Link
          to="/confidentialite"
          className="mt-12 flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="font-heading font-bold">Politique de confidentialité</p>
            <p className="text-sm text-muted-foreground">
              Données traitées, finalités et vos droits RGPD.
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
