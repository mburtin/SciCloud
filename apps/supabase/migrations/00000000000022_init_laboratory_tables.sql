------------------------------------------------
--      Tables related to animal module       --
------------------------------------------------

-- Create animals table for laboratory animal management
DROP TABLE IF EXISTS public.animals;
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


-- Add some helpful comments
COMMENT ON TABLE public.animals IS 'Laboratory animals management table';
COMMENT ON COLUMN public.animals.identifier IS 'Unique animal identifier (e.g., M001-2024)';
COMMENT ON COLUMN public.animals.age_weeks IS 'Age in weeks calculated from birth_date or manually entered';
COMMENT ON COLUMN public.animals.location IS 'JSON object containing facility, room, rack, cage information';
COMMENT ON COLUMN public.animals.documents IS 'Array of document objects (health certificates, photos, etc.)';
COMMENT ON COLUMN public.animals.medical_history IS 'Array of medical record objects';
COMMENT ON COLUMN public.animals.measurements IS 'Array of measurement objects (weight, temperature, etc.)';

------------------------------------------------
--    Tables related to instruments module    --
------------------------------------------------

-- Create instruments table for laboratory instrument management
DROP TABLE IF EXISTS public.instruments;
CREATE TABLE IF NOT EXISTS public.instruments (
  -- Primary fields
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  serial_number TEXT UNIQUE, -- Optional unique serial number

  -- Status and location
  status TEXT NOT NULL CHECK (status IN ('available', 'in-use', 'maintenance', 'broken')) DEFAULT 'available',
  location TEXT, -- Room location (e.g., "Room A-101")
  maintenance_due BOOLEAN NOT NULL DEFAULT FALSE,

  -- Audit fields (following the same pattern as other tables)
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL
);

-- Add some helpful comments
COMMENT ON TABLE public.instruments IS 'Laboratory instruments management table';
COMMENT ON COLUMN public.instruments.serial_number IS 'Unique instrument serial number (optional)';
COMMENT ON COLUMN public.instruments.status IS 'Current status of the instrument';
COMMENT ON COLUMN public.instruments.maintenance_due IS 'Whether maintenance is due for this instrument';

------------------------------------------------
--    Tables related to consumables module    --
------------------------------------------------

-- Create consumables table
DROP TABLE IF EXISTS public.consumables;
CREATE TABLE IF NOT EXISTS public.consumables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    supplier TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    stock_level TEXT NOT NULL DEFAULT 'normal' CHECK (stock_level IN ('high', 'normal', 'low', 'outofstock')),
    location TEXT NOT NULL,
    last_order DATE,
    expiry_date DATE NOT NULL DEFAULT '9999-12-31',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1
);
