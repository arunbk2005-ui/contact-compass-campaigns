-- Create or ensure campaigns table with RLS and update trigger
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  list_size integer NOT NULL,
  name text NOT NULL,
  client_name text NOT NULL,
  servicing_lead text NOT NULL
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Allow public read access to campaigns'
  ) THEN
    CREATE POLICY "Allow public read access to campaigns"
      ON public.campaigns
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Allow insert on campaigns'
  ) THEN
    CREATE POLICY "Allow insert on campaigns"
      ON public.campaigns
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Allow update on campaigns'
  ) THEN
    CREATE POLICY "Allow update on campaigns"
      ON public.campaigns
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'campaigns' AND policyname = 'Allow delete on campaigns'
  ) THEN
    CREATE POLICY "Allow delete on campaigns"
      ON public.campaigns
      FOR DELETE
      USING (true);
  END IF;
END$$;

-- Create trigger to update updated_at on changes if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_campaigns_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_campaigns_set_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;