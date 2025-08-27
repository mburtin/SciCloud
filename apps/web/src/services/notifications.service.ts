/**
 * Notifications Service
 * Handles all notification CRUD operations and Supabase Realtime integration
 */

import type {
  Notification,
  NotificationInsert,
  NotificationSettings,
  NotificationSettingsUpdate,
  NotificationsService,
  NotificationUpdate,
  RealtimeNotificationPayload,
  UUID
} from '@/types/notifications'
import { createClient } from '@supabase/supabase-js'

class NotificationsServiceImpl implements NotificationsService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  /**
   * Get notifications for the current user
   */
  async getNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('user_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(id: UUID): Promise<Notification | null> {
    const { data, error } = await this.supabase
      .from('user_notifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Create a new notification
   */
  async createNotification(notification: NotificationInsert): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('user_notifications')
      .insert(notification)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: UUID): Promise<void> {
    const { error } = await this.supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    const { error } = await this.supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('read', false)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Update a notification
   */
  async updateNotification(id: UUID, updates: NotificationUpdate): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('user_notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: UUID): Promise<void> {
    const { error } = await this.supabase
      .from('user_notifications')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Get notification settings for current user
   */
  async getSettings(): Promise<NotificationSettings> {
    const { data, error } = await this.supabase
      .from('user_notification_settings')
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default ones
        return this.createDefaultSettings()
      }
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Update notification settings
   */
  async updateSettings(updates: NotificationSettingsUpdate): Promise<NotificationSettings> {
    const { data, error } = await this.supabase
      .from('user_notification_settings')
      .update(updates)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
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
        .from('user_notification_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch {
      throw new Error('Failed to create default notification settings')
    }
  }

  /**
   * Subscribe to realtime notifications
   */
  subscribeToNotifications(
    userId: UUID,
    // eslint-disable-next-line no-unused-vars
    callback: (payload: RealtimeNotificationPayload) => void
  ): () => void {
    const channel = this.supabase
      .channel(`user_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
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
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      return 0
    }

    const { data, error } = await this.supabase
      .rpc('get_unread_notifications_count', { user_uuid: user.user.id })

    if (error) {
      return 0
    }

    return data || 0
  }

  /**
   * Check if user is in quiet hours
   */
  async isInQuietHours(): Promise<boolean> {
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
  }

  /**
   * Get current user ID
   */
  async getCurrentUserId(): Promise<UUID | null> {
    const { data: user } = await this.supabase.auth.getUser()
    return user.user?.id || null
  }
}

// Export singleton instance
export const notificationsService = new NotificationsServiceImpl()
export default notificationsService
