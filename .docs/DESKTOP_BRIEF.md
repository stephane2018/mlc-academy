# Brief — Refonte desktop « marquée » Math'LaClasse

Objectif : un vrai design pensé pour grand écran (`lg`/`xl`/`2xl`) — héros, rails latéraux sticky, hiérarchie forte, micro-interactions, mini-graphes. **Le mobile (mono-colonne) doit rester intact** : n'ajoute des dispositions desktop qu'à partir de `lg:`/`xl:`. Lis aussi `.docs/AGENT_BRIEF.md` (tokens, conventions, icônes via `@/components/icons`).

## Blocs partagés à réutiliser — `@/components/blocks`
- `<PageHero eyebrow? title subtitle? actions? variant="surface|brand">{children?}</PageHero>`
  En-tête de page. `variant="brand"` = bandeau dégradé indigo + texte blanc (pour l'écran PRINCIPAL d'un espace) ; `variant="surface"` = carte claire élevée (sous-pages). Titres responsives intégrés.
- `<RailLayout rail={<...>} railWidth="340px">{contenu principal}</RailLayout>`
  Grille `xl:` : contenu à gauche, **rail sticky** à droite (`xl:sticky xl:top-6`). Sous `xl`, le rail passe dessous. Mets dans le rail les infos contextuelles (classement, prochain live, alertes, actions rapides, série/record).
- `<StatTile icon={Icon} tone="brand|teal|amber|success|info" label value delta? trend="up|down" spark?={<SparkBars/>} />`
  Tuile KPI avec tendance + mini-graphe optionnel.
- `<SparkBars data={number[]} labels?={string[]} color?="var(--teal)" height?={64} />` — mini barres SVG (SSR-safe).
- `<SparkArea data={number[]} color?="var(--brand)" height?={56} />` — mini aire de tendance SVG.

## Utilitaires CSS nouveaux (classes Tailwind)
`shadow-soft`, `shadow-float`, `shadow-brand-glow`, `text-gradient-brand`, `bg-dotted`, `card-hover` (élévation au survol des cartes cliquables).

## Langage visuel desktop
- Chaque écran riche : `PageHero` en haut, puis `RailLayout` (contenu + rail) quand un rail a du sens.
- Cartes : `rounded-2xl`/`rounded-3xl`, `shadow-soft` ; cartes cliquables → `card-hover`.
- Typo : grands titres `lg:text-3xl xl:text-4xl`, eyebrows `uppercase tracking-[0.18em] text-brand`.
- Remplace les barres `div` basiques par `SparkBars`/`SparkArea` sur desktop quand pertinent.
- Micro-interactions : `transition`, `card-hover`, survols d'icônes/liens.
- Garde-fou ultra-wide déjà en place dans les pages (`2xl:max-w-[...]`) — conserve-le.

## Contraintes
- NE PAS modifier : `mock.ts`, `styles.css`, `blocks.tsx`, `student/parts.tsx`, `math.tsx`, `__root.tsx`, ni les fichiers de **layout** déjà réglés (`eleve.tsx`, `prof.tsx`, `parent.tsx`, `admin.tsx`) — SAUF mention contraire dans ta tâche.
- Icônes uniquement via `@/components/icons` (ajoute-y une icône si besoin via `make(XxxIcon)`).
- Données mockées : si tu inventes une donnée (ex. classement), déclare une `const` locale dans le fichier.
- `tsc --noEmit` doit rester clean ; vérifie les routes (node fetch) et l'absence d'erreur `useContext`/hydration dans `/tmp/academy-dev.log`.
