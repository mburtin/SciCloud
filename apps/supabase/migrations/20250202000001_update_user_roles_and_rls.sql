-- Migration: Role simplification and RLS without recursion
-- Date: 2025-02-02
-- Description: Migration from 3-role system to 2-role system (admin/user)
--              with simple RLS policies avoiding infinite recursion

-- 1. Migrate existing data
-- Convert all 'viewer' to 'user'
UPDATE public.profiles SET role = 'user' WHERE role = 'viewer';

-- 2. Update role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'user'));

-- 3. Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Simple RLS policies (without recursion)

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Policy 2: Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Policy 3: Users can create their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 5. Functions for admin operations (bypass RLS with SECURITY DEFINER)

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

-- Function to retrieve all profiles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_user_profiles()
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  biography text,
  location text,
  full_address text,
  avatar_url text,
  role text,
  email text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.biography,
    p.location,
    p.full_address,
    p.avatar_url,
    p.role,
    u.email,
    u.phone,
    u.created_at,
    u.updated_at
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE public.is_admin_user(auth.uid()) = true
  ORDER BY p.first_name;
$$;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check that current user is admin
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can change user roles';
  END IF;
  
  -- Check that new role is valid
  IF new_role NOT IN ('admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role: must be admin or user';
  END IF;
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role 
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- Function to delete user (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check that current user is admin
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;
  
  -- First delete the profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Then delete from auth.users (this removes the user from authentication)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Failed to delete user: %', SQLERRM;
END;
$$;

-- 6. Index to optimize performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 7. Appropriate grants
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- 8. Comments for documentation
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 
  'Users can only view their own profile';

COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 
  'Users can update their profile (but not their role)';

COMMENT ON FUNCTION public.get_all_user_profiles() IS 
  'Function reserved for admins to retrieve all user profiles';

COMMENT ON FUNCTION public.admin_update_user_role(uuid, text) IS 
  'Function reserved for admins to update a user''s role';

COMMENT ON FUNCTION public.admin_delete_user(uuid) IS 
  'Function reserved for admins to completely delete a user from both profiles and auth.users tables';

-- 9. Secure function to get user profile with proper permissions
-- This function runs with SECURITY DEFINER, so it has elevated permissions
-- to access auth.users table while still respecting RLS

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
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

-- Grant execute permission for get_user_profile function
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;

-- Add comment for get_user_profile function
COMMENT ON FUNCTION public.get_user_profile(uuid) IS 
'Securely fetch user profile data with appropriate permissions. 
Users can see full data for their own profile, admins can see all data for any user, 
regular users can see limited public data for other users.';