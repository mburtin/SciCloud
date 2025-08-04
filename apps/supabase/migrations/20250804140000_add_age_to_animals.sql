-- Add age field to animals table
ALTER TABLE public.animals 
ADD COLUMN age_weeks INTEGER;

-- Add comment for the new column
COMMENT ON COLUMN public.animals.age_weeks IS 'Age in weeks calculated from birth_date or manually entered';

-- Create index for better performance on age queries
CREATE INDEX IF NOT EXISTS idx_animals_age_weeks ON public.animals(age_weeks);