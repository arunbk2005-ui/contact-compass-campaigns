-- Enable RLS on remaining tables that don't have it
ALTER TABLE public.city_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_master ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for city_master
CREATE POLICY "Allow public read access to city_master" 
ON public.city_master 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on city_master" 
ON public.city_master 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on city_master" 
ON public.city_master 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated delete on city_master" 
ON public.city_master 
FOR DELETE 
USING (true);

-- Create RLS policies for industry_master
CREATE POLICY "Allow public read access to industry_master" 
ON public.industry_master 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on industry_master" 
ON public.industry_master 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on industry_master" 
ON public.industry_master 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated delete on industry_master" 
ON public.industry_master 
FOR DELETE 
USING (true);

-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;