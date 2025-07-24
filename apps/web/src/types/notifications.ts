/**
 * Notification types
 */

import type { UUID } from './base'

// Basic notification entity
export interface Notification{
  id: UUID
  title: string
  message: string
  read: boolean
  timestamp: string
}

// Notification settings types
export interface NotificationMethod {
  label: string
  enabled: boolean
}

export interface NotificationType {
  label: string
  description: string
  icon: any
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
