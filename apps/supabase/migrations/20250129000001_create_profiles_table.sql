-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  biography TEXT DEFAULT '',
  location TEXT DEFAULT '',
  full_address TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer'))
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create combined view for user profiles with auth data
CREATE VIEW public.user_profiles 
WITH (security_invoker = true) 
AS SELECT 
  -- auth.users data (sensitive but controlled by RLS)
  u.id,
  u.email,
  u.phone,
  u.created_at,
  u.updated_at,
  
  -- profiles data (public) - INNER JOIN ensures profile always exists
  p.first_name,
  p.last_name,
  p.biography,
  p.location,
  p.full_address,
  p.avatar_url,
  p.role
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id;

-- RLS Policies for the profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For now, only allow users to view/edit their own profiles
-- Admin privileges can be handled at the application level