import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagingService } from '@/services/messaging'

export function useConversations() {
  return useQuery({ queryKey: ['messaging', 'conversations'], queryFn: () => messagingService.conversations() })
}
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messaging', 'messages', conversationId],
    queryFn: () => messagingService.messages(conversationId),
    enabled: !!conversationId,
  })
}
export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId: string) => messagingService.createConversation(studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] }),
  })
}
export function useSendMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => messagingService.send(conversationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging', 'messages', conversationId] })
      qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] })
    },
  })
}
export function useMarkConversationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messagingService.markRead(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] }),
  })
}
