import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

// These values will be different for local development vs production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Core session management
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,

    // Supabase 2025 security standards
    flowType: 'pkce', // Enhanced security for OAuth flows

    // Enhanced session security
    debug: process.env.NODE_ENV === 'development'
  },

  // Additional client options for better reliability
  global: {
    headers: {
      'X-Client-Info': 'scicloud-web@1.0.0'
    }
  }
})
