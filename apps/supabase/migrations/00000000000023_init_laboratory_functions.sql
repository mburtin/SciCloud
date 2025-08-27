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

-- ====================================================
--          Functions related to `consumables`
-- ====================================================

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
