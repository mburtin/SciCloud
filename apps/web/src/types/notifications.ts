/**
 * Notification types
 */

import type { UUID } from './base'

// Notification type categories
export type NotificationTypeCategory = 'project' | 'collaboration' | 'system' | 'document'

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high'

// Basic notification entity
export interface Notification {
  id: UUID
  type: NotificationTypeCategory
  title: string
  message: string
  read: boolean
  timestamp: string
  priority: NotificationPriority
}

// Notification settings types
export interface NotificationMethod {
  label: string
  enabled: boolean
}

export interface NotificationType {
  label: string
  description: string
  icon: string
  enabled: boolean
}

export interface QuietHours {
  enabled: boolean
  start: string
  end: string
}

export interface NotificationSettings {
  methods: Record<string, NotificationMethod>
  types: Record<string, NotificationType>
  quietHours: QuietHours
}
