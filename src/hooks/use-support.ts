import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supportService, type SupportTicketStatus } from '@/services/support'

const keys = {
  all: ['support'] as const,
  list: ['support', 'list'] as const,
  detail: (id: string) => ['support', 'detail', id] as const,
}

/** Liste de tous les tickets de support (vue admin). */
export function useSupportTickets() {
  return useQuery({
    queryKey: keys.list,
    queryFn: () => supportService.list(),
  })
}

/** Détail d'un ticket avec son fil de messages. */
export function useSupportTicket(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ''),
    queryFn: () => supportService.get(id as string),
    enabled: !!id,
  })
}

/** Répondre à un ticket (POST message). */
export function useReplySupportTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      supportService.reply(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

/** Changer le statut d'un ticket (PATCH). */
export function useUpdateSupportStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportTicketStatus }) =>
      supportService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}
