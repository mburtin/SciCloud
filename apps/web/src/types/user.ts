/**
 * User profile types
 */
import type { DatabaseEntity } from './base'

// User role enum
export type UserRole = 'admin' | 'user' | 'viewer'

// User interface
export interface User extends DatabaseEntity {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar_url?: string
  biography: string
  phone: string
  location: string
  fullAddress: string
  stats: UserStat[]
}

// User statistics interface
export interface UserStat {
  label: string
  value: number
  icon: any
}
