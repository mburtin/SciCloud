/**
 * Authentication types - Simplified for modern Supabase patterns
 * Uses native Supabase types where possible
 */

// Re-export Supabase types for convenience
export type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js'

// Form handling types

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string
  lastName: string
  confirmPassword: string
}
