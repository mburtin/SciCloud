/**
 * Authentication and user-related types
 */

import type { User } from './user'

// Auth-specific types (for session management)
export interface AuthUser extends Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> {
  avatar_url?: string
}

export interface Session {
  id: string
  user: AuthUser
  device: string
  location: string
  lastActive: string
  isActive: boolean
}

// Auth API types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string
  lastName: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}