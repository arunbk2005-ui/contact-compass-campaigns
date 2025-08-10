-- Fix duplicate constraint causing contact insert failures
-- Drops the unexpected unique constraint on contact_master
ALTER TABLE public.contact_master
DROP CONSTRAINT IF EXISTS contact_master_contact_city_key;