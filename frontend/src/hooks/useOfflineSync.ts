import { useCallback, useEffect } from 'react'
import { processQueue } from '../lib/offlineQueue'

export function useOfflineSync({ token }:{token?: string}) {
  const handler = useCallback(async () => {
    try {
      await processQueue({ token })
    } catch (err) {
      // silently fail; we'll retry on next reconnect
      console.warn('Offline sync failed', err)
    }
  }, [token])

  useEffect(() => {
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [handler])

  return { triggerSync: handler }
}
