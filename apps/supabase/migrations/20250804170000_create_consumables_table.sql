-- Create consumables table
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS consumables_reference_idx ON public.consumables(reference);
CREATE INDEX IF NOT EXISTS consumables_category_idx ON public.consumables(category);
CREATE INDEX IF NOT EXISTS consumables_supplier_idx ON public.consumables(supplier);
CREATE INDEX IF NOT EXISTS consumables_stock_level_idx ON public.consumables(stock_level);
CREATE INDEX IF NOT EXISTS consumables_expiry_date_idx ON public.consumables(expiry_date);

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

-- Create trigger for updated_at
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

CREATE TRIGGER update_consumables_updated_at 
    BEFORE UPDATE ON public.consumables 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically update stock_level based on stock and min_stock
CREATE OR REPLACE FUNCTION public.update_consumable_stock_level()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.stock = 0 THEN
        NEW.stock_level = 'outofstock';
    ELSIF NEW.stock <= NEW.min_stock THEN
        NEW.stock_level = 'low';
    ELSIF NEW.stock > (NEW.min_stock * 2) THEN
        NEW.stock_level = 'high';
    ELSE
        NEW.stock_level = 'normal';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_consumable_stock_level_trigger
    BEFORE INSERT OR UPDATE ON public.consumables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_consumable_stock_level();