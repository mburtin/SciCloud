/**
 * Notifications Service
 * Handles all notification CRUD operations and Supabase Realtime integration
 */

import { createClient } from '@supabase/supabase-js'
import type {
  Notification,
  NotificationInsert,
  NotificationUpdate,
  NotificationSettings,
  NotificationSettingsUpdate,
  NotificationsService,
  RealtimeNotificationPayload,
  UUID
} from '@/types/notifications'

class NotificationsServiceImpl implements NotificationsService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  /**
   * Get notifications for the current user
   */
  async getNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching notifications:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Failed to get notifications:', error)
      throw error
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(id: UUID): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        console.error('Error fetching notification:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to get notification:', error)
      throw error
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notification: NotificationInsert): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: UUID): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) {
        console.error('Error marking notification as read:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  /**
   * Update a notification
   */
  async updateNotification(id: UUID, updates: NotificationUpdate): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating notification:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to update notification:', error)
      throw error
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: UUID): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting notification:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }

  /**
   * Get notification settings for current user
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default ones
          return this.createDefaultSettings()
        }
        console.error('Error fetching notification settings:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to get notification settings:', error)
      throw error
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(updates: NotificationSettingsUpdate): Promise<NotificationSettings> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .update(updates)
        .select()
        .single()

      if (error) {
        console.error('Error updating notification settings:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      throw error
    }
  }

  /**
   * Create default settings for new user
   */
  private async createDefaultSettings(): Promise<NotificationSettings> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) {
        throw new Error('User not authenticated')
      }

      const defaultSettings: Omit<NotificationSettings, 'created_at' | 'updated_at'> = {
        user_id: user.user.id,
        email_enabled: true,
        push_enabled: true,
        in_app_enabled: true,
        types_config: {
          project: { enabled: true, email: true, push: true },
          collaboration: { enabled: true, email: true, push: true },
          system: { enabled: true, email: false, push: true },
          document: { enabled: true, email: false, push: false }
        },
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00:00',
        quiet_hours_end: '08:00:00'
      }

      const { data, error } = await this.supabase
        .from('notification_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        console.error('Error creating default notification settings:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to create default notification settings:', error)
      throw error
    }
  }

  /**
   * Subscribe to realtime notifications
   */
  subscribeToNotifications(
    userId: UUID,
    callback: (payload: RealtimeNotificationPayload) => void
  ): () => void {
    const channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Notification,
            old: payload.old as Notification
          })
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      channel.unsubscribe()
    }
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) {
        return 0
      }

      const { data, error } = await this.supabase
        .rpc('get_unread_notifications_count', { user_uuid: user.user.id })

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  }

  /**
   * Check if user is in quiet hours
   */
  async isInQuietHours(): Promise<boolean> {
    try {
      const settings = await this.getSettings()
      if (!settings.quiet_hours_enabled) {
        return false
      }

      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`
      
      const start = settings.quiet_hours_start
      const end = settings.quiet_hours_end

      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (start > end) {
        return currentTime >= start || currentTime <= end
      } else {
        return currentTime >= start && currentTime <= end
      }
    } catch (error) {
      console.error('Failed to check quiet hours:', error)
      return false
    }
  }

  /**
   * Get current user ID
   */
  async getCurrentUserId(): Promise<UUID | null> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      return user.user?.id || null
    } catch (error) {
      console.error('Failed to get current user ID:', error)
      return null
    }
  }
}

// Export singleton instance
export const notificationsService = new NotificationsServiceImpl()
export default notificationsService