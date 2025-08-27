-- ====================================================
--            Table structure of `projects`
-- ====================================================

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
  start_date DATE,
  end_date DATE,

  -- Audit fields
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraint to ensure end_date is after or equal to start_date when both are set
  CONSTRAINT check_project_date_order CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

-- Add comments for documentation
COMMENT ON COLUMN public.projects.start_date IS 'Planned start date for the project';
COMMENT ON COLUMN public.projects.end_date IS 'Planned end date for the project';

-- ====================================================
--         Table structure of `project_members`
-- ====================================================
DROP TABLE IF EXISTS public.project_members;
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

-- ====================================================
--        Table structure of `project_favorites`
-- ====================================================

-- TODO: rename intro project_favorites
DROP TABLE IF EXISTS public.user_favorite_projects;
CREATE TABLE IF NOT EXISTS public.user_favorite_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Ensure a user can only favorite a project once
  UNIQUE(user_id, project_id)
);
