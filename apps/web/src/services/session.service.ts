/**
 * Session Service - Modern Supabase 2025 Session Management
 * Handles token refresh, session validation, and security monitoring
 */

import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/utils/auth.utils'
import { parseUserAgent, getCurrentLocation } from '@/utils/device.utils'
import type { Session, AuthEvent, AuthEventType } from '@/types/auth'

class SessionService {
  private validationInterval: number | null = null
  private readonly VALIDATION_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly REFRESH_MARGIN = 5 * 60 * 1000 // 5 minutes before expiry

  /**
   * Get current session with server validation
   * Supabase 2025 standard: Always use getUser() for server validation
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      return await this.getCompleteSession()
    } catch (error) {
      console.error('Failed to get current session:', error)
      return null
    }
  }

  /**
   * Extract session ID from JWT token
   */
  private extractSessionId(token: string | undefined): string | undefined {
    if (!token) return undefined
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.session_id
    } catch {
      return undefined
    }
  }

  /**
   * Start proactive session management
   * Automatically refreshes tokens and validates sessions
   */
  startSessionManagement(): void {
    // Clear existing intervals
    this.stopSessionManagement()

    // Set up periodic validation
    this.validationInterval = window.setInterval(
      () => this.validateAndRefreshSession(),
      this.VALIDATION_INTERVAL
    )

    // Initial validation
    this.validateAndRefreshSession()
  }

  /**
   * Stop session management
   */
  stopSessionManagement(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }
  }

  /**
   * Validate current session and refresh if needed
   */
  private async validateAndRefreshSession(): Promise<boolean> {
    try {
      const sessionInfo = await this.getCurrentSession()
      
      if (!sessionInfo || !sessionInfo.isValid) {
        return false
      }

      const timeUntilExpiry = sessionInfo.expiresAt - Date.now()
      
      // If token expires soon, refresh it proactively
      if (timeUntilExpiry <= this.REFRESH_MARGIN) {
        console.log('Proactively refreshing session token')
        return await this.refreshSession()
      }

      return true
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Token refresh failed:', error)
        return false
      }

      if (data.session) {
        console.log('Session refreshed successfully')
        return true
      }

      return false
    } catch (error) {
      console.error('Session refresh error:', error)
      return false
    }
  }

  /**
   * Sign out from all sessions
   */
  async signOutEverywhere(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('Global sign out failed:', error)
        return false
      }

      this.stopSessionManagement()
      return true
    } catch (error) {
      console.error('Sign out error:', error)
      return false
    }
  }

  /**
   * Sign out from current session only
   */
  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      if (error) {
        console.error('Sign out failed:', error)
        return false
      }

      this.stopSessionManagement()
      return true
    } catch (error) {
      console.error('Sign out error:', error)
      return false
    }
  }

  /**
   * Handle auth state changes with modern event handling
   */
  onAuthStateChange(callback: (event: AuthEvent) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        const authEvent: AuthEvent = {
          type: event as AuthEventType,
          session,
          user: session?.user || null,
          timestamp: Date.now()
        }
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              this.startSessionManagement()
            }
            break
            
          case 'SIGNED_OUT':
            this.stopSessionManagement()
            break
            
          case 'TOKEN_REFRESHED':
            // Session management continues
            break
            
          case 'USER_UPDATED':
            // User data updated, session continues
            break
            
          default:
            // Handle other events (PASSWORD_RECOVERY, etc.)
            break
        }
        
        callback(authEvent)
      }
    )

    return () => {
      subscription.unsubscribe()
      this.stopSessionManagement()
    }
  }

  /**
   * Get complete session with both technical and UI data
   * Returns unified Session object
   */
  async getCompleteSession(): Promise<Session | null> {
    try {
      const user = await requireAuth()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null

      const expiresAt = new Date(session.expires_at || 0).getTime()
      const sessionId = this.extractSessionId(session.access_token)
      const userAgent = navigator.userAgent

      // Return unified session with both technical and UI data
      return {
        // Core identification
        id: sessionId || 'current',
        sessionId,
        
        // Technical/Security data
        user,
        isValid: expiresAt > Date.now(),
        expiresAt,
        refreshToken: session.refresh_token,
        
        // UI Display data
        device: parseUserAgent(userAgent),
        location: await getCurrentLocation(),
        lastActive: Date.now(),
        isActive: true,
        isCurrent: true
      }
    } catch (error) {
      console.error('Failed to get complete session:', error)
      return null
    }
  }

  /**
   * Get user sessions for UI display using real Supabase session data
   */
  async getUserSessions(): Promise<Session[]> {
    try {
      const completeSession = await this.getCompleteSession()
      if (!completeSession) return []

      return [completeSession]
    } catch (error) {
      console.error('Failed to get user sessions:', error)
      return []
    }
  }


  /**
   * Revoke a specific session (placeholder for future implementation)
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      // In a real implementation, you'd:
      // 1. Remove session from your sessions table
      // 2. If it's the current session, sign out
      // 3. For other sessions, you'd need server-side revocation
      
      if (sessionId === 'current') {
        return await this.signOut()
      }
      
      // For now, just log the action
      console.log(`Would revoke session: ${sessionId}`)
      return true
    } catch (error) {
      console.error('Failed to revoke session:', error)
      return false
    }
  }

}

export const sessionService = new SessionService()