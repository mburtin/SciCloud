/**
 * Authentication Service - Consolidated and Simplified
 * Pure API communication layer for authentication operations
 * Follows modern Supabase + Vue 3 patterns (2025)
 */

import { supabase } from '@/lib/supabase'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'
import type { Session } from '@supabase/supabase-js'

export interface AuthResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<AuthResult<{ session: Session | null }>> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'Failed to get user' }
  }
}

/**
 * Get current user (server-validated)
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'Failed to get session' }
  }
}

/**
 * Set up auth state change listener
 */
export function onAuthStateChange(
  // eslint-disable-next-line no-unused-vars
  callback: (event: string, session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return () => subscription.unsubscribe()
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'Failed to get session' }
  }
}

/**
 * Register new user
 */
export async function signUpWithPassword(credentials: RegisterCredentials): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName
        }
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch {
    return { success: false, error: 'Failed to get session' }
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to get session' }
  }
}

/**
 * Sign out from all sessions
 */
export async function signOutEverywhere(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to get session' }
  }
}
