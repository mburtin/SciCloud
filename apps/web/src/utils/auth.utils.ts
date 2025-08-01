/**
 * Authentication utilities - Centralized auth helpers
 */

import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

/**
 * Centralized helper to require authentication
 * Replaces the repetitive pattern used across services
 */
export async function requireAuth(): Promise<SupabaseUser> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error('Authentication failed')
  }
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Unified error handler for auth operations
 * Standardizes error handling across services
 */
export function handleAuthError(error: unknown): never {
  const message = error instanceof Error ? error.message : 'Unknown error occurred'
  throw new Error(message)
}

/**
 * Standardized result format for auth operations
 */
export function createAuthResult<T>(data?: T, error?: string): { success: boolean; data?: T; error?: string } {
  if (error) {
    return { success: false, error }
  }
  return { success: true, data }
}