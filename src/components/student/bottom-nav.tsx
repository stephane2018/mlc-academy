import { Link, useLocation } from "@tanstack/react-router";
import { Home, Gamepad2, Video, Library, User } from '@/components/icons';
import { cn } from "@/lib/utils";

const items = [
  { href: "/eleve/dashboard", label: "Accueil", icon: Home },
  { href: "/eleve/jeu", label: "Jouer", icon: Gamepad2 },
  { href: "/eleve/live", label: "Live", icon: Video },
  { href: "/eleve/bibliotheque", label: "Biblio", icon: Library },
  { href: "/eleve/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                to={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl transition-colors",
                    active && "bg-brand-soft",
                  )}
                >
                  <Icon className="size-[20px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
