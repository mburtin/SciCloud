-- ====================================================
--          Policies related to `projects`
-- ====================================================

-- Enable RLS policies for projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

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

-- ====================================================
--        Policies related to `project_members`
-- ====================================================

-- Enable RLS policies for project_members table
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

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

-- ====================================================
--     Policies related to `user_favorite_projects`
-- ====================================================

-- Enable Row Level Security
ALTER TABLE public.user_favorite_projects ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorite projects" ON public.user_favorite_projects
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Users can add projects to their own favorites
CREATE POLICY "Users can add to their own favorites" ON public.user_favorite_projects
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Users can remove projects from their own favorites
CREATE POLICY "Users can remove from their own favorites" ON public.user_favorite_projects
  FOR DELETE USING ((select auth.uid()) = user_id);
