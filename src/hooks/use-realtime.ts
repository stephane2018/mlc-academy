import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

/**
 * Synchronisation temps réel : écoute les INSERT sur `notifications` (filtrés
 * par utilisateur) et `messages` (bornés par la RLS) et invalide les caches
 * TanStack Query correspondants. Ne rend rien.
 *
 * À monter UNE seule fois par layout authentifié.
 */
export function useRealtimeSync(): null {
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return

    const notificationsChannel = supabase
      .channel(`realtime:notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications'] })
        },
      )
      .subscribe()

    const messagesChannel = supabase
      .channel(`realtime:messages:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          qc.invalidateQueries({ queryKey: ['messaging'] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notificationsChannel)
      supabase.removeChannel(messagesChannel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return null
}
