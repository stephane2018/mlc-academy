import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, Bell, Menu, User, Settings, LogOut } from '@/components/icons'
import { ThemeToggle } from '@/components/theme'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { AdminSidebar } from '@/components/admin/sidebar'
import { pageTitles } from '@/components/admin/nav'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = pageTitles[pathname] ?? 'Administration'

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar tablette (rail icônes, md → lg) */}
      <aside className="sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border md:block lg:hidden">
        <AdminSidebar pathname={pathname} variant="rail" />
      </aside>

      {/* Sidebar desktop (étendue, lg+) */}
      <aside className="sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border lg:block">
        <AdminSidebar pathname={pathname} variant="expanded" />
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-64 max-w-[80vw] border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation administration</SheetTitle>
          <SheetDescription className="sr-only">Menu latéral du back-office</SheetDescription>
          <AdminSidebar
            pathname={pathname}
            variant="expanded"
            className="h-full w-full"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Zone contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:gap-4 sm:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-lg font-bold tracking-tight sm:text-xl">
              {title}
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Activité de la plateforme — juin 2026
            </p>
          </div>

          {/* Recherche (desktop) */}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              aria-label="Rechercher"
              className="h-9 w-56 pl-9 pr-12"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <ThemeToggle className="shrink-0 border border-border bg-card" />

          {/* Cloche */}
          <button
            type="button"
            className="relative grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>

          {/* Menu admin */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Menu administrateur"
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-brand-soft text-sm font-bold text-brand">
                    AD
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast('Profil (démo)')}>
                <User className="size-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast('Paramètres (démo)')}>
                <Settings className="size-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => toast.success('Déconnexion (démo)')}
              >
                <LogOut className="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
