/**
 * User composable - Manages user data and profile state
 */

import { ref, computed } from 'vue'
import { userService } from '@/services/user.service'
import type { User } from '@/types/user'
import type { Session } from '@/types/auth'
import type { NotificationSettings } from '@/types/notifications'

export function useUser() {
  // State
  const currentUser = ref<(Pick<User, 'firstName' | 'lastName' | 'email'> & { avatar_url?: string }) | null>(null)
  const userProfile = ref<User | null>(null)
  const userSessions = ref<Session[]>([])
  const notificationSettings = ref<NotificationSettings | null>(null)
  const isLoading = ref(false)
  const isLoadingProfile = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const userDisplayName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`.trim()
  })

  const userInitials = computed(() => {
    if (!currentUser.value) return ''
    const firstName = currentUser.value.firstName || ''
    const lastName = currentUser.value.lastName || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  })

  const activeSessions = computed(() => 
    userSessions.value.filter(session => session.isActive)
  )

  // Methods
  const fetchCurrentUser = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const user = await userService.getCurrentUser()
      currentUser.value = user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user data'
      console.error('User fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserProfile = async () => {
    isLoadingProfile.value = true
    error.value = null

    try {
      const profile = await userService.getUserProfile()
      userProfile.value = profile
      return profile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user profile'
      console.error('User profile fetch error:', err)
      return null
    } finally {
      isLoadingProfile.value = false
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedProfile = await userService.updateProfile(updates)
      userProfile.value = updatedProfile
      
      // Update current user if basic info changed
      if (updates.firstName || updates.lastName || updates.email) {
        if (currentUser.value) {
          currentUser.value = {
            ...currentUser.value,
            firstName: updatedProfile.firstName,
            lastName: updatedProfile.lastName,
            email: updatedProfile.email
          }
        }
      }
      
      return updatedProfile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      console.error('Profile update error:', err)
      throw err
    }
  }

  const fetchUserSessions = async () => {
    try {
      const sessions = await userService.getUserSessions()
      userSessions.value = sessions
      return sessions
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user sessions'
      console.error('User sessions fetch error:', err)
      return []
    }
  }

  const fetchNotificationSettings = async () => {
    try {
      const settings = await userService.getNotificationSettings()
      notificationSettings.value = settings
      return settings
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load notification settings'
      console.error('Notification settings fetch error:', err)
      return null
    }
  }

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      const updatedSettings = await userService.updateNotificationSettings(settings)
      notificationSettings.value = updatedSettings
      return updatedSettings
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update notification settings'
      console.error('Notification settings update error:', err)
      throw err
    }
  }

  return {
    // State
    currentUser,
    userProfile,
    userSessions,
    notificationSettings,
    isLoading,
    isLoadingProfile,
    error,

    // Computed
    userDisplayName,
    userInitials,
    activeSessions,

    // Methods
    fetchCurrentUser,
    fetchUserProfile,
    updateProfile,
    fetchUserSessions,
    fetchNotificationSettings,
    updateNotificationSettings
  }
}