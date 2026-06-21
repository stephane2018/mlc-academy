import { cn } from "@/lib/utils";

export type MeterColor =
  | "brand"
  | "teal"
  | "amber"
  | "success"
  | "violet"
  | "info"
  | "auto";

const colorClass: Record<Exclude<MeterColor, "auto">, string> = {
  brand: "bg-brand",
  teal: "bg-teal",
  amber: "bg-amber",
  success: "bg-success",
  violet: "bg-violet",
  info: "bg-info",
};

/** Couleur dérivée du niveau de maîtrise : vert (fort), orange (faible), indigo (moyen). */
function masteryColor(value: number): Exclude<MeterColor, "auto"> {
  if (value >= 80) return "success";
  if (value < 50) return "amber";
  return "brand";
}

/** Une couleur par domaine de compétence (espace élève coloré). */
export const SKILL_COLOR: Record<string, Exclude<MeterColor, "auto">> = {
  nombres: "success",
  algebre: "brand",
  geometrie: "violet",
  mesures: "info",
  statistiques: "amber",
};

/** Une couleur de jeton (MeterColor) par matière — cohérent avec subjects[].color. */
export const SUBJECT_COLOR: Record<string, Exclude<MeterColor, "auto">> = {
  maths: "brand",
  francais: "amber",
  sciences: "teal",
};

/** Teintes pastel rotatives pour les pastilles d'avatar. */
const AVATAR_TINTS = [
  "bg-brand-soft",
  "bg-success-soft",
  "bg-amber-soft",
  "bg-violet-soft",
  "bg-teal-soft",
  "bg-info-soft",
];

export function avatarTint(seed: number | string): string {
  const i =
    typeof seed === "number"
      ? seed
      : Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_TINTS[Math.abs(i) % AVATAR_TINTS.length];
}

export function Meter({
  value,
  color = "brand",
  className,
  trackClassName,
}: {
  value: number;
  color?: MeterColor;
  className?: string;
  trackClassName?: string;
}) {
  const resolved = color === "auto" ? masteryColor(value) : color;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", trackClassName)}>
      <div
        className={cn("h-full rounded-full transition-all", colorClass[resolved], className)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-heading text-lg font-bold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export function SoftIcon({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: "brand" | "teal" | "amber" | "success" | "info" | "violet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-soft text-brand",
    teal: "bg-teal-soft text-teal",
    amber: "bg-amber-soft text-amber-foreground",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
    violet: "bg-violet-soft text-violet",
  };
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone], className)}>
      {children}
    </span>
  );
}
