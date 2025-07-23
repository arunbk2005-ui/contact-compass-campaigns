-- Enable RLS on contact_master table
ALTER TABLE public.contact_master ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_master (similar to other master tables)
CREATE POLICY "Allow public read access to contact_master" 
ON public.contact_master 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on contact_master" 
ON public.contact_master 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on contact_master" 
ON public.contact_master 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated delete on contact_master" 
ON public.contact_master 
FOR DELETE 
USING (true);

-- Drop the restrictive policy on organisation_master
DROP POLICY IF EXISTS "Restrict access by default" ON public.organisation_master;

-- Create proper RLS policies for organisation_master (similar to other master tables)
CREATE POLICY "Allow public read access to organisation_master" 
ON public.organisation_master 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on organisation_master" 
ON public.organisation_master 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on organisation_master" 
ON public.organisation_master 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated delete on organisation_master" 
ON public.organisation_master 
FOR DELETE 
USING (true);