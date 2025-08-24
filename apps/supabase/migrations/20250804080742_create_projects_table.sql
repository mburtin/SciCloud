-- Create projects table with proper audit fields and constraints
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'completed', 'paused', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  responsible UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
  tags JSONB DEFAULT '[]'::jsonb,
  budget NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Audit fields
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1
);

-- Create project_members table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  
  -- Audit fields
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Unique constraint to prevent duplicate memberships
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Allow any user to select all projects
CREATE POLICY "Public view of projects"
  ON public.projects
  FOR SELECT
  USING ( TRUE );

-- Allow project members, creators, and responsible users to update projects
CREATE POLICY "Project members can update"
  ON public.projects
  FOR UPDATE
  USING (
    -- User is a project member
    EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE
        pm.project_id = public.projects.id
        AND pm.user_id = (select auth.uid())
    )
    -- OR user is the creator
    OR created_by = (select auth.uid())
    -- OR user is responsible for the project
    OR responsible = (select auth.uid())
  );

-- Allow project members, creators, and responsible users to delete projects
CREATE POLICY "Project members can delete"
  ON public.projects
  FOR DELETE
  USING (
    -- User is a project member
    EXISTS (
      SELECT 1
      FROM public.project_members pm
      WHERE
        pm.project_id = public.projects.id
        AND pm.user_id = (select auth.uid())
    )
    -- OR user is the creator
    OR created_by = (select auth.uid())
    -- OR user is responsible for the project
    OR responsible = (select auth.uid())
  );

-- Allow authenticated users to create projects
CREATE POLICY "Authenticated users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

-- RLS Policies for project_members table (Non-recursive implementation)
-- Strategy: Use only external table checks to eliminate infinite recursion

-- Allow users to view project members if they are project creators, responsible users, or system admins
CREATE POLICY "Non-recursive project members view"
  ON public.project_members
  FOR SELECT
  USING (
    -- User is the project creator (safe - checks projects table only)
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is the project responsible person (safe - checks projects table only)
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.responsible = (select auth.uid())
    )
    -- OR user is system admin (safe - checks user_profiles table only)
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role = 'admin'
    )
  );

-- Allow project creators, responsible users, and system admins to add members
CREATE POLICY "Project creators and admins can add members"
  ON public.project_members
  FOR INSERT
  WITH CHECK (
    -- User is the project creator (safe - checks projects table only)
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is the project responsible person (safe - checks projects table only)
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.responsible = (select auth.uid())
    )
    -- OR user is system admin (safe - checks user_profiles table only)
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role = 'admin'
    )
  );

-- Allow project creators, responsible users, and system admins to update members
CREATE POLICY "Non-recursive project members update"
  ON public.project_members
  FOR UPDATE
  USING (
    -- User is the project creator (safe - checks projects table only)
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is the project responsible person (safe - checks projects table only)
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.responsible = (select auth.uid())
    )
    -- OR user is system admin (safe - checks user_profiles table only)
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role = 'admin'
    )
  );

-- Allow users to remove themselves or allow project creators/responsible/admins to remove others
CREATE POLICY "Non-recursive project members delete"
  ON public.project_members
  FOR DELETE
  USING (
    -- User is removing themselves
    user_id = (select auth.uid())
    -- OR user is the project creator (safe - checks projects table only)
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is the project responsible person (safe - checks projects table only)
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.responsible = (select auth.uid())
    )
    -- OR user is system admin (safe - checks user_profiles table only)
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid()) AND up.role = 'admin'
    )
  );
