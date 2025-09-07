-- Fix RLS policies for campaign_audience_allocations to allow unauthenticated access during testing
DROP POLICY IF EXISTS "Allocations - creator manage own" ON public.campaign_audience_allocations;
DROP POLICY IF EXISTS "Allocations - admins manage all" ON public.campaign_audience_allocations;

-- Create temporary public access policies for testing (replace with proper auth policies later)
CREATE POLICY "Allow all operations for campaign allocations" 
ON public.campaign_audience_allocations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create campaign_files table for managing allocated audience results
CREATE TABLE public.campaign_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  description TEXT,
  allocated_contacts INTEGER NOT NULL DEFAULT 0,
  total_contacts INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'processing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaign_files
ALTER TABLE public.campaign_files ENABLE ROW LEVEL SECURITY;

-- Create public access policies for campaign_files (replace with proper auth later)
CREATE POLICY "Allow all operations for campaign files" 
ON public.campaign_files 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create campaign_file_contacts table to store which contacts are allocated to which files
CREATE TABLE public.campaign_file_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_file_id UUID NOT NULL REFERENCES public.campaign_files(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL,
  company_id BIGINT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  city TEXT,
  state TEXT,
  industry TEXT,
  job_level TEXT,
  department TEXT,
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaign_file_contacts
ALTER TABLE public.campaign_file_contacts ENABLE ROW LEVEL SECURITY;

-- Create public access policies for campaign_file_contacts
CREATE POLICY "Allow all operations for campaign file contacts" 
ON public.campaign_file_contacts 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_campaign_files_campaign_id ON public.campaign_files(campaign_id);
CREATE INDEX idx_campaign_file_contacts_file_id ON public.campaign_file_contacts(campaign_file_id);
CREATE INDEX idx_campaign_file_contacts_contact_id ON public.campaign_file_contacts(contact_id);

-- Add trigger for updating updated_at column on campaign_files
CREATE TRIGGER update_campaign_files_updated_at
    BEFORE UPDATE ON public.campaign_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();