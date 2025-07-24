/**
 * Navigation service - Handles navigation data operations
 * Currently using mock data, will be replaced with Supabase calls
 */

import { mockMainModules } from '@/mocks/navigation.mock'
import { mockNotifications } from '@/mocks/notifications.mock'

export class NavigationService {
  /**
   * Get main navigation modules
   */
  async getMainModules() {
    // TODO: Replace with Supabase call for user-specific navigation
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('user_navigation_modules')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .eq('is_enabled', true)
    //   .order('order_index')
    await new Promise(resolve => setTimeout(resolve, 50))
    return mockMainModules
  }

  /**
   * Get user notifications
   */
  async getNotifications() {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .order('created_at', { ascending: false })
    //   .limit(20)
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockNotifications
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string) {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .update({ read: true, read_at: new Date().toISOString() })
    //   .eq('id', notificationId)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Update mock data for now
    const notification = mockNotifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead() {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .update({ read: true, read_at: new Date().toISOString() })
    //   .eq('user_id', user.id)
    //   .eq('read', false)
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Update mock data for now
    mockNotifications.forEach(n => n.read = true)
  }
}

export const navigationService = new NavigationService()