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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex h-16 max-w-md items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                to={href}
                className="flex h-full flex-col items-center justify-center gap-1"
                aria-current={active ? "page" : undefined}
              >
                {/* Pilule indicatrice (style app native) */}
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors duration-200",
                    active ? "bg-brand-soft" : "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[22px] transition-colors",
                      active ? "text-brand" : "text-muted-foreground",
                    )}
                    strokeWidth={active ? 2.3 : 2}
                  />
                </span>
                <span
                  className={cn(
                    "text-[11px] leading-none transition-colors",
                    active ? "font-bold text-brand" : "font-medium text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
