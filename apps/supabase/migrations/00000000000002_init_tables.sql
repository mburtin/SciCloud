-- Suppress NOTICE messages for cleaner output
SET client_min_messages = WARNING;

-- ====================================================
--           Table structure of `user_profiles`
-- ====================================================
DROP TABLE IF EXISTS public.user_profiles;
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  biography TEXT DEFAULT '',
  location TEXT DEFAULT '',
  full_address TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

-- ====================================================
--            Table structure of `user_view`
-- ====================================================
DROP VIEW IF EXISTS public.user_view;
CREATE VIEW public.user_view
WITH (security_invoker = true)
AS SELECT
  -- auth.users data
  u.id,
  u.email,
  u.phone,
  u.created_at,
  u.updated_at,

  -- public.user_profiles data
  p.first_name,
  p.last_name,
  p.biography,
  p.location,
  p.full_address,
  p.avatar_url,
  p.role
FROM auth.users u
INNER JOIN public.user_profiles p ON u.id = p.id;

-- ====================================================
--           Table structure of `user_calendar`
-- ====================================================
DROP TABLE IF EXISTS public.user_calendar;
CREATE TABLE IF NOT EXISTS public.user_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'experiment', 'training', 'meeting', 'custom')) DEFAULT 'custom',
  color TEXT CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
  location TEXT,
  attendees TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  CONSTRAINT check_time_order CHECK (start_time < end_time OR all_day = TRUE)
);

-- Add helpful comments for documentation
COMMENT ON TABLE public.user_calendar IS 'Personal calendar events for laboratory scheduling and management';
COMMENT ON COLUMN public.user_calendar.category IS 'Event type: maintenance, experiment, training, meeting, custom';
COMMENT ON COLUMN public.user_calendar.color IS 'Hex color code for event display (e.g., #3B82F6)';
COMMENT ON COLUMN public.user_calendar.attendees IS 'Array of attendee names or email addresses';
COMMENT ON COLUMN public.user_calendar.all_day IS 'Whether this is an all-day event (ignores time fields)';

-- ====================================================
--           Table structure of `user_notes`
-- ====================================================
DROP TABLE IF EXISTS public.notes;
-- TODO: rename intro user_notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================
--        Table structure of `user_user_notifications`
-- ====================================================

CREATE TYPE notification_type_enum AS ENUM ('project', 'collaboration', 'system', 'document');
CREATE TYPE notification_priority_enum AS ENUM ('low', 'medium', 'high');

DROP TABLE IF EXISTS public.user_notifications;
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    priority notification_priority_enum NOT NULL DEFAULT 'medium',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable realtime for user_notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- ====================================================
--   Table structure of `user_user_notification_settings`
-- ====================================================

DROP TABLE IF EXISTS public.user_notification_settings;
CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    types_config JSONB NOT NULL DEFAULT '{
        "project": {"enabled": true, "email": true, "push": true},
        "collaboration": {"enabled": true, "email": true, "push": true},
        "system": {"enabled": true, "email": false, "push": true},
        "document": {"enabled": true, "email": false, "push": false}
    }',
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
