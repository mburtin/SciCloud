-- ====================================================
--          Triggers related to `animals`
-- ====================================================
DROP TRIGGER IF EXISTS update_animals_updated_at ON public.animals;
CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================
--          Triggers related to `instruments`
-- ====================================================

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_instruments_updated_at ON public.instruments;
CREATE TRIGGER update_instruments_updated_at
  BEFORE UPDATE ON public.instruments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================
--          Triggers related to `consumables`
-- ====================================================
DROP TRIGGER IF EXISTS update_consumables_updated_at ON public.consumables;
CREATE TRIGGER update_consumables_updated_at
    BEFORE UPDATE ON public.consumables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_consumable_stock_level_trigger ON public.consumables;
CREATE TRIGGER update_consumable_stock_level_trigger
    BEFORE INSERT OR UPDATE ON public.consumables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_consumable_stock_level();
