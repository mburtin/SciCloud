-- ====================================================
--              Functions related to users
-- ====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;

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
SET search_path = ''
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
  FROM public.user_profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE public.is_admin_user(auth.uid()) = true
  ORDER BY p.first_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_user_profiles() TO authenticated;

COMMENT ON FUNCTION public.get_all_user_profiles() IS
  'Function reserved for admins to retrieve all user profiles';

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  UPDATE public.user_profiles
  SET role = new_role
  WHERE id = target_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;

COMMENT ON FUNCTION public.admin_update_user_role(uuid, text) IS
  'Function reserved for admins to update a user''s role';

-- Function to delete user (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check that current user is admin
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- First delete the profile
  DELETE FROM public.user_profiles WHERE id = target_user_id;

  -- Then delete from auth.users (this removes the user from authentication)
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Failed to delete user: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

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
SET search_path = ''
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
    FROM public.user_profiles p
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
        JOIN public.user_profiles p ON u.id = p.id
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
        FROM public.user_profiles p
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

-- Add function to check if users exist (public access for bootstrap purposes)
CREATE OR REPLACE FUNCTION public.users_exist()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles LIMIT 1
  );
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.users_exist() TO anon, authenticated;

-- Add comment for the function
COMMENT ON FUNCTION public.users_exist() IS
'Check if any users exist in the system. Used for bootstrap purposes on welcome page.
Returns true if at least one user exists, false otherwise.
Public access granted for initial setup flow.';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function to auto-create notification settings for new users
CREATE OR REPLACE FUNCTION create_notification_settings_for_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Use dynamic SQL to bypass RLS policies when creating default settings
    EXECUTE format('
        SET LOCAL row_security = off;
        INSERT INTO user_notification_settings (user_id)
        VALUES (%L)
        ON CONFLICT (user_id) DO NOTHING;
    ', NEW.id);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If creation fails, log warning but don't block user creation
    RAISE WARNING 'Failed to create notification settings for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM user_notifications
        WHERE user_id = user_uuid AND read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION get_unread_notifications_count(UUID) TO authenticated;
