/**
 * Real-time Notifications Composable
 * Handles Supabase Realtime WebSocket connections for notifications
 */

import { useNotification } from '@/composables/useNotification'
import { notificationsService } from '@/services/notifications.service'
import { useNotificationsStore } from '@/stores/notifications.store'
import type {
  Notification,
  RealtimeNotificationPayload,
  UUID
} from '@/types/notifications'
import { onUnmounted, ref } from 'vue'

export function useRealtimeNotifications() {
  const notificationsStore = useNotificationsStore()
  const { success, error, info } = useNotification()

  // State
  const isConnected = ref(false)

  // Keep track of unsubscribe function
  let unsubscribeFunction: (() => void) | null = null

  const connect = async (userId: UUID) => {
    try {
      // Disconnect existing connection if any
      disconnect()

      // Check if notifications are enabled (use store instead of API call)
      if (!notificationsStore.isNotificationsEnabled) {
        return
      }

      // Subscribe to realtime notifications
      unsubscribeFunction = notificationsService.subscribeToNotifications(
        userId,
        handleRealtimeEvent
      )

      isConnected.value = true
      notificationsStore.setRealtimeConnected(true)
    } catch {
      isConnected.value = false
      notificationsStore.setRealtimeConnected(false)
    }
  }

  const disconnect = () => {
    if (unsubscribeFunction) {
      unsubscribeFunction()
      unsubscribeFunction = null
    }

    isConnected.value = false
    notificationsStore.setRealtimeConnected(false)

  }

  const showNotificationToast = (notification: Notification): void => {
    switch (notification.priority) {
      case 'high':
        error(notification.title, notification.message)
        break
      case 'medium':
        info(notification.title, notification.message)
        break
      case 'low':
      default:
        success(notification.title, notification.message)
        break
    }
  }

  const handleRealtimeEvent = async (payload: RealtimeNotificationPayload) => {
    try {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) {
            // Add to store
            notificationsStore.addNotification(payload.new)

            // Show toast if appropriate (using store logic)
            if (await notificationsStore.shouldShowToast(payload.new)) {
              showNotificationToast(payload.new)
            }
          }
          break

        case 'UPDATE':
          if (payload.new) {
            notificationsStore.updateNotification(payload.new)
          }
          break

        case 'DELETE':
          if (payload.old) {
            notificationsStore.removeNotification(payload.old.id)
          }
          break

        default:
      }
    } catch {
      // Error handling realtime event
    }
  }


  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected: isConnected,
    connect,
    disconnect
  }
}

export type UseRealtimeNotifications = ReturnType<typeof useRealtimeNotifications>
