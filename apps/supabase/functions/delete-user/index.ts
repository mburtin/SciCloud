// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface DeleteUserRequest {
  userId: string
}

interface DeleteUserResponse {
  success: boolean
  error?: string
}

Deno.serve(async (req) => {
  console.log(`[DEBUG] ${new Date().toISOString()} - Delete user request:`, req.method, req.url)
  
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[DEBUG] CORS preflight request')
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
    console.log('[DEBUG] Authorization header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      console.log('[DEBUG] No authorization header')
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
    console.log('[DEBUG] Verifying user authentication...')
    const { data: { user }, error: authError } = await userSupabase.auth.getUser()
    
    if (authError) {
      console.log('[DEBUG] Auth error:', authError)
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

    if (!user) {
      console.log('[DEBUG] No user found')
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

    console.log('[DEBUG] User authenticated:', user.id, user.email)

    // Check if user is admin by querying their profile
    console.log('[DEBUG] Checking admin role...')
    const { data: profile, error: profileError } = await userSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('[DEBUG] Profile error:', profileError)
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

    if (!profile) {
      console.log('[DEBUG] No profile found')
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

    console.log('[DEBUG] User profile role:', profile.role)

    if (profile.role !== 'admin') {
      console.log('[DEBUG] User is not admin')
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

    console.log('[DEBUG] Admin validation passed')

    // Parse request body
    const deleteData: DeleteUserRequest = await req.json()
    console.log('[DEBUG] Delete request for user ID:', deleteData.userId)

    // Validate required fields
    if (!deleteData.userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required field: userId' 
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

    // Prevent admin from deleting themselves
    if (deleteData.userId === user.id) {
      console.log('[DEBUG] Admin trying to delete themselves')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot delete your own account' 
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

    // Delete the user (this will cascade delete the profile due to foreign key constraint)
    console.log('[DEBUG] Deleting user with admin client...')
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(deleteData.userId)

    if (deleteError) {
      console.log('[DEBUG] Delete error:', deleteError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to delete user: ${deleteError.message}` 
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

    console.log('[DEBUG] User deleted successfully')

    // Return success response
    const response: DeleteUserResponse = {
      success: true
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
    console.error('[DEBUG] Edge function error:', error)
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-user' \
    --header 'Authorization: Bearer [YOUR_ADMIN_JWT_TOKEN]' \
    --header 'Content-Type: application/json' \
    --data '{
      "userId": "user-id-to-delete"
    }'

*/