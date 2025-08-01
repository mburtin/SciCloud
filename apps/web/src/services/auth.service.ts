/**
 * Authentication Service - Consolidated and Simplified
 * Pure API communication layer for authentication operations
 * Follows modern Supabase + Vue 3 patterns (2025)
 */

import { supabase } from '@/lib/supabase'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'
import type { User } from '@/types/supabase'
import type { Session } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
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
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Set up auth state change listener
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
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
  } catch (err: any) {
    return { success: false, error: err.message }
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
  } catch (err: any) {
    return { success: false, error: err.message }
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
  } catch (err: any) {
    return { success: false, error: err.message }
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
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Update user profile in database
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<AuthResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        biography: updates.biography,
        location: updates.location,
        full_address: updates.fullAddress,
        avatar_url: updates.avatar_url,
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}