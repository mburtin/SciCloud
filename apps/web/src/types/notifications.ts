/**
 * Notification types for real-time system
 */

import type { Ref } from 'vue'
import type { UUID } from './base'

// Notification type categories
export type NotificationTypeCategory = 'project' | 'collaboration' | 'system' | 'document'

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high'

// Toast notification variants (for vue-sonner)
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

// Database notification entity
export interface Notification {
  id: UUID
  user_id: UUID
  type: NotificationTypeCategory
  title: string
  message: string
  read: boolean
  priority: NotificationPriority
  data?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Notification for API responses and database operations
export interface NotificationInsert {
  user_id: UUID
  type: NotificationTypeCategory
  title: string
  message: string
  priority?: NotificationPriority
  data?: Record<string, unknown>
}

export interface NotificationUpdate {
  read?: boolean
  data?: Record<string, unknown>
}

// Notification settings from database
export interface NotificationSettings {
  user_id: UUID
  email_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  types_config: Record<NotificationTypeCategory, {
    enabled: boolean
    email: boolean
    push: boolean
  }>
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  created_at: string
  updated_at: string
}

export interface NotificationSettingsUpdate {
  email_enabled?: boolean
  push_enabled?: boolean
  in_app_enabled?: boolean
  types_config?: NotificationSettings['types_config']
  quiet_hours_enabled?: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
}

// Realtime event types
export interface RealtimeNotificationPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: Notification
  old?: Notification
}

// Toast notification interface
export interface ToastNotification {
  id?: string
  title: string
  message: string
  variant: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Store state interfaces
export interface NotificationsState {
  notifications: Notification[]
  settings: NotificationSettings | null
  unreadCount: number
  loading: boolean
  realtimeConnected: boolean
}

// Composable return types
export interface UseNotificationReturn {
  showToast: (notification: ToastNotification) => void
  success: (title: string, message: string) => void
  error: (title: string, message: string) => void
  warning: (title: string, message: string) => void
  info: (title: string, message: string) => void
}

export interface UseRealtimeNotificationsReturn {
  isConnected: Readonly<Ref<boolean>>
  connect: (userId: UUID) => void
  disconnect: () => void
}
