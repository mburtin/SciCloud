-- Create user favorite projects table for per-user favorites
CREATE TABLE IF NOT EXISTS public.user_favorite_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only favorite a project once
  UNIQUE(user_id, project_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorite_projects_user_id ON public.user_favorite_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_projects_project_id ON public.user_favorite_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_projects_user_project ON public.user_favorite_projects(user_id, project_id);

-- Enable Row Level Security
ALTER TABLE public.user_favorite_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorite projects" ON public.user_favorite_projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can add projects to their own favorites
CREATE POLICY "Users can add to their own favorites" ON public.user_favorite_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove projects from their own favorites
CREATE POLICY "Users can remove from their own favorites" ON public.user_favorite_projects
  FOR DELETE USING (auth.uid() = user_id);

-- No update needed as there are no mutable fields besides the primary keys