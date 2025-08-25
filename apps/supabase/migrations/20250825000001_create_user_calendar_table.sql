-- Migration: Create user_calendar table for personal calendar events
-- Date: 2025-08-25
-- Description: Calendar system for scientific laboratory management
--              with personal event scheduling and categorization

-- Create user_calendar table following SciCloud patterns
CREATE TABLE IF NOT EXISTS public.user_calendar (
  -- Primary fields
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  
  -- Date and time fields (following frontend interface)
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Event categorization
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'experiment', 'training', 'meeting', 'custom')) DEFAULT 'custom',
  color TEXT, -- Hex color code (e.g., '#3B82F6')
  
  -- Optional location and attendees
  location TEXT,
  attendees TEXT[], -- Array of attendee names/emails
  
  -- User association (personal calendar)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Audit fields (following SciCloud pattern)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_user_calendar_user_id ON public.user_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_event_date ON public.user_calendar(event_date);
CREATE INDEX IF NOT EXISTS idx_user_calendar_category ON public.user_calendar(category);
CREATE INDEX IF NOT EXISTS idx_user_calendar_start_time ON public.user_calendar(start_time);
CREATE INDEX IF NOT EXISTS idx_user_calendar_all_day ON public.user_calendar(all_day);

-- Composite indexes for calendar view queries
CREATE INDEX IF NOT EXISTS idx_user_calendar_user_date_range ON public.user_calendar(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_user_calendar_user_date_time ON public.user_calendar(user_id, event_date, start_time);
CREATE INDEX IF NOT EXISTS idx_user_calendar_updated_at ON public.user_calendar(updated_at);

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

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_calendar_updated_at
  BEFORE UPDATE ON public.user_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Data integrity constraints
ALTER TABLE public.user_calendar 
ADD CONSTRAINT check_time_order CHECK (start_time < end_time OR all_day = TRUE);

ALTER TABLE public.user_calendar 
ADD CONSTRAINT check_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200);

ALTER TABLE public.user_calendar 
ADD CONSTRAINT check_color_format CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$');

-- Add helpful comments for documentation
COMMENT ON TABLE public.user_calendar IS 'Personal calendar events for laboratory scheduling and management';
COMMENT ON COLUMN public.user_calendar.category IS 'Event type: maintenance, experiment, training, meeting, custom';
COMMENT ON COLUMN public.user_calendar.color IS 'Hex color code for event display (e.g., #3B82F6)';
COMMENT ON COLUMN public.user_calendar.attendees IS 'Array of attendee names or email addresses';
COMMENT ON COLUMN public.user_calendar.all_day IS 'Whether this is an all-day event (ignores time fields)';