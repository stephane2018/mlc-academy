import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth'

/** L'élève génère un code de rattachement (à transmettre au parent). */
export function useIssueParentCode() {
  return useMutation({ mutationFn: () => authService.issueParentCode() })
}

/** Le parent rattache un enfant via son code. */
export function useLinkChild() {
  return useMutation({ mutationFn: (code: string) => authService.linkChild(code) })
}
