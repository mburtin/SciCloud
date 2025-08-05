-- Create animals table for laboratory animal management
CREATE TABLE IF NOT EXISTS public.animals (
  -- Primary fields
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL UNIQUE, -- Animal identifier (M001-2024, etc.)
  species TEXT NOT NULL, -- Mus musculus, Rattus norvegicus, etc.
  strain TEXT NOT NULL, -- C57BL/6J, BALB/c, etc.
  line TEXT, -- Transgenic line, Wild Type, etc.
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  
  -- Dates
  birth_date DATE NOT NULL,
  arrival_date DATE NOT NULL,
  
  -- Physical data
  age_weeks INTEGER, -- Age in weeks calculated from birth_date or manually entered
  current_weight DECIMAL(8,2) NOT NULL, -- Weight in grams
  supplier TEXT NOT NULL,
  
  -- Status and location
  status TEXT NOT NULL CHECK (status IN ('alive', 'deceased', 'transferred', 'experimental')) DEFAULT 'alive',
  location JSONB NOT NULL DEFAULT '{}', -- {facility, room, rack, cage}
  housing_type TEXT NOT NULL CHECK (housing_type IN ('individual', 'pair', 'group')) DEFAULT 'individual',
  group_size INTEGER,
  
  -- Experimental data
  protocols TEXT[] DEFAULT '{}', -- Array of protocol IDs
  experimental_group TEXT,
  ethics_approval TEXT NOT NULL,
  
  -- Veterinary care
  veterinarian TEXT NOT NULL,
  last_exam_date DATE,
  next_exam_date DATE,
  health_status TEXT NOT NULL CHECK (health_status IN ('excellent', 'good', 'concerning', 'critical')) DEFAULT 'good',
  
  -- Documentation and history (JSONB for complex nested data)
  documents JSONB DEFAULT '[]', -- Array of AnimalDocument objects
  medical_history JSONB DEFAULT '[]', -- Array of MedicalRecord objects
  measurements JSONB DEFAULT '[]', -- Array of Measurement objects
  
  -- Notes
  notes TEXT DEFAULT '',
  
  -- Audit fields (following the same pattern as projects table)
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_identifier ON public.animals(identifier);
CREATE INDEX IF NOT EXISTS idx_animals_species ON public.animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_strain ON public.animals(strain);
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_health_status ON public.animals(health_status);
CREATE INDEX IF NOT EXISTS idx_animals_veterinarian ON public.animals(veterinarian);
CREATE INDEX IF NOT EXISTS idx_animals_age_weeks ON public.animals(age_weeks);
CREATE INDEX IF NOT EXISTS idx_animals_created_by ON public.animals(created_by);
CREATE INDEX IF NOT EXISTS idx_animals_updated_at ON public.animals(updated_at);
CREATE INDEX IF NOT EXISTS idx_animals_protocols ON public.animals USING GIN(protocols);

-- Enable RLS (Row Level Security)
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animals table
-- Allow authenticated users to read all animals
CREATE POLICY "Animals are readable by authenticated users" ON public.animals
  FOR SELECT USING ((select auth.role()) = 'authenticated');

-- Allow authenticated users to insert animals
CREATE POLICY "Animals are insertable by authenticated users" ON public.animals
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = created_by);

-- Allow users to update animals they created or if they're admin
CREATE POLICY "Animals are updatable by creator or admin" ON public.animals
  FOR UPDATE USING (
    (select auth.uid()) = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    (select auth.uid()) = updated_by AND (
      (select auth.uid()) = created_by OR 
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = (select auth.uid()) AND role = 'admin'
      )
    )
  );

-- Allow users to delete animals they created or if they're admin
CREATE POLICY "Animals are deletable by creator or admin" ON public.animals
  FOR DELETE USING (
    (select auth.uid()) = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE public.animals IS 'Laboratory animals management table';
COMMENT ON COLUMN public.animals.identifier IS 'Unique animal identifier (e.g., M001-2024)';
COMMENT ON COLUMN public.animals.age_weeks IS 'Age in weeks calculated from birth_date or manually entered';
COMMENT ON COLUMN public.animals.location IS 'JSON object containing facility, room, rack, cage information';
COMMENT ON COLUMN public.animals.documents IS 'Array of document objects (health certificates, photos, etc.)';
COMMENT ON COLUMN public.animals.medical_history IS 'Array of medical record objects';
COMMENT ON COLUMN public.animals.measurements IS 'Array of measurement objects (weight, temperature, etc.)';