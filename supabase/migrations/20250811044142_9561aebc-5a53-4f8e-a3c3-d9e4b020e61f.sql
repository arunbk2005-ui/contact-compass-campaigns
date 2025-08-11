-- Drop the incorrect unique constraint on contact_master that enforces uniqueness on City_ID
ALTER TABLE public.contact_master
DROP CONSTRAINT IF EXISTS "contact_master_Contact_City_key";

-- Also drop any lowercase variant if it exists (safety for environments with different naming)
ALTER TABLE public.contact_master
DROP CONSTRAINT IF EXISTS contact_master_contact_city_key;