-- Secure contact_master: remove public read, require authenticated users

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.contact_master ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_master' AND policyname = 'Allow public read access to contact_master'
  ) THEN
    DROP POLICY "Allow public read access to contact_master" ON public.contact_master;
  END IF;
END$$;

-- Create authenticated-only read policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_master' AND policyname = 'Authenticated users can read contact_master'
  ) THEN
    CREATE POLICY "Authenticated users can read contact_master"
      ON public.contact_master
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;