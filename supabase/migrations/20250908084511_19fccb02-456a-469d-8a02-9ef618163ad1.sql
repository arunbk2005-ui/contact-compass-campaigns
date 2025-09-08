-- Create campaign allocations table with all joined contact and company data
CREATE TABLE IF NOT EXISTS public.campaign_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  run_id UUID NOT NULL,
  contact_id INTEGER NOT NULL,
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact fields
  first_name TEXT,
  last_name TEXT,
  salute TEXT,
  designation TEXT,
  department TEXT,
  job_level TEXT,
  specialization TEXT,
  official_email_id TEXT,
  personal_email_id TEXT,
  direct_phone_number TEXT,
  mobile_number TEXT,
  gender TEXT,
  email_optin TEXT,
  
  -- Company fields  
  company_id BIGINT,
  company_name TEXT,
  industry TEXT,
  headquarters TEXT,
  website TEXT,
  no_of_employees_total INTEGER,
  turn_over_inr_cr NUMERIC,
  annual_revenue NUMERIC,
  
  -- Location fields
  city_id INTEGER,
  city TEXT,
  state TEXT,
  postal_address_1 TEXT,
  postal_address_2 TEXT,
  postal_address_3 TEXT,
  
  -- Contact info
  std TEXT,
  phone_1 TEXT,
  phone_2 TEXT,
  fax TEXT,
  company_mobile_number TEXT,
  common_email_id TEXT
);

-- Enable RLS
ALTER TABLE public.campaign_allocations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for campaign allocations" 
ON public.campaign_allocations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_campaign_allocations_campaign_id ON public.campaign_allocations(campaign_id);
CREATE INDEX idx_campaign_allocations_run_id ON public.campaign_allocations(run_id);
CREATE INDEX idx_campaign_allocations_contact_id ON public.campaign_allocations(contact_id);
CREATE INDEX idx_campaign_allocations_allocated_at ON public.campaign_allocations(allocated_at);

-- Create updated_at trigger
CREATE TRIGGER update_campaign_allocations_updated_at
BEFORE UPDATE ON public.campaign_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();