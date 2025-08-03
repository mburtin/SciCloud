// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface CreateUserRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  biography?: string
  location?: string
  full_address?: string
  avatar_url?: string
  role?: 'user' | 'admin'
}

interface CreateUserResponse {
  success: boolean
  data?: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey, x-client-info',
      },
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create Supabase client with user's auth context for validation
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: { Authorization: authHeader },
      }
    })

    // Verify the requesting user is authenticated and is an admin
    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Check if user is admin by querying their profile
    console.log('[DEBUG] Checking admin role...')
    const { data: profile, error: profileError } = await userSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { 
          status: 403,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Parse request body
    const userData: CreateUserRequest = await req.json()

    // Validate required fields
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email, password, first_name, last_name' 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Create admin Supabase client with service role
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create the auth user
    const { data: authData, error: createError } = await adminSupabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
    })

    if (createError || !authData.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: createError?.message || 'Failed to create user' 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Create the user profile
    const { error: profileInsertError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        biography: userData.biography || '',
        location: userData.location || '',
        full_address: userData.full_address || '',
        avatar_url: userData.avatar_url || null,
        role: userData.role || 'user'
      })

    if (profileInsertError) {
      // Rollback: delete the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Profile creation failed: ${profileInsertError.message}` 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Return success response
    const response: CreateUserResponse = {
      success: true,
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || 'user'
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-user' \
    --header 'Authorization: Bearer [YOUR_ADMIN_JWT_TOKEN]' \
    --header 'Content-Type: application/json' \
    --data '{
      "email": "newuser@example.com",
      "password": "securepassword123",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    }'

*/