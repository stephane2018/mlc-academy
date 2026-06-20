import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-client'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // 30 s : évite les refetch en rafale à la navigation
        retry: (failureCount, error) => {
          // Ne pas réessayer les erreurs client (4xx) : inutile.
          if (error instanceof ApiError && error.status < 500) return false
          return failureCount < 2
        },
      },
    },
  })

  return { queryClient }
}
export default function TanstackQueryProvider() {}
