/**
 * Test utilities
 * Common functions and helpers for testing
 */

import { vi, beforeEach, afterEach } from 'vitest'
import type { User, UserRole } from '@/types/supabase'

// Helper to create mock users
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'test@example.com',
  phone: null,
  first_name: 'Test',
  last_name: 'User',
  biography: 'Test biography',
  location: 'Test City',
  full_address: '123 Test Street',
  avatar_url: null,
  role: 'user' as UserRole,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

// Helper to create multiple mock users
export const createMockUsers = (count: number, baseOverrides: Partial<User> = {}): User[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({
      id: `user-${index + 1}`,
      first_name: `User${index + 1}`,
      ...baseOverrides
    })
  )
}

// Helper to create mock user for different roles
export const createMockAdmin = (overrides: Partial<User> = {}): User => 
  createMockUser({ role: 'admin', ...overrides })

export const createMockRegularUser = (overrides: Partial<User> = {}): User => 
  createMockUser({ role: 'user', ...overrides })

// Helper to create mock API responses
export const createMockApiResponse = <T>(data: T, success = true, error?: string) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : error
})

// Helper to create mock Edge Function responses
export const createMockEdgeFunctionResponse = <T>(data: T, success = true, error?: string) => 
  createMockApiResponse(data, success, error)

// Helper to wait for next tick (useful for reactive updates)
export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to wait for multiple ticks
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock console methods for specific tests
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  return originalConsole
}

// Helper to create date strings for testing
export const createTestDate = (daysAgo = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// Helper to mock environment variables (for edge function tests)
export const mockEnvVars = (vars: Record<string, string>) => {
  const mockEnv = {
    get: vi.fn((key: string) => vars[key] || undefined)
  }
  
  // For Edge Function tests (Deno environment)
  ;(globalThis as any).Deno = {
    env: mockEnv
  }
  
  return mockEnv
}

// Helper to create mock Request object for Edge Function tests
export const createMockRequest = (
  method = 'POST',
  body: any = {},
  headers: Record<string, string> = {}
): Request => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  return {
    method,
    headers: {
      get: vi.fn((key: string) => (defaultHeaders as Record<string, string>)[key] || null),
      has: vi.fn((key: string) => key in defaultHeaders),
      forEach: vi.fn(),
      entries: vi.fn(),
      keys: vi.fn(),
      values: vi.fn()
    },
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    url: 'http://localhost:54321/functions/v1/test-function'
  } as any
}

// Helper to create mock Response for Edge Function tests
export const createMockResponse = (
  body: any,
  status = 200,
  headers: Record<string, string> = {}
) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}