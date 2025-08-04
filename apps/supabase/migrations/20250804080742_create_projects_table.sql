-- Create projects table with proper audit fields and constraints
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'completed', 'paused', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  responsible UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
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
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
        AND pm.user_id = auth.uid()
    )
    -- OR user is the creator
    OR created_by = auth.uid()
    -- OR user is responsible for the project
    OR responsible = auth.uid()
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
        AND pm.user_id = auth.uid()
    )
    -- OR user is the creator
    OR created_by = auth.uid()
    -- OR user is responsible for the project
    OR responsible = auth.uid()
  );

  -- Allow authenticated users to create projects
CREATE POLICY "Authenticated users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
