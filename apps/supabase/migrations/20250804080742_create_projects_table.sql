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

-- RLS Policies for project_members table
-- Allow users to view project members if they are members themselves or admins
CREATE POLICY "Users can view project members"
  ON public.project_members
  FOR SELECT
  USING (
    -- User is a member of the project
    EXISTS (
      SELECT 1 FROM public.project_members pm2
      WHERE pm2.project_id = public.project_members.project_id
      AND pm2.user_id = (select auth.uid())
    )
    -- OR user is admin
    OR EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Allow users to add project members if they are project owners/admins or system admins
CREATE POLICY "Project owners can add members"
  ON public.project_members
  FOR INSERT
  WITH CHECK (
    -- User is owner/admin of the project
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.project_members.project_id
      AND pm.user_id = (select auth.uid())
      AND pm.role IN ('owner', 'admin')
    )
    -- OR user is the project creator
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is system admin
    OR EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Allow users to update project members if they are project owners/admins or system admins
CREATE POLICY "Project owners can update members"
  ON public.project_members
  FOR UPDATE
  USING (
    -- User is owner/admin of the project
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.project_members.project_id
      AND pm.user_id = (select auth.uid())
      AND pm.role IN ('owner', 'admin')
    )
    -- OR user is the project creator
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is system admin
    OR EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Allow users to remove project members if they are project owners/admins, system admins, or removing themselves
CREATE POLICY "Project owners can remove members"
  ON public.project_members
  FOR DELETE
  USING (
    -- User is removing themselves
    user_id = (select auth.uid())
    -- OR user is owner/admin of the project
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.project_members.project_id
      AND pm.user_id = (select auth.uid())
      AND pm.role IN ('owner', 'admin')
    )
    -- OR user is the project creator
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = public.project_members.project_id
      AND p.created_by = (select auth.uid())
    )
    -- OR user is system admin
    OR EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
