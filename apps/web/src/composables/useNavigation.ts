/**
 * Navigation composable - Manages navigation and notifications
 */

import { ref, computed, onMounted } from 'vue'
import { navigationService } from '@/services/navigation.service'
import type { NavigationModule } from '@/types/ui'
import type { Notification } from '@/types/notifications'

export function useNavigation() {
  // State
  const mainModules = ref<NavigationModule[]>([])
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  // Methods
  const fetchMainModules = async () => {
    try {
      const modules = await navigationService.getMainModules()
      mainModules.value = modules
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load navigation'
      console.error('Navigation fetch error:', err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const notifs = await navigationService.getNotifications()
      notifications.value = notifs
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load notifications'
      console.error('Notifications fetch error:', err)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await navigationService.markNotificationAsRead(notificationId)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await navigationService.markAllNotificationsAsRead()
      notifications.value.forEach(n => n.read = true)
    } catch (err) {
      console.error('Mark all as read error:', err)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
      })
    }
  }

  // Load data on mount
  onMounted(() => {
    fetchMainModules()
    fetchNotifications()
  })

  return {
    // State
    mainModules,
    notifications,
    isLoading,
    error,

    // Computed
    unreadNotifications,

    // Methods
    fetchMainModules,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatTimestamp
  }
}