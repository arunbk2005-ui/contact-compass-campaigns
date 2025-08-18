-- Add public read access policy for contact_master to allow general access
CREATE POLICY "Allow public read access to contact_master" 
ON public.contact_master 
FOR SELECT 
USING (true);