/**
 * Notifications Store - Pinia
 * Global state management for notifications system
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Notification,
  NotificationSettings,
  NotificationSettingsUpdate,
  NotificationTypeCategory,
  UUID
} from '@/types/notifications'
import { notificationsService } from '@/services/notifications.service'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const settings = ref<NotificationSettings | null>(null)
  const loading = ref(false)
  const realtimeConnected = ref(false)
  const lastError = ref<string | null>(null)

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const notificationsByType = computed(() => {
    return (type: NotificationTypeCategory) => {
      return notifications.value.filter(n => n.type === type)
    }
  })

  const hasUnreadNotifications = computed(() => {
    return unreadCount.value > 0
  })

  const isNotificationsEnabled = computed(() => {
    return settings.value?.in_app_enabled ?? true
  })

  // Actions
  const fetchNotifications = async (limit = 50, offset = 0): Promise<void> => {
    try {
      loading.value = true
      lastError.value = null
      
      const data = await notificationsService.getNotifications(limit, offset)
      
      if (offset === 0) {
        notifications.value = data
      } else {
        notifications.value.push(...data)
      }
    } catch {
      lastError.value = "Unknown error"; // 'Failed to fetch notifications'
    } finally {
      loading.value = false
    }
  }

  const fetchSettings = async (): Promise<void> => {
    try {
      loading.value = true
      lastError.value = null
      
      const data = await notificationsService.getSettings()
      settings.value = data
    } catch {
      lastError.value = "Unknown error"; // 'Failed to fetch settings'
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: UUID): Promise<void> => {
    try {
      await notificationsService.markAsRead(id)
      
      // Update local state
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
        notification.updated_at = new Date().toISOString()
      }
    } catch {
      lastError.value = "Unknown error"; // 'Failed to mark as read'
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    try {
      await notificationsService.markAllAsRead()
      
      // Update local state
      notifications.value.forEach(notification => {
        if (!notification.read) {
          notification.read = true
          notification.updated_at = new Date().toISOString()
        }
      })
    } catch {
      lastError.value = "Unknown error"; // 'Failed to mark all as read'
    }
  }

  const deleteNotification = async (id: UUID): Promise<void> => {
    try {
      await notificationsService.deleteNotification(id)
      
      // Update local state
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    } catch {
      lastError.value = "Unknown error"; // 'Failed to delete notification'
    }
  }

  const updateSettings = async (updates: NotificationSettingsUpdate): Promise<void> => {
    try {
      loading.value = true
      lastError.value = null
      
      const updatedSettings = await notificationsService.updateSettings(updates)
      settings.value = updatedSettings
    } catch {
      lastError.value = "Unknown error"; // 'Failed to update settings'
    } finally {
      loading.value = false
    }
  }

  const addNotification = (notification: Notification): void => {
    // Add to beginning of array (newest first)
    notifications.value.unshift(notification)
    
    // Optionally limit the number of notifications kept in memory
    const maxNotifications = 1000
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications)
    }
  }

  const shouldShowToast = async (notification: Notification): Promise<boolean> => {
    // Check if in-app notifications are enabled
    if (!settings.value?.in_app_enabled) return false

    // Check if this notification type is enabled
    const typeConfig = settings.value.types_config[notification.type]
    if (!typeConfig?.enabled) return false

    // Check quiet hours
    const isQuietTime = await notificationsService.isInQuietHours()
    if (isQuietTime) return false

    return true
  }

  const updateNotification = (updatedNotification: Notification): void => {
    const index = notifications.value.findIndex(n => n.id === updatedNotification.id)
    if (index !== -1) {
      notifications.value[index] = updatedNotification
    }
  }

  const removeNotification = (id: UUID): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const refreshUnreadCount = async (): Promise<void> => {
    try {
      // The computed unreadCount will automatically update
      // when notifications array changes, but this can be used
      // for server-side verification if needed
      const serverCount = await notificationsService.getUnreadCount()
      
      // Log discrepancy for debugging
      if (serverCount !== unreadCount.value) {
        // Server count differs from client count
      }
    } catch {
      // Error fetching server count
    }
  }

  const setRealtimeConnected = (connected: boolean): void => {
    realtimeConnected.value = connected
  }

  const clearError = (): void => {
    lastError.value = null
  }

  const resetStore = (): void => {
    notifications.value = []
    settings.value = null
    loading.value = false
    realtimeConnected.value = false
    lastError.value = null
  }

  // Initialize store
  const initialize = async (): Promise<void> => {
    try {
      await Promise.all([
        fetchNotifications(),
        fetchSettings()
      ])
    } catch {
      // Error during initialization
    }
  }

  return {
    // State
    notifications: notifications,
    settings: settings,
    loading: loading,
    realtimeConnected: realtimeConnected,
    lastError: lastError,

    // Computed
    unreadCount,
    unreadNotifications,
    notificationsByType,
    hasUnreadNotifications,
    isNotificationsEnabled,

    // Actions
    fetchNotifications,
    fetchSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    addNotification,
    shouldShowToast,
    updateNotification,
    removeNotification,
    refreshUnreadCount,
    setRealtimeConnected,
    clearError,
    resetStore,
    initialize
  }
})

export type NotificationsStore = ReturnType<typeof useNotificationsStore>