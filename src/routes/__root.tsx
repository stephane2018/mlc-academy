import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { THEME_SCRIPT } from '@/components/theme'
import { AuthProvider } from '@/lib/auth'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1',
      },
      { name: 'theme-color', content: '#4f46e5' },
      { name: 'application-name', content: "MLC Academy" },
      { title: "MLC Academy — Réussis ton CE1D" },
      {
        name: 'description',
        content:
          "Plateforme d'apprentissage des mathématiques CE1D & Tronc Commun FWB : jeu gamifié, vidéos, examens blancs et cours live.",
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
