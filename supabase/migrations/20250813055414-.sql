-- Role-based access control for contact_master

-- 1) Create enum app_role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','user');
  END IF;
END$$;

-- 2) user_roles table for assigning roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) has_role helper function (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- 4) Policies on user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can manage all roles'
  ) THEN
    CREATE POLICY "Admins can manage all roles"
      ON public.user_roles
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- 5) allowed_companies mapping for user-specific data access
CREATE TABLE IF NOT EXISTS public.allowed_companies (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_allowed_companies_user ON public.allowed_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_allowed_companies_company ON public.allowed_companies(company_id);

ALTER TABLE public.allowed_companies ENABLE ROW LEVEL SECURITY;

-- Policies for allowed_companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='allowed_companies' AND policyname='Users can manage their allowed companies'
  ) THEN
    CREATE POLICY "Users can manage their allowed companies"
      ON public.allowed_companies
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='allowed_companies' AND policyname='Admins can manage all allowed companies'
  ) THEN
    CREATE POLICY "Admins can manage all allowed companies"
      ON public.allowed_companies
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- 6) Tighten contact_master RLS to be user-specific
ALTER TABLE public.contact_master ENABLE ROW LEVEL SECURITY;

-- Drop broad authenticated read policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_master' AND policyname='Authenticated users can read contact_master'
  ) THEN
    DROP POLICY "Authenticated users can read contact_master" ON public.contact_master;
  END IF;
END$$;

-- Admins can read all contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_master' AND policyname='Admins can read all contacts'
  ) THEN
    CREATE POLICY "Admins can read all contacts"
      ON public.contact_master
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;

-- Users can read contacts for their allowed companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_master' AND policyname='Users can read contacts for allowed companies'
  ) THEN
    CREATE POLICY "Users can read contacts for allowed companies"
      ON public.contact_master
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.allowed_companies ac
        WHERE ac.user_id = auth.uid()
          AND ac.company_id = contact_master.company_id
      ));
  END IF;
END$$;