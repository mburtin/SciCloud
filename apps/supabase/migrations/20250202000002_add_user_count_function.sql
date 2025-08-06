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