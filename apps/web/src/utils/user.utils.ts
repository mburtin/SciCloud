/**
 * User utility functions
 * Business logic for user data manipulation
 */

import type { User, UserStats, UserRole } from '@/types/supabase'

/**
 * Determine user status based on activity
 */
export const getUserStatus = (user: User): 'active' | 'inactive' => {
  // Check for explicit status in biography first (temporary solution)
  const biographyStatus = user.biography?.match(/^Status: (active|inactive)\. /)
  if (biographyStatus) {
    return biographyStatus[1] as 'active' | 'inactive'
  }
  
  // Fallback to last sign-in logic
  const lastSignIn = user.updated_at ? new Date(user.updated_at) : null
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return lastSignIn && lastSignIn > thirtyDaysAgo ? 'active' : 'inactive'
}

/**
 * Calculate user statistics from user list
 */
export const calculateUserStats = (users: User[]): UserStats => {
  const total = users.length
  const active = users.filter(u => getUserStatus(u) === 'active').length
  const inactive = users.filter(u => getUserStatus(u) === 'inactive').length
  const admins = users.filter(u => u.role === 'admin').length
  const usersCount = users.filter(u => u.role === 'user').length

  return {
    total,
    active,
    inactive,
    admins,
    users: usersCount
  }
}

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get human-readable role label
 */
export const getRoleLabel = (role: UserRole): string => {
  const labels = {
    admin: 'Administrator',
    user: 'User'
  }
  return labels[role] || role
}

/**
 * Get role variant for UI badges
 */
export const getRoleVariant = (role: UserRole): 'destructive' | 'default' | 'secondary' => {
  const variants = {
    admin: 'destructive',
    user: 'default'
  }
  return variants[role] as 'destructive' | 'default' | 'secondary'
}

/**
 * Get status variant for UI badges
 */
export const getStatusVariant = (status: string): 'default' | 'secondary' => {
  return status === 'active' ? 'default' : 'secondary'
}