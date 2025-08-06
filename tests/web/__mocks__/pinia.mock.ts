/**
 * Pinia mock for testing
 * Provides utilities to test Pinia stores
 */

import { vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Create a fresh Pinia instance for each test
export const createTestPinia = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

// Mock auth store for user store tests
export const createMockAuthStore = () => ({
  user: {
    id: 'auth-user-1',
    email: 'test@example.com'
  },
  isAuthenticated: true,
  loading: false
})

// Helper to setup auth store mock
export const setupMockAuthStore = () => {
  vi.mock('@/stores/auth.store', () => ({
    useAuthStore: vi.fn(() => createMockAuthStore())
  }))
}