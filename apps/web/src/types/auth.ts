/**
 * Authentication and user-related types - Supabase 2025 Standards
 * Modern, clean implementation without legacy compatibility
 */

import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'

/**
 * Unified Session interface
 * Combines technical session data with UI display info
 * Properties are optional to support different use cases
 */
export interface Session {
  // Core identification
  id?: string
  sessionId?: string
  user?: SupabaseUser | null
  isValid?: boolean
  expiresAt?: number
  refreshToken?: string | null
  isAuthenticated: boolean
  isInitialized?: boolean

  // UI Display data (for user interface)
  device?: string
  location?: string
  lastActive?: number
  isActive?: boolean
  isCurrent?: boolean
}

/**
 * Auth events for modern session management
 * Handles all authentication state changes
 */
export type AuthEventType = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT' 
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'SESSION_EXPIRED'

export interface AuthEvent {
  type: AuthEventType
  session: SupabaseSession | null
  user: SupabaseUser | null
  timestamp: number
}

// =============================================================================
// AUTH API TYPES (Form handling)
// =============================================================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string
  lastName: string
  confirmPassword: string
}
