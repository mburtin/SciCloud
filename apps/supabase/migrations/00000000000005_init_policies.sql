-- ====================================================
--         Policies related to `user_profiles`
-- ====================================================

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

-- 8. Comments for documentation
COMMENT ON POLICY "Users can view own profile" ON public.user_profiles IS
  'Users can only view their own profile';

-- Policy 2: Users can update their own profile (role updates handled via admin function)
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

COMMENT ON POLICY "Users can update own profile" ON public.user_profiles IS
  'Users can update their profile (but not their role)';

-- Policy 3: Users can create their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- ====================================================
--         Policies related to `user_view`
-- ====================================================

GRANT SELECT ON public.user_view TO authenticated;

-- ====================================================
--        Policies related to `user_calendar`
-- ====================================================

-- Enable RLS (Row Level Security) for data isolation
ALTER TABLE public.user_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_calendar table
-- Policy 1: Users can only view their own calendar events
CREATE POLICY "Users can view own calendar events" ON public.user_calendar
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- Policy 2: Users can only insert their own calendar events
CREATE POLICY "Users can insert own calendar events" ON public.user_calendar
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Policy 3: Users can only update their own calendar events
CREATE POLICY "Users can update own calendar events" ON public.user_calendar
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Policy 4: Users can only delete their own calendar events
CREATE POLICY "Users can delete own calendar events" ON public.user_calendar
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- ====================================================
--         Policies related to `user_notes`
-- ====================================================

-- Enable Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ====================================================
--         Policies related to `user_notifications`
-- ====================================================

-- Enable Row Level Security (RLS)
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications table
CREATE POLICY "Users can view their own notifications"
    ON user_notifications FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON user_notifications FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own notifications"
    ON user_notifications FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON user_notifications FOR DELETE
    USING ((SELECT auth.uid()) = user_id);

-- ====================================================
--     Policies related to `user_notification_settings`
-- ====================================================

-- Enable Row Level Security (RLS)
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notification_settings table
CREATE POLICY "Users can view their own notification settings"
    ON user_notification_settings FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notification settings"
    ON user_notification_settings FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own notification settings"
    ON user_notification_settings FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notification settings"
    ON user_notification_settings FOR DELETE
    USING ((SELECT auth.uid()) = user_id);
