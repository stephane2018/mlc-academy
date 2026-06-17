/**
 * Données mockées pour le prototype d'interface MLC Academy.
 * Aucune source réelle (Supabase) — tout est statique et typé.
 */

export type SkillKey =
  | "nombres"
  | "algebre"
  | "geometrie"
  | "mesures"
  | "statistiques";

export type Skill = {
  key: SkillKey;
  label: string;
  mastery: number; // 0..100
};

export const skills: Skill[] = [
  { key: "nombres", label: "Nombres", mastery: 82 },
  { key: "algebre", label: "Algèbre", mastery: 64 },
  { key: "geometrie", label: "Géométrie", mastery: 45 },
  { key: "mesures", label: "Mesures", mastery: 71 },
  { key: "statistiques", label: "Statistiques", mastery: 38 },
];

export const student = {
  pseudo: "MaxLeBg",
  avatar: "🤖",
  level: 7,
  xp: 1240,
  xpForNextLevel: 1500,
  streak: 12,
  rank: 14,
  rankTotal: 312,
  pointsThisWeek: 1240,
  ce1dInDays: 47,
  nextLiveInHours: 2.25,
};

export type Mission = {
  title: string;
  skill: string;
  done: number;
  total: number;
  xpReward: number;
};

export const dailyMission: Mission = {
  title: "Fractions équivalentes",
  skill: "Algèbre",
  done: 3,
  total: 5,
  xpReward: 50,
};

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
  tier: "bronze" | "argent" | "or";
};

export const badges: Badge[] = [
  { id: "streak7", emoji: "🔥", name: "Série de 7", description: "7 jours d'affilée", unlocked: true, tier: "or" },
  { id: "perfect", emoji: "🎯", name: "Sans faute", description: "Un quiz 100 % juste", unlocked: true, tier: "argent" },
  { id: "fast", emoji: "⚡", name: "Éclair", description: "10 questions en 2 min", unlocked: true, tier: "bronze" },
  { id: "fractions", emoji: "🧮", name: "Roi des fractions", description: "Chapitre fractions maîtrisé", unlocked: true, tier: "or" },
  { id: "geo", emoji: "📐", name: "Géomètre", description: "Maîtrise la géométrie", unlocked: false, tier: "argent" },
  { id: "champion", emoji: "🏆", name: "Champion", description: "Top 3 du classement", unlocked: false, tier: "or" },
  { id: "marathon", emoji: "🏃", name: "Marathon", description: "30 jours d'affilée", unlocked: false, tier: "or" },
  { id: "exam", emoji: "🎓", name: "Prêt pour le CE1D", description: "5 examens blancs réussis", unlocked: false, tier: "or" },
];

export type QuizOption = { id: string; label: string };
export type QuizQuestion = {
  id: string;
  domain: string;
  type: string;
  prompt: string;
  katex?: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
  explanationKatex?: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    domain: "Algèbre",
    type: "Équation",
    prompt: "Résous l'équation. Quelle est la valeur de x ?",
    katex: "2x + 5 = 17",
    options: [
      { id: "a", label: "12" },
      { id: "b", label: "6" },
      { id: "c", label: "11" },
      { id: "d", label: "8" },
    ],
    correctId: "b",
    explanation: "On isole x :",
    explanationKatex: "2x = 17 - 5 = 12 \\Rightarrow x = 6",
  },
  {
    id: "q2",
    domain: "Nombres",
    type: "Fractions",
    prompt: "Combien font ces deux fractions additionnées ?",
    katex: "\\frac{3}{4} + \\frac{1}{2}",
    options: [
      { id: "a", label: "4/6" },
      { id: "b", label: "5/4" },
      { id: "c", label: "1" },
      { id: "d", label: "2/3" },
    ],
    correctId: "b",
    explanation: "Même dénominateur :",
    explanationKatex: "\\frac{3}{4} + \\frac{2}{4} = \\frac{5}{4}",
  },
  {
    id: "q3",
    domain: "Géométrie",
    type: "Aire",
    prompt: "Calcule l'aire d'un rectangle de 7 cm de long et 4 cm de large.",
    options: [
      { id: "a", label: "11 cm²" },
      { id: "b", label: "22 cm²" },
      { id: "c", label: "28 cm²" },
      { id: "d", label: "28 cm" },
    ],
    correctId: "c",
    explanation: "Aire = longueur × largeur :",
    explanationKatex: "7 \\times 4 = 28\\ \\text{cm}^2",
  },
];

export type VideoResource = {
  id: string;
  title: string;
  chapter: string;
  domain: SkillKey;
  duration: string;
  progress: number; // 0..100
  premium: boolean;
};

export const videos: VideoResource[] = [
  { id: "v1", title: "Les fractions équivalentes", chapter: "Chapitre 3", domain: "nombres", duration: "6:24", progress: 100, premium: false },
  { id: "v2", title: "Résoudre une équation du 1er degré", chapter: "Chapitre 5", domain: "algebre", duration: "8:10", progress: 60, premium: false },
  { id: "v3", title: "Aires et périmètres", chapter: "Chapitre 7", domain: "geometrie", duration: "7:45", progress: 0, premium: false },
  { id: "v4", title: "Le théorème de Pythagore", chapter: "Chapitre 8", domain: "geometrie", duration: "9:30", progress: 0, premium: true },
  { id: "v5", title: "Lire un diagramme", chapter: "Chapitre 10", domain: "statistiques", duration: "5:12", progress: 0, premium: true },
  { id: "v6", title: "Conversions d'unités", chapter: "Chapitre 6", domain: "mesures", duration: "6:50", progress: 30, premium: false },
];

export type LiveSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMin: number;
  group: string;
  teacher: string;
  status: "upcoming" | "live" | "replay";
  confirmed: boolean;
};

export const liveSessions: LiveSession[] = [
  { id: "l1", title: "Fractions & proportions", date: "Aujourd'hui", time: "18:00", durationMin: 60, group: "CE1D — Groupe A", teacher: "M. Minko", status: "upcoming", confirmed: true },
  { id: "l2", title: "Équations du 1er degré", date: "Jeu. 19 juin", time: "18:00", durationMin: 60, group: "CE1D — Groupe A", teacher: "M. Minko", status: "upcoming", confirmed: false },
  { id: "l3", title: "Géométrie : aires", date: "Lun. 9 juin", time: "18:00", durationMin: 60, group: "CE1D — Groupe A", teacher: "M. Minko", status: "replay", confirmed: true },
];

export type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
};

export const plans: Plan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    price: "Gratuit",
    period: "",
    tagline: "Pour tester la plateforme",
    features: ["20 questions/jour dans le jeu", "3 vidéos par chapitre", "Aperçu du tableau de bord"],
    cta: "Commencer",
  },
  {
    id: "premium",
    name: "Premium",
    price: "9,90 €",
    period: "/mois",
    tagline: "Le produit principal",
    features: ["Jeu CE1D complet illimité", "Toutes les vidéos", "Examens blancs corrigés", "Badges & classement", "Correction instantanée"],
    cta: "Choisir Premium",
    highlight: true,
    badge: "Le plus choisi",
  },
  {
    id: "famille",
    name: "Famille",
    price: "14,90 €",
    period: "/mois",
    tagline: "Jusqu'à 3 enfants",
    features: ["3 accès Premium indépendants", "Tableau de bord parent unifié", "Suivi de chaque enfant"],
    cta: "Choisir Famille",
  },
];

export type ChartPoint = { label: string; minutes: number; score: number };
export const weeklyActivity: ChartPoint[] = [
  { label: "Lun", minutes: 18, score: 72 },
  { label: "Mar", minutes: 25, score: 80 },
  { label: "Mer", minutes: 12, score: 65 },
  { label: "Jeu", minutes: 30, score: 88 },
  { label: "Ven", minutes: 22, score: 76 },
  { label: "Sam", minutes: 8, score: 60 },
  { label: "Dim", minutes: 15, score: 70 },
];

/* ----------------------------- Espace Prof ----------------------------- */

export type ProfGroup = {
  id: string;
  name: string;
  level: string;
  students: number;
  avgScore: number;
  activityRate: number;
  weakSkill: string;
  code: string; // code d'invitation
};

export const profGroups: ProfGroup[] = [
  { id: "g1", name: "Groupe A", level: "CE1D", students: 8, avgScore: 74, activityRate: 88, weakSkill: "Géométrie", code: "MLC-A7K2" },
  { id: "g2", name: "Groupe B", level: "CE1D", students: 6, avgScore: 68, activityRate: 71, weakSkill: "Statistiques", code: "MLC-B3F9" },
  { id: "g3", name: "Tronc Commun S1", level: "S1", students: 5, avgScore: 81, activityRate: 92, weakSkill: "Algèbre", code: "MLC-S1Q4" },
];

export type ProfStudent = {
  id: string;
  pseudo: string;
  avatar: string;
  group: string;
  avgScore: number;
  lastSeen: string;
  trend: "up" | "down" | "flat";
  weakSkill: string;
};

export const profStudents: ProfStudent[] = [
  { id: "s1", pseudo: "MaxLeBg", avatar: "🤖", group: "Groupe A", avgScore: 78, lastSeen: "il y a 2 h", trend: "up", weakSkill: "Statistiques" },
  { id: "s2", pseudo: "Léa_2012", avatar: "🦊", group: "Groupe A", avgScore: 85, lastSeen: "il y a 1 j", trend: "up", weakSkill: "Géométrie" },
  { id: "s3", pseudo: "NoaMath", avatar: "🚀", group: "Groupe A", avgScore: 62, lastSeen: "il y a 4 j", trend: "down", weakSkill: "Algèbre" },
  { id: "s4", pseudo: "Zoé★", avatar: "🐱", group: "Groupe A", avgScore: 71, lastSeen: "il y a 3 h", trend: "flat", weakSkill: "Mesures" },
  { id: "s5", pseudo: "TomTom", avatar: "🐼", group: "Groupe A", avgScore: 90, lastSeen: "à l'instant", trend: "up", weakSkill: "—" },
];

/* ---------------------------- Espace Parent ---------------------------- */

export const parentChild = {
  pseudo: "MaxLeBg",
  avatar: "🤖",
  minutesThisWeek: 130,
  avgScore: 78,
  streak: 12,
  inactiveDays: 0,
  nextLive: "Aujourd'hui 18:00",
};

/* ----------------------------- Back-office ----------------------------- */

export const adminStats = {
  activeStudents: 42,
  groups: 5,
  weeklyActivity: 83,
  pendingSupport: 5,
  mrr: 1180,
};

/* --------------------------- Bibliothèque ------------------------------ */

export type ResourceType = "video" | "pdf" | "exercice" | "fiche";

export type LibraryItem = {
  id: string;
  title: string;
  chapter: string;
  domain: SkillKey;
  type: ResourceType;
  duration?: string; // vidéo
  pages?: number; // pdf / fiche
  questions?: number; // exercice
  progress: number; // 0..100 (visionné / lu / réussi)
  premium: boolean;
  description: string;
};

export const domainLabels: Record<SkillKey, string> = {
  nombres: "Nombres",
  algebre: "Algèbre",
  geometrie: "Géométrie",
  mesures: "Mesures",
  statistiques: "Statistiques",
};

export const resourceTypeMeta: Record<
  ResourceType,
  { label: string; plural: string }
> = {
  video: { label: "Vidéo", plural: "Vidéos" },
  pdf: { label: "PDF", plural: "PDF" },
  exercice: { label: "Exercice", plural: "Exercices" },
  fiche: { label: "Fiche", plural: "Fiches" },
};

export const library: LibraryItem[] = [
  // Nombres
  { id: "r1", title: "Les fractions équivalentes", chapter: "Chapitre 3", domain: "nombres", type: "video", duration: "6:24", progress: 100, premium: false, description: "Comprendre et reconnaître des fractions qui représentent la même quantité, et simplifier une fraction." },
  { id: "r2", title: "Additionner des fractions", chapter: "Chapitre 3", domain: "nombres", type: "exercice", questions: 12, progress: 45, premium: false, description: "Série d'exercices corrigés sur l'addition de fractions au même dénominateur puis à dénominateurs différents." },
  { id: "r3", title: "Fiche mémo — Fractions", chapter: "Chapitre 3", domain: "nombres", type: "fiche", pages: 2, progress: 0, premium: false, description: "L'essentiel à retenir : vocabulaire, règles d'addition, multiplication et simplification." },
  { id: "r4", title: "Nombres relatifs", chapter: "Chapitre 4", domain: "nombres", type: "video", duration: "7:58", progress: 30, premium: false, description: "Additionner et soustraire des nombres positifs et négatifs sur la droite graduée." },

  // Algèbre
  { id: "r5", title: "Résoudre une équation du 1er degré", chapter: "Chapitre 5", domain: "algebre", type: "video", duration: "8:10", progress: 60, premium: false, description: "La méthode FWB pas à pas pour isoler l'inconnue et vérifier sa solution." },
  { id: "r6", title: "Équations — exercices types CE1D", chapter: "Chapitre 5", domain: "algebre", type: "exercice", questions: 15, progress: 0, premium: false, description: "Entraîne-toi sur des équations comme tu en auras au CE1D, avec correction instantanée." },
  { id: "r7", title: "Développer et réduire", chapter: "Chapitre 6", domain: "algebre", type: "pdf", pages: 4, progress: 0, premium: true, description: "Tout sur la distributivité et la réduction d'expressions littérales, avec exemples corrigés." },

  // Géométrie
  { id: "r8", title: "Aires et périmètres", chapter: "Chapitre 7", domain: "geometrie", type: "video", duration: "7:45", progress: 0, premium: false, description: "Calculer l'aire et le périmètre des figures usuelles : rectangle, triangle, cercle." },
  { id: "r9", title: "Le théorème de Pythagore", chapter: "Chapitre 8", domain: "geometrie", type: "video", duration: "9:30", progress: 0, premium: true, description: "Énoncé, démonstration visuelle et applications du théorème dans un triangle rectangle." },
  { id: "r10", title: "Fiche — Formules de géométrie", chapter: "Chapitre 8", domain: "geometrie", type: "fiche", pages: 3, progress: 100, premium: false, description: "Toutes les formules d'aires, de périmètres et de volumes à connaître pour le CE1D." },
  { id: "r11", title: "Constructions géométriques", chapter: "Chapitre 9", domain: "geometrie", type: "exercice", questions: 10, progress: 0, premium: true, description: "Médiatrices, bissectrices et hauteurs : exercices guidés à la règle et au compas." },

  // Mesures
  { id: "r12", title: "Conversions d'unités", chapter: "Chapitre 6", domain: "mesures", type: "video", duration: "6:50", progress: 80, premium: false, description: "Passer des km aux mm, des L aux mL : la méthode du tableau de conversion." },
  { id: "r13", title: "Mesures — PDF d'exercices", chapter: "Chapitre 6", domain: "mesures", type: "pdf", pages: 5, progress: 20, premium: false, description: "Fiche d'exercices imprimable sur les longueurs, masses, capacités et durées." },

  // Statistiques
  { id: "r14", title: "Lire un diagramme", chapter: "Chapitre 10", domain: "statistiques", type: "video", duration: "5:12", progress: 0, premium: true, description: "Diagrammes en bâtons, circulaires et histogrammes : comment les lire et les interpréter." },
  { id: "r15", title: "Moyenne et étendue", chapter: "Chapitre 10", domain: "statistiques", type: "exercice", questions: 8, progress: 0, premium: false, description: "Calcule la moyenne et l'étendue d'une série de données dans des situations concrètes." },
  { id: "r16", title: "Fiche mémo — Statistiques", chapter: "Chapitre 10", domain: "statistiques", type: "fiche", pages: 2, progress: 0, premium: true, description: "Vocabulaire et formules clés : effectif, fréquence, moyenne, étendue." },
];

export function getLibraryItem(id: string): LibraryItem | undefined {
  return library.find((r) => r.id === id);
}

/* --------------------------- Abonnement -------------------------------- */

export type Subscription = {
  plan: string;
  price: string;
  status: "active" | "trial" | "canceled";
  method: "Bancontact" | "Carte";
  since: string;
  nextBilling: string;
};

export const subscription: Subscription = {
  plan: "Premium",
  price: "9,90 €/mois",
  status: "active",
  method: "Bancontact",
  since: "12 mars 2026",
  nextBilling: "12 juillet 2026",
};

export type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: "payée" | "à venir";
};

export const invoices: Invoice[] = [
  { id: "INV-2026-006", date: "12 juin 2026", amount: "9,90 €", status: "payée" },
  { id: "INV-2026-005", date: "12 mai 2026", amount: "9,90 €", status: "payée" },
  { id: "INV-2026-004", date: "12 avr. 2026", amount: "9,90 €", status: "payée" },
  { id: "INV-2026-003", date: "12 mars 2026", amount: "9,90 €", status: "payée" },
];

/* --------------------- Ressources partagées (prof) --------------------- */

export type ResourceComment = {
  id: string;
  pseudo: string;
  avatar: string;
  text: string;
  time: string;
  answered?: boolean;
};

export type SharedResource = {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  status: "publié" | "planifié" | "brouillon";
  date: string;
  views: number;
  likes: number;
  fileName: string;
  fileSize: string;
  groups: string[]; // groupes ciblés
  students: string[]; // élèves ciblés (pseudos)
  comments: ResourceComment[];
};

export const sharedResources: SharedResource[] = [
  {
    id: "sr1", title: "Correction interro fractions", type: "pdf", status: "publié", date: "14 juin",
    views: 7, likes: 5, fileName: "correction-fractions.pdf", fileSize: "1,2 Mo",
    description: "Correction détaillée de l'interrogation sur l'addition et la simplification de fractions.",
    groups: ["Groupe A"], students: [],
    comments: [
      { id: "cm1", pseudo: "NoaMath", avatar: "🚀", text: "Monsieur, à la question 3 je ne comprends pas pourquoi on simplifie par 4.", time: "il y a 2 h" },
      { id: "cm2", pseudo: "Zoé★", avatar: "🐱", text: "Merci, c'est super clair !", time: "hier", answered: true },
    ],
  },
  {
    id: "sr2", title: "Vidéo : méthode Pythagore", type: "video", status: "publié", date: "10 juin",
    views: 22, likes: 14, fileName: "pythagore-methode.mp4", fileSize: "48 Mo",
    description: "Vidéo expliquant le théorème de Pythagore avec une démonstration visuelle et 3 exemples.",
    groups: ["Groupe A", "Groupe B"], students: [],
    comments: [
      { id: "cm3", pseudo: "MaxLeBg", avatar: "🤖", text: "On peut l'utiliser même si le triangle n'est pas rectangle ?", time: "il y a 1 j" },
    ],
  },
  {
    id: "sr3", title: "Exercices supplémentaires — Léa", type: "exercice", status: "publié", date: "9 juin",
    views: 1, likes: 1, fileName: "exos-equations-lea.pdf", fileSize: "640 Ko",
    description: "Série d'exercices d'équations assignée individuellement à Léa pour consolider.",
    groups: [], students: ["Léa_2012"], comments: [],
  },
  {
    id: "sr4", title: "Fiche méthode équations", type: "fiche", status: "planifié", date: "20 juin",
    views: 0, likes: 0, fileName: "fiche-equations.pdf", fileSize: "320 Ko",
    description: "Fiche mémo sur la résolution d'équations du premier degré (mise en ligne planifiée).",
    groups: ["Groupe A"], students: [], comments: [],
  },
  {
    id: "sr5", title: "Examen blanc n°3", type: "pdf", status: "brouillon", date: "—",
    views: 0, likes: 0, fileName: "examen-blanc-3.pdf", fileSize: "—",
    description: "Brouillon d'un nouvel examen blanc, pas encore publié.",
    groups: ["Groupe B"], students: [], comments: [],
  },
];

export function getSharedResource(id: string): SharedResource | undefined {
  return sharedResources.find((r) => r.id === id);
}

/* ------------------- Devoirs & évaluations (exercices) ----------------- */

export type AssignmentType = "devoir" | "evaluation";

export type AssignmentQuestion = {
  id: string;
  prompt: string;
  katex?: string;
  options: { id: string; label: string }[];
  correctId: string;
  explanation?: string;
  explanationKatex?: string;
};

export type Assignment = {
  id: string;
  title: string;
  type: AssignmentType; // devoir = à faire à la maison · evaluation = évaluation surprise
  domain: SkillKey;
  difficulty: "facile" | "moyen" | "difficile";
  durationMin?: number; // évaluations chronométrées
  dueDate: string;
  groups: string[];
  students: string[];
  status: "brouillon" | "publié" | "clôturé";
  createdAt: string;
  xpReward: number;
  questions: AssignmentQuestion[];
};

const Q_FRACTIONS: AssignmentQuestion[] = [
  { id: "q1", prompt: "Combien font ces deux fractions ?", katex: "\\frac{3}{4} + \\frac{1}{2}", options: [{ id: "a", label: "4/6" }, { id: "b", label: "5/4" }, { id: "c", label: "1" }, { id: "d", label: "2/3" }], correctId: "b", explanation: "Même dénominateur :", explanationKatex: "\\frac{3}{4} + \\frac{2}{4} = \\frac{5}{4}" },
  { id: "q2", prompt: "Simplifie la fraction.", katex: "\\frac{8}{12}", options: [{ id: "a", label: "2/3" }, { id: "b", label: "4/6" }, { id: "c", label: "3/4" }, { id: "d", label: "1/2" }], correctId: "a", explanation: "On divise par 4 :", explanationKatex: "\\frac{8}{12} = \\frac{2}{3}" },
  { id: "q3", prompt: "Quelle fraction est la plus grande ?", options: [{ id: "a", label: "3/5" }, { id: "b", label: "2/3" }, { id: "c", label: "1/2" }, { id: "d", label: "4/9" }], correctId: "b", explanation: "2/3 ≈ 0,67, la plus grande." },
];

const Q_EQUATIONS: AssignmentQuestion[] = [
  { id: "q1", prompt: "Résous l'équation.", katex: "2x + 5 = 17", options: [{ id: "a", label: "12" }, { id: "b", label: "6" }, { id: "c", label: "11" }, { id: "d", label: "8" }], correctId: "b", explanation: "On isole x :", explanationKatex: "2x = 12 \\Rightarrow x = 6" },
  { id: "q2", prompt: "Développe l'expression.", katex: "3(x + 2)", options: [{ id: "a", label: "3x + 2" }, { id: "b", label: "3x + 6" }, { id: "c", label: "x + 6" }, { id: "d", label: "3x + 5" }], correctId: "b", explanation: "Distributivité :", explanationKatex: "3x + 6" },
  { id: "q3", prompt: "Quelle est la solution de x − 4 = 10 ?", options: [{ id: "a", label: "6" }, { id: "b", label: "14" }, { id: "c", label: "40" }, { id: "d", label: "-6" }], correctId: "b", explanation: "x = 10 + 4 = 14." },
];

const Q_GEO: AssignmentQuestion[] = [
  { id: "q1", prompt: "Aire d'un rectangle 7 cm × 4 cm ?", options: [{ id: "a", label: "11 cm²" }, { id: "b", label: "22 cm²" }, { id: "c", label: "28 cm²" }, { id: "d", label: "28 cm" }], correctId: "c", explanation: "L × l :", explanationKatex: "7 \\times 4 = 28\\ \\text{cm}^2" },
  { id: "q2", prompt: "Hypoténuse d'un triangle rectangle (3 ; 4) ?", options: [{ id: "a", label: "5" }, { id: "b", label: "7" }, { id: "c", label: "12" }, { id: "d", label: "25" }], correctId: "a", explanation: "Pythagore :", explanationKatex: "\\sqrt{3^2 + 4^2} = 5" },
];

export const assignments: Assignment[] = [
  { id: "a1", title: "Devoir maison — Les fractions", type: "devoir", domain: "nombres", difficulty: "moyen", dueDate: "22 juin", groups: ["Groupe A"], students: [], status: "publié", createdAt: "14 juin", xpReward: 40, questions: Q_FRACTIONS },
  { id: "a2", title: "Évaluation surprise — Équations", type: "evaluation", domain: "algebre", difficulty: "difficile", durationMin: 15, dueDate: "Aujourd'hui", groups: ["Groupe A"], students: [], status: "publié", createdAt: "17 juin", xpReward: 60, questions: Q_EQUATIONS },
  { id: "a3", title: "Devoir — Aires et Pythagore", type: "devoir", domain: "geometrie", difficulty: "moyen", dueDate: "12 juin", groups: ["Groupe A"], students: [], status: "clôturé", createdAt: "6 juin", xpReward: 40, questions: Q_GEO },
];

export function getAssignment(id: string): Assignment | undefined {
  return assignments.find((a) => a.id === id);
}

/* ----------------------- Soumissions / résultats ---------------------- */

export type SubmissionStatus = "à faire" | "en cours" | "rendu";

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  pseudo: string;
  avatar: string;
  status: SubmissionStatus;
  score?: number; // %
  submittedAt?: string;
};

export const submissions: Submission[] = [
  // a1 — devoir fractions (publié, en cours de rendu)
  { id: "su1", assignmentId: "a1", studentId: "s1", pseudo: "MaxLeBg", avatar: "🤖", status: "rendu", score: 67, submittedAt: "15 juin" },
  { id: "su2", assignmentId: "a1", studentId: "s2", pseudo: "Léa_2012", avatar: "🦊", status: "rendu", score: 100, submittedAt: "15 juin" },
  { id: "su3", assignmentId: "a1", studentId: "s3", pseudo: "NoaMath", avatar: "🚀", status: "à faire" },
  { id: "su4", assignmentId: "a1", studentId: "s4", pseudo: "Zoé★", avatar: "🐱", status: "rendu", score: 67, submittedAt: "16 juin" },
  { id: "su5", assignmentId: "a1", studentId: "s5", pseudo: "TomTom", avatar: "🐼", status: "à faire" },
  // a2 — évaluation surprise (à faire majoritairement)
  { id: "su6", assignmentId: "a2", studentId: "s1", pseudo: "MaxLeBg", avatar: "🤖", status: "à faire" },
  { id: "su7", assignmentId: "a2", studentId: "s2", pseudo: "Léa_2012", avatar: "🦊", status: "rendu", score: 100, submittedAt: "Aujourd'hui" },
  { id: "su8", assignmentId: "a2", studentId: "s3", pseudo: "NoaMath", avatar: "🚀", status: "à faire" },
  // a3 — devoir clôturé (tous rendus)
  { id: "su9", assignmentId: "a3", studentId: "s1", pseudo: "MaxLeBg", avatar: "🤖", status: "rendu", score: 100, submittedAt: "11 juin" },
  { id: "su10", assignmentId: "a3", studentId: "s2", pseudo: "Léa_2012", avatar: "🦊", status: "rendu", score: 50, submittedAt: "11 juin" },
  { id: "su11", assignmentId: "a3", studentId: "s3", pseudo: "NoaMath", avatar: "🚀", status: "rendu", score: 50, submittedAt: "12 juin" },
];

export function submissionsForAssignment(assignmentId: string): Submission[] {
  return submissions.filter((s) => s.assignmentId === assignmentId);
}

/** Devoirs assignés à un élève (par son groupe ou nominativement). */
export function assignmentsForStudent(studentGroup: string, pseudo: string): Assignment[] {
  return assignments.filter(
    (a) =>
      a.status !== "brouillon" &&
      (a.groups.includes(studentGroup) || a.students.includes(pseudo)),
  );
}

/** Historique des évaluations d'un élève (ses soumissions + le devoir lié). */
export function studentHistory(studentId: string) {
  return submissions
    .filter((s) => s.studentId === studentId)
    .map((s) => ({ submission: s, assignment: getAssignment(s.assignmentId) }))
    .filter((x): x is { submission: Submission; assignment: Assignment } => !!x.assignment);
}

/* ---------------------- Rapports reçus (parent) ------------------------ */

export type ParentReport = {
  id: string;
  title: string;
  kind: "devoir" | "évaluation" | "mensuel";
  date: string;
  teacher: string;
  summary: string;
  score?: number; // % si lié à un devoir/évaluation
  assignmentId?: string;
  read: boolean;
};

export const parentReports: ParentReport[] = [
  {
    id: "pr1", title: "Devoir — Les fractions", kind: "devoir", date: "15 juin", teacher: "M. Minko",
    summary: "MaxLeBg a rendu le devoir sur les fractions. Quelques erreurs sur la simplification — à revoir ensemble.",
    score: 67, assignmentId: "a1", read: false,
  },
  {
    id: "pr3", title: "Évaluation — Aires et Pythagore", kind: "évaluation", date: "12 juin", teacher: "M. Minko",
    summary: "Excellente évaluation, 100 %. MaxLeBg maîtrise bien la géométrie de base.",
    score: 100, assignmentId: "a3", read: true,
  },
  {
    id: "pr2", title: "Bulletin mensuel — Mai", kind: "mensuel", date: "1 juin", teacher: "M. Minko",
    summary: "Progression régulière ce mois-ci. Points forts : nombres et mesures. À encourager sur la géométrie et les statistiques.",
    read: true,
  },
];

/* ----------------------- Notifications / alertes ----------------------- */

export type NotifAudience = "eleve" | "prof" | "parent";
export type NotifKind =
  | "devoir"
  | "rapport"
  | "resultat"
  | "live"
  | "inactivite"
  | "badge"
  | "message"
  | "systeme";

export type Notification = {
  id: string;
  audience: NotifAudience;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [
  // Élève
  { id: "n1", audience: "eleve", kind: "devoir", title: "Nouveau devoir assigné", body: "« Les fractions » — à rendre pour le 22 juin.", time: "il y a 10 min", read: false },
  { id: "n2", audience: "eleve", kind: "live", title: "Cours live bientôt", body: "Fractions & proportions — aujourd'hui à 18:00. Confirme ta présence.", time: "il y a 1 h", read: false },
  { id: "n3", audience: "eleve", kind: "badge", title: "Badge débloqué 🔥", body: "Série de 7 jours — bravo, continue !", time: "hier", read: false },
  { id: "n4", audience: "eleve", kind: "message", title: "M. Minko t'a répondu", body: "« Pense à mettre au même dénominateur… »", time: "hier", read: true },
  { id: "n5", audience: "eleve", kind: "systeme", title: "Ton classement a évolué", body: "Tu es passé 5ᵉ de ton groupe. +2 places !", time: "il y a 2 j", read: true },

  // Prof
  { id: "n6", audience: "prof", kind: "resultat", title: "Devoir rendu", body: "Léa_2012 a rendu « Les fractions » — score 100 %.", time: "il y a 20 min", read: false },
  { id: "n7", audience: "prof", kind: "inactivite", title: "Élève inactif", body: "NoaMath n'a pas travaillé depuis 4 jours.", time: "il y a 3 h", read: false },
  { id: "n8", audience: "prof", kind: "message", title: "Nouvelle question", body: "MaxLeBg : « On peut l'utiliser si le triangle n'est pas rectangle ? »", time: "il y a 5 h", read: false },
  { id: "n9", audience: "prof", kind: "live", title: "Séance aujourd'hui", body: "Groupe A — 18:00. 6 élèves ont confirmé.", time: "aujourd'hui", read: true },

  // Parent
  { id: "n10", audience: "parent", kind: "rapport", title: "Nouveau rapport reçu", body: "Devoir « Les fractions » — MaxLeBg a obtenu 67 %.", time: "il y a 15 min", read: false },
  { id: "n11", audience: "parent", kind: "devoir", title: "Devoir à rendre", body: "MaxLeBg a une évaluation surprise à faire aujourd'hui.", time: "il y a 2 h", read: false },
  { id: "n12", audience: "parent", kind: "live", title: "Cours live aujourd'hui", body: "MaxLeBg a cours avec M. Minko à 18:00.", time: "il y a 4 h", read: true },
  { id: "n13", audience: "parent", kind: "badge", title: "Belle régularité", body: "MaxLeBg s'entraîne depuis 7 jours d'affilée 👏", time: "hier", read: true },
];

export function notificationsFor(audience: NotifAudience): Notification[] {
  return notifications.filter((n) => n.audience === audience);
}

export function unreadCount(audience: NotifAudience): number {
  return notifications.filter((n) => n.audience === audience && !n.read).length;
}

/* ------------------- Préférences de notifications ---------------------- */

export type PrefChannel = "inapp" | "push" | "email";

export const prefChannels: { key: PrefChannel; label: string; hint: string }[] = [
  { key: "inapp", label: "Dans l'app", hint: "Centre de notifications" },
  { key: "push", label: "Push mobile", hint: "Si l'app est installée (PWA)" },
  { key: "email", label: "E-mail parent", hint: "Si un parent est lié au compte" },
];

export type NotifPref = {
  key: string;
  label: string;
  description: string;
  channels: PrefChannel[]; // canaux disponibles pour cette catégorie
  defaults: PrefChannel[]; // canaux activés par défaut
};

export const elevePrefs: NotifPref[] = [
  { key: "devoir", label: "Nouveau devoir", description: "Quand un prof t'assigne un devoir ou une évaluation.", channels: ["inapp", "push"], defaults: ["inapp", "push"] },
  { key: "live", label: "Cours en direct", description: "Rappel avant le début d'une séance live.", channels: ["inapp", "push"], defaults: ["inapp", "push"] },
  { key: "resultat", label: "Résultats & corrections", description: "Quand une correction ou un résultat est disponible.", channels: ["inapp", "push"], defaults: ["inapp"] },
  { key: "message", label: "Messages du prof", description: "Quand M. Minko te répond.", channels: ["inapp", "push"], defaults: ["inapp", "push"] },
  { key: "badge", label: "Badges & classement", description: "Nouveaux badges et montées au classement.", channels: ["inapp", "push"], defaults: ["inapp"] },
];

export const parentPrefs: NotifPref[] = [
  { key: "devoir", label: "Devoir de l'enfant", description: "Nouveau devoir assigné à votre enfant.", channels: ["inapp", "push", "email"], defaults: ["email", "inapp"] },
  { key: "live", label: "Cours en direct", description: "Rappel des séances live de votre enfant.", channels: ["inapp", "push", "email"], defaults: ["email"] },
  { key: "rapport", label: "Rapports & résultats", description: "Bulletins et résultats d'évaluation.", channels: ["inapp", "push", "email"], defaults: ["email", "inapp"] },
  { key: "inactivite", label: "Alerte d'inactivité", description: "Si votre enfant ne travaille pas pendant 3 jours.", channels: ["email"], defaults: ["email"] },
  { key: "regularite", label: "Régularité & réussites", description: "Séries, badges et belles progressions.", channels: ["inapp", "push", "email"], defaults: ["inapp"] },
];

export const profPrefs: NotifPref[] = [
  { key: "rendu", label: "Devoir rendu", description: "Quand un élève rend un devoir ou une évaluation.", channels: ["inapp", "push", "email"], defaults: ["inapp"] },
  { key: "question", label: "Question d'un élève", description: "Nouveau message d'un élève dans la messagerie.", channels: ["inapp", "push", "email"], defaults: ["inapp", "push"] },
  { key: "inactivite", label: "Élève inactif", description: "Quand un élève n'a pas travaillé depuis plusieurs jours.", channels: ["inapp", "email"], defaults: ["inapp", "email"] },
  { key: "presence", label: "Confirmations de présence", description: "Quand des élèves confirment leur présence à une séance.", channels: ["inapp", "push"], defaults: ["inapp"] },
  { key: "live", label: "Séance live imminente", description: "Rappel avant le début d'une séance que tu animes.", channels: ["inapp", "push", "email"], defaults: ["inapp", "push"] },
  { key: "hebdo", label: "Résumé hebdomadaire", description: "Synthèse d'activité de tes groupes, chaque lundi.", channels: ["email"], defaults: ["email"] },
];

/** Devoirs de l'enfant côté parent (en retard / à faire / rendus avec score). */
export function childAssignments(studentId: string, studentGroup: string, pseudo: string) {
  return assignmentsForStudent(studentGroup, pseudo).map((a) => {
    const sub = submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId);
    return { assignment: a, submission: sub };
  });
}

/* --------------------------- Examens blancs ---------------------------- */

export type ExamAttempt = { date: string; score: number };

export type Exam = {
  id: string;
  title: string;
  theme: string;
  durationMin: number;
  questionCount: number;
  premium: boolean;
  bestScore: number | null;
  attempts: ExamAttempt[];
};

export const exams: Exam[] = [
  { id: "ex1", title: "Examen blanc CE1D — Complet n°1", theme: "Tout le programme", durationMin: 50, questionCount: 20, premium: false, bestScore: 72, attempts: [{ date: "10 juin", score: 72 }, { date: "2 juin", score: 64 }] },
  { id: "ex2", title: "Examen blanc CE1D — Complet n°2", theme: "Tout le programme", durationMin: 50, questionCount: 20, premium: true, bestScore: null, attempts: [] },
  { id: "ex3", title: "Nombres & calcul", theme: "Nombres", durationMin: 25, questionCount: 12, premium: false, bestScore: 83, attempts: [{ date: "8 juin", score: 83 }] },
  { id: "ex4", title: "Géométrie", theme: "Géométrie", durationMin: 25, questionCount: 12, premium: true, bestScore: null, attempts: [] },
  { id: "ex5", title: "Algèbre & équations", theme: "Algèbre", durationMin: 30, questionCount: 14, premium: false, bestScore: 45, attempts: [{ date: "5 juin", score: 45 }] },
];

export function getExam(id: string): Exam | undefined {
  return exams.find((e) => e.id === id);
}

/* ----------------------- Fiche élève (détail) -------------------------- */

export type StudentHistory = { date: string; label: string; score?: number };
export type RecurrentError = { topic: string; domain: SkillKey; count: number };

export type StudentDetail = ProfStudent & {
  level: number;
  xp: number;
  streak: number;
  attendanceRate: number; // %
  domainMastery: { key: SkillKey; label: string; mastery: number }[];
  history: StudentHistory[];
  errors: RecurrentError[];
  note: string;
};

export function getStudentDetail(id: string): StudentDetail | undefined {
  const base = profStudents.find((s) => s.id === id);
  if (!base) return undefined;
  // Variation déterministe simple à partir de l'index
  const idx = profStudents.findIndex((s) => s.id === id);
  const shift = idx * 7;
  return {
    ...base,
    level: 4 + (idx % 5),
    xp: 820 + idx * 130,
    streak: [12, 3, 0, 6, 21][idx % 5],
    attendanceRate: [92, 70, 55, 80, 100][idx % 5],
    domainMastery: skills.map((s, i) => ({
      key: s.key,
      label: s.label,
      mastery: Math.max(20, Math.min(98, s.mastery - shift + i * 4)),
    })),
    history: [
      { date: "Aujourd'hui", label: "Session jeu — Fractions", score: 80 },
      { date: "Hier", label: "Vidéo : équations (terminée)" },
      { date: "13 juin", label: "Examen blanc Nombres", score: 83 },
      { date: "11 juin", label: "Exercices Géométrie", score: 60 },
      { date: "9 juin", label: "Cours live — présent" },
    ],
    errors: [
      { topic: "Priorités opératoires", domain: "nombres", count: 6 },
      { topic: "Conversions d'unités", domain: "mesures", count: 4 },
      { topic: "Théorème de Pythagore", domain: "geometrie", count: 3 },
    ],
    note: idx === 0 ? "Très régulier, à pousser vers les examens blancs Premium." : "",
  };
}

/* ----------------------------- Messagerie ------------------------------ */

export type Message = { id: string; from: "prof" | "eleve"; text: string; time: string };

export type Conversation = {
  id: string;
  pseudo: string;
  avatar: string;
  group: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
};

/* ----------------------------- Classement ------------------------------ */

export type LeaderRow = {
  rank: number;
  pseudo: string;
  avatar: string;
  points: number;
  me?: boolean;
  trend: "up" | "down" | "flat";
};

export const leaderboard: LeaderRow[] = [
  { rank: 1, pseudo: "TomTom", avatar: "🐼", points: 2140, trend: "up" },
  { rank: 2, pseudo: "Léa_2012", avatar: "🦊", points: 1980, trend: "up" },
  { rank: 3, pseudo: "Zoé★", avatar: "🐱", points: 1760, trend: "down" },
  { rank: 4, pseudo: "Sacha", avatar: "🦁", points: 1520, trend: "up" },
  { rank: 5, pseudo: "MaxLeBg", avatar: "🤖", points: 1240, me: true, trend: "up" },
  { rank: 6, pseudo: "NoaMath", avatar: "🚀", points: 1180, trend: "down" },
  { rank: 7, pseudo: "Inès", avatar: "🦉", points: 990, trend: "flat" },
  { rank: 8, pseudo: "Hugo", avatar: "🐸", points: 870, trend: "down" },
];

/* ------------------------------ Coach IA ------------------------------- */

export type CoachMessage = { id: string; from: "coach" | "eleve"; text: string };

export const coachMessages: CoachMessage[] = [
  { id: "k1", from: "coach", text: "Salut ! Je suis ton coach maths 🤖. Pose-moi une question ou dis-moi sur quel chapitre tu bloques." },
  { id: "k2", from: "eleve", text: "Je comprends pas comment additionner 3/4 et 1/2." },
  { id: "k3", from: "coach", text: "Bonne question ! Il faut d'abord le même dénominateur. 1/2 = 2/4. Donc 3/4 + 2/4 = 5/4. Tu veux un exercice pour t'entraîner ?" },
];

export const coachSuggestions: string[] = [
  "Explique-moi les fractions",
  "Comment résoudre 2x + 5 = 17 ?",
  "Donne-moi un exercice de géométrie",
  "C'est quoi le théorème de Pythagore ?",
];

/* --------------------------- Salle live (chat) ------------------------- */

export type LiveChatMsg = { id: string; pseudo: string; avatar: string; text: string; time: string };

export const liveChat: LiveChatMsg[] = [
  { id: "lc1", pseudo: "M. Minko", avatar: "👨‍🏫", text: "Bienvenue à tous ! On commence par un quiz de révision.", time: "18:01" },
  { id: "lc2", pseudo: "Léa_2012", avatar: "🦊", text: "Bonjour monsieur !", time: "18:01" },
  { id: "lc3", pseudo: "MaxLeBg", avatar: "🤖", text: "Présent 👋", time: "18:02" },
  { id: "lc4", pseudo: "NoaMath", avatar: "🚀", text: "On peut revoir les fractions ?", time: "18:03" },
];

/* -------------------- Banque de questions (admin) ---------------------- */

export type BankQuestion = {
  id: string;
  domain: SkillKey;
  type: string;
  prompt: string;
  difficulty: "facile" | "moyen" | "difficile";
  uses: number;
};

export const questionBank: BankQuestion[] = [
  { id: "qb1", domain: "algebre", type: "Équation", prompt: "Résous 2x + 5 = 17", difficulty: "moyen", uses: 124 },
  { id: "qb2", domain: "nombres", type: "Fractions", prompt: "Calcule 3/4 + 1/2", difficulty: "facile", uses: 211 },
  { id: "qb3", domain: "geometrie", type: "Aire", prompt: "Aire d'un rectangle 7×4 cm", difficulty: "facile", uses: 98 },
  { id: "qb4", domain: "geometrie", type: "Pythagore", prompt: "Calcule l'hypoténuse (3 ; 4)", difficulty: "difficile", uses: 67 },
  { id: "qb5", domain: "mesures", type: "Conversion", prompt: "Convertis 2,5 km en m", difficulty: "facile", uses: 143 },
  { id: "qb6", domain: "statistiques", type: "Moyenne", prompt: "Moyenne de 12, 15, 9, 14", difficulty: "moyen", uses: 54 },
  { id: "qb7", domain: "algebre", type: "Développement", prompt: "Développe 3(x + 2)", difficulty: "moyen", uses: 88 },
  { id: "qb8", domain: "nombres", type: "Relatifs", prompt: "Calcule -7 + 12", difficulty: "facile", uses: 176 },
];

export const conversations: Conversation[] = [
  {
    id: "c1", pseudo: "MaxLeBg", avatar: "🤖", group: "Groupe A",
    lastMessage: "Merci monsieur, j'ai compris !", time: "10:24", unread: 0,
    messages: [
      { id: "m1", from: "eleve", text: "Bonjour monsieur, je bloque sur l'exercice 4 des fractions.", time: "09:58" },
      { id: "m2", from: "prof", text: "Pense à mettre les deux fractions au même dénominateur avant d'additionner. Réessaie et envoie-moi ta réponse.", time: "10:10" },
      { id: "m3", from: "eleve", text: "Merci monsieur, j'ai compris !", time: "10:24" },
    ],
  },
  {
    id: "c2", pseudo: "NoaMath", avatar: "🚀", group: "Groupe A",
    lastMessage: "Je peux avoir des exercices en plus ?", time: "Hier", unread: 2,
    messages: [
      { id: "m1", from: "eleve", text: "Bonjour, je voudrais m'entraîner plus sur les équations.", time: "Hier 17:40" },
      { id: "m2", from: "eleve", text: "Je peux avoir des exercices en plus ?", time: "Hier 17:41" },
    ],
  },
  {
    id: "c3", pseudo: "Léa_2012", avatar: "🦊", group: "Groupe A",
    lastMessage: "D'accord, je regarde la vidéo ce soir.", time: "Lun.", unread: 0,
    messages: [
      { id: "m1", from: "prof", text: "Léa, regarde la vidéo sur les aires avant le prochain cours.", time: "Lun. 14:02" },
      { id: "m2", from: "eleve", text: "D'accord, je regarde la vidéo ce soir.", time: "Lun. 18:30" },
    ],
  },
];
