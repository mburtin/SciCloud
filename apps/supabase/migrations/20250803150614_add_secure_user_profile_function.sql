-- Add secure function to get user profile with proper permissions
-- This function runs with SECURITY DEFINER, so it has elevated permissions
-- to access auth.users table while still respecting RLS

CREATE OR REPLACE FUNCTION get_user_profile(user_id uuid)
RETURNS TABLE (
    id uuid,
    email varchar(255),
    phone text,
    created_at timestamptz,
    updated_at timestamptz,
    first_name text,
    last_name text,
    biography text,
    location text,
    full_address text,
    avatar_url text,
    role text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    requesting_user_id uuid;
    requesting_user_role text;
BEGIN
    -- Get the current user from JWT
    requesting_user_id := auth.uid();
    
    -- If no authenticated user, return empty
    IF requesting_user_id IS NULL THEN
        RETURN;
    END IF;

    -- Get requesting user's role
    SELECT p.role INTO requesting_user_role 
    FROM profiles p 
    WHERE p.id = requesting_user_id;

    -- Check permissions:
    -- 1. User can see their own profile (with all data)
    -- 2. Admin can see any profile (with all data)
    -- 3. Regular users can see basic info of other users (no email/phone)
    
    IF requesting_user_id = user_id OR requesting_user_role = 'admin' THEN
        -- Full access: return all data including sensitive fields
        RETURN QUERY
        SELECT 
            u.id,
            u.email,
            u.phone,
            u.created_at,
            u.updated_at,
            p.first_name,
            p.last_name,
            p.biography,
            p.location,
            p.full_address,
            p.avatar_url,
            p.role
        FROM auth.users u
        JOIN profiles p ON u.id = p.id
        WHERE u.id = user_id;
    ELSE
        -- Limited access: return profile data without sensitive auth fields
        RETURN QUERY
        SELECT 
            p.id,
            NULL::varchar(255) as email,  -- Hide email
            NULL::text as phone,          -- Hide phone
            NULL::timestamptz as created_at,  -- Hide created_at
            NULL::timestamptz as updated_at,  -- Hide updated_at
            p.first_name,
            p.last_name,
            p.biography,
            p.location,
            p.full_address,
            p.avatar_url,
            p.role
        FROM profiles p
        WHERE p.id = user_id;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_profile(uuid) IS 
'Securely fetch user profile data with appropriate permissions. 
Users can see full data for their own profile, admins can see all data for any user, 
regular users can see limited public data for other users.';