-- Create instruments table for laboratory instrument management
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instruments_name ON public.instruments(name);
CREATE INDEX IF NOT EXISTS idx_instruments_category ON public.instruments(category);
CREATE INDEX IF NOT EXISTS idx_instruments_manufacturer ON public.instruments(manufacturer);
CREATE INDEX IF NOT EXISTS idx_instruments_status ON public.instruments(status);
CREATE INDEX IF NOT EXISTS idx_instruments_serial_number ON public.instruments(serial_number);
CREATE INDEX IF NOT EXISTS idx_instruments_location ON public.instruments(location);
CREATE INDEX IF NOT EXISTS idx_instruments_maintenance_due ON public.instruments(maintenance_due);
CREATE INDEX IF NOT EXISTS idx_instruments_created_by ON public.instruments(created_by);
CREATE INDEX IF NOT EXISTS idx_instruments_updated_at ON public.instruments(updated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instruments table
-- Allow authenticated users to read all instruments
CREATE POLICY "Instruments are readable by authenticated users" ON public.instruments
  FOR SELECT USING ((select auth.role()) = 'authenticated');

-- Allow authenticated users to insert instruments
CREATE POLICY "Instruments are insertable by authenticated users" ON public.instruments
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = created_by);

-- Allow users to update instruments they created or if they're admin
CREATE POLICY "Instruments are updatable by creator or admin" ON public.instruments
  FOR UPDATE USING (
    (select auth.uid()) = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  )
  WITH CHECK (
    (select auth.uid()) = updated_by AND (
      (select auth.uid()) = created_by OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = (select auth.uid()) AND role = 'admin'
      )
    )
  );

-- Allow users to delete instruments they created or if they're admin
CREATE POLICY "Instruments are deletable by creator or admin" ON public.instruments
  FOR DELETE USING (
    (select auth.uid()) = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_instruments_updated_at
  BEFORE UPDATE ON public.instruments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE public.instruments IS 'Laboratory instruments management table';
COMMENT ON COLUMN public.instruments.serial_number IS 'Unique instrument serial number (optional)';
COMMENT ON COLUMN public.instruments.status IS 'Current status of the instrument';
COMMENT ON COLUMN public.instruments.maintenance_due IS 'Whether maintenance is due for this instrument';