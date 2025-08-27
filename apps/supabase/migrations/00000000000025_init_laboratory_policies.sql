-- ====================================================
--            Policies related to `animals`
-- ====================================================

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

-- ====================================================
--          Policies related to `instruments`
-- ====================================================

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

-- Allow users to delete instruments they created or if they're admin
CREATE POLICY "Instruments are deletable by creator or admin" ON public.instruments
  FOR DELETE USING (
    (select auth.uid()) = created_by OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- ====================================================
--          Policies related to `consumables`
-- ====================================================

-- Enable RLS
ALTER TABLE public.consumables ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all consumables" ON public.consumables
    FOR SELECT USING (true);

CREATE POLICY "Users can insert consumables" ON public.consumables
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update consumables" ON public.consumables
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete consumables" ON public.consumables
    FOR DELETE USING (true);
