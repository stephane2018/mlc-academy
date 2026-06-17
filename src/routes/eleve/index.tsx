import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/eleve/')({
  beforeLoad: () => {
    throw redirect({ to: '/eleve/dashboard' })
  },
})
