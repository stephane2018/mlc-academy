import katex from "katex";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type MathProps = {
  expr: string;
  display?: boolean;
  className?: string;
};

/** Rendu d'une expression LaTeX via KaTeX (léger, sans dépendance React tierce). */
export function Math({ expr, display = false, className }: MathProps) {
  const html = useMemo(
    () =>
      katex.renderToString(expr, {
        displayMode: display,
        throwOnError: false,
        output: "html",
      }),
    [expr, display],
  );

  return (
    <span
      className={cn(display && "block text-center", className)}
      // KaTeX produit du HTML sûr à partir d'une expression contrôlée
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
