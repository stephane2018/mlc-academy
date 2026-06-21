import { cn } from "@/lib/utils";
import { subjects, type SubjectKey } from "@/lib/mock";

export type SubjectFilterValue = SubjectKey | "all";

/**
 * Barre de filtre par matière (chips), réutilisable sur tous les écrans.
 * - `value` / `onChange` : contrôlé.
 * - `only` : restreindre aux matières fournies (sinon toutes).
 * - `includeAll` : afficher le chip « Toutes » (défaut true).
 * - `counts` : compteur optionnel par matière (et `all`).
 */
export function SubjectFilter({
  value,
  onChange,
  only,
  includeAll = true,
  counts,
  className,
}: {
  value: SubjectFilterValue;
  onChange: (v: SubjectFilterValue) => void;
  only?: SubjectKey[];
  includeAll?: boolean;
  counts?: Partial<Record<SubjectFilterValue, number>>;
  className?: string;
}) {
  const list = only ? subjects.filter((s) => only.includes(s.key)) : subjects;

  return (
    <div
      role="tablist"
      aria-label="Filtrer par matière"
      className={cn("-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5", className)}
    >
      {includeAll && (
        <Chip
          active={value === "all"}
          label="Toutes"
          count={counts?.all}
          onClick={() => onChange("all")}
        />
      )}
      {list.map((s) => (
        <Chip
          key={s.key}
          active={value === s.key}
          label={s.label}
          color={s.color}
          count={counts?.[s.key]}
          onClick={() => onChange(s.key)}
        />
      ))}
    </div>
  );
}

function Chip({
  active,
  label,
  color,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  color?: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={active && color ? { backgroundColor: color, borderColor: color } : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {!active && color && (
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
      {typeof count === "number" && (
        <span
          className={cn(
            "tabular-nums",
            active ? "text-background/70" : "text-muted-foreground/70",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
