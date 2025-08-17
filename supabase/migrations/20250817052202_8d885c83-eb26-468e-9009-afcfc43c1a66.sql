-- Ensure contact_id auto-increments to prevent duplicate PK errors
-- 1) Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS public.contact_master_contact_id_seq;

-- 2) Own sequence by the column
ALTER SEQUENCE public.contact_master_contact_id_seq OWNED BY public.contact_master.contact_id;

-- 3) Set default to use the sequence (idempotent)
ALTER TABLE public.contact_master 
  ALTER COLUMN contact_id SET DEFAULT nextval('public.contact_master_contact_id_seq'::regclass);

-- 4) Align sequence with current max(contact_id)
SELECT setval('public.contact_master_contact_id_seq', COALESCE((SELECT MAX(contact_id) FROM public.contact_master), 0), true);