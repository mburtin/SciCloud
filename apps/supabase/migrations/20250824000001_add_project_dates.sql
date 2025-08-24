-- Add start_date and end_date columns to projects table
-- These columns will store the planned start and end dates for projects

ALTER TABLE public.projects 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN public.projects.start_date IS 'Planned start date for the project';
COMMENT ON COLUMN public.projects.end_date IS 'Planned end date for the project';

-- Optional: Add a check constraint to ensure end_date is after start_date when both are set
ALTER TABLE public.projects 
ADD CONSTRAINT check_project_date_order 
CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);