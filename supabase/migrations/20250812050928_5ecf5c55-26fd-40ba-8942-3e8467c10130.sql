-- Audience feature: tables, RLS, indexes, and RPC to build and save audiences
-- 1) Tables

-- Ensure updated_at trigger function exists (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- audience_runs: stores each audience build execution and its filters
CREATE TABLE IF NOT EXISTS public.audience_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text,
  source text NOT NULL DEFAULT 'company_contact',
  status text NOT NULL DEFAULT 'completed', -- 'running' | 'completed' | 'failed'
  total_results integer NOT NULL DEFAULT 0,
  filters jsonb NOT NULL,
  notes text
);

ALTER TABLE public.audience_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_runs' AND policyname = 'Audience runs - public select'
  ) THEN
    CREATE POLICY "Audience runs - public select"
      ON public.audience_runs
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_runs' AND policyname = 'Audience runs - insert'
  ) THEN
    CREATE POLICY "Audience runs - insert"
      ON public.audience_runs
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_runs' AND policyname = 'Audience runs - update'
  ) THEN
    CREATE POLICY "Audience runs - update"
      ON public.audience_runs
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_runs' AND policyname = 'Audience runs - delete'
  ) THEN
    CREATE POLICY "Audience runs - delete"
      ON public.audience_runs
      FOR DELETE
      USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audience_runs_updated_at'
  ) THEN
    CREATE TRIGGER trg_audience_runs_updated_at
    BEFORE UPDATE ON public.audience_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- audience_results: denormalized snapshot of results per run
CREATE TABLE IF NOT EXISTS public.audience_results (
  id bigserial PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.audience_runs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  contact_id integer,
  company_id bigint,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  city_id integer,
  city text,
  state text,
  industry text,
  job_level text,
  department text
);

CREATE INDEX IF NOT EXISTS idx_audience_results_run_id ON public.audience_results(run_id);

ALTER TABLE public.audience_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_results' AND policyname = 'Audience results - public select'
  ) THEN
    CREATE POLICY "Audience results - public select"
      ON public.audience_results
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_results' AND policyname = 'Audience results - insert'
  ) THEN
    CREATE POLICY "Audience results - insert"
      ON public.audience_results
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_results' AND policyname = 'Audience results - update'
  ) THEN
    CREATE POLICY "Audience results - update"
      ON public.audience_results
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audience_results' AND policyname = 'Audience results - delete'
  ) THEN
    CREATE POLICY "Audience results - delete"
      ON public.audience_results
      FOR DELETE
      USING (true);
  END IF;
END$$;

-- 2) RPC to build an audience from filters and save results
-- This function builds a dynamic filter across contact_master and organisation_master and saves rows into audience_results
CREATE OR REPLACE FUNCTION public.build_audience(
  p_filters jsonb,
  p_run_name text DEFAULT NULL,
  p_save boolean DEFAULT true
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id uuid := gen_random_uuid();
  v_sql text;
  v_where_clauses text := '';
  v_advanced_sql text := '';
  v_rowcount bigint := 0;
BEGIN
  -- Create run row with status 'running' when saving
  IF p_save THEN
    INSERT INTO public.audience_runs(id, name, status, filters, source)
    VALUES (v_run_id, p_run_name, 'running', COALESCE(p_filters, '{}'::jsonb), 'company_contact');
  END IF;

  -- Basic filters
  IF p_filters ? 'industry' THEN
    v_where_clauses := v_where_clauses || format(' AND o.industry ILIKE %L', '%' || (p_filters->>'industry') || '%');
  END IF;

  IF p_filters ? 'city_id' THEN
    v_where_clauses := v_where_clauses || format(' AND COALESCE(c."City_ID", o.city_id) = %s', (p_filters->>'city_id'));
  END IF;

  IF p_filters ? 'job_level' THEN
    v_where_clauses := v_where_clauses || format(' AND c.job_level ILIKE %L', '%' || (p_filters->>'job_level') || '%');
  END IF;

  IF p_filters ? 'department' THEN
    v_where_clauses := v_where_clauses || format(' AND c.department ILIKE %L', '%' || (p_filters->>'department') || '%');
  END IF;

  IF p_filters ? 'has_email' AND (p_filters->>'has_email')::boolean IS TRUE THEN
    v_where_clauses := v_where_clauses || ' AND NULLIF(COALESCE(c.official_email_id, c.personal_email_id), '''') IS NOT NULL';
  END IF;

  IF p_filters ? 'has_phone' AND (p_filters->>'has_phone')::boolean IS TRUE THEN
    v_where_clauses := v_where_clauses || ' AND NULLIF(COALESCE(c.mobile_number, c.direct_phone_number), '''') IS NOT NULL';
  END IF;

  IF p_filters ? 'employee_min' THEN
    v_where_clauses := v_where_clauses || format(' AND o.no_of_employees_total >= %s', (p_filters->>'employee_min'));
  END IF;

  IF p_filters ? 'employee_max' THEN
    v_where_clauses := v_where_clauses || format(' AND o.no_of_employees_total <= %s', (p_filters->>'employee_max'));
  END IF;

  IF p_filters ? 'text_search' THEN
    v_where_clauses := v_where_clauses || format(
      ' AND (o.company_name ILIKE %L OR (COALESCE(c.first_name, '''') || '' '' || COALESCE(c.last_name, '''')) ILIKE %L OR c.official_email_id ILIKE %L OR c.personal_email_id ILIKE %L)'
      , '%' || (p_filters->>'text_search') || '%'
      , '%' || (p_filters->>'text_search') || '%'
      , '%' || (p_filters->>'text_search') || '%'
      , '%' || (p_filters->>'text_search') || '%'
    );
  END IF;

  -- Advanced conditions: array of objects [{field, op, value, connector}]
  IF p_filters ? 'conditions' THEN
    DECLARE
      cond jsonb;
      idx int := 0;
      f text; o text; connector text; val jsonb;
      col_expr text; op_expr text; val_expr text;
    BEGIN
      FOR cond IN SELECT * FROM jsonb_array_elements(p_filters->'conditions') LOOP
        idx := idx + 1;
        f := upper(trim(both ' ' FROM cond->>'field'));
        o := upper(trim(both ' ' FROM cond->>'op'));
        connector := upper(COALESCE(NULLIF(cond->>'connector', ''), CASE WHEN idx = 1 THEN '' ELSE 'AND' END));
        val := cond->'value';

        -- Map field to column expression
        col_expr := CASE f
          WHEN 'INDUSTRY' THEN 'o.industry'
          WHEN 'CITY' THEN 'COALESCE(c."City_ID", o.city_id)'
          WHEN 'CITY_ID' THEN 'COALESCE(c."City_ID", o.city_id)'
          WHEN 'COMPANY_NAME' THEN 'o.company_name'
          WHEN 'FIRST_NAME' THEN 'c.first_name'
          WHEN 'LAST_NAME' THEN 'c.last_name'
          WHEN 'EMAIL' THEN 'COALESCE(c.official_email_id, c.personal_email_id)'
          WHEN 'PHONE' THEN 'COALESCE(c.mobile_number, c.direct_phone_number)'
          WHEN 'JOB_LEVEL' THEN 'c.job_level'
          WHEN 'DEPARTMENT' THEN 'c.department'
          WHEN 'EMPLOYEES' THEN 'o.no_of_employees_total'
          ELSE NULL
        END;
        IF col_expr IS NULL THEN
          RAISE EXCEPTION 'Unsupported field in conditions: %', f;
        END IF;

        -- Validate and map operator
        op_expr := CASE o
          WHEN '=' THEN '='
          WHEN '!=' THEN '!='
          WHEN '<>' THEN '<>'
          WHEN '>' THEN '>'
          WHEN '>=' THEN '>='
          WHEN '<' THEN '<'
          WHEN '<=' THEN '<='
          WHEN 'LIKE' THEN 'LIKE'
          WHEN 'ILIKE' THEN 'ILIKE'
          WHEN 'IN' THEN 'IN'
          WHEN 'NOT IN' THEN 'NOT IN'
          ELSE NULL
        END;
        IF op_expr IS NULL THEN
          RAISE EXCEPTION 'Unsupported operator in conditions: %', o;
        END IF;

        -- Build value expression
        IF op_expr IN ('IN','NOT IN') THEN
          val_expr := '()';
          SELECT '(' || string_agg(quote_literal(x), ', ') || ')'
          INTO val_expr
          FROM (
            SELECT jsonb_array_elements_text(CASE WHEN jsonb_typeof(val) = 'array' THEN val ELSE jsonb_build_array(val) END) AS x
          ) s;
        ELSE
          -- Use LIKE/ILIKE with wildcards when applicable
          IF op_expr IN ('LIKE','ILIKE') THEN
            val_expr := quote_literal('%' || COALESCE(val::text, ''));
          ELSE
            -- For numbers, avoid quotes if numeric
            IF (f IN ('EMPLOYEES','CITY','CITY_ID') AND (jsonb_typeof(val) = 'number' OR (val->>0) ~ '^[0-9]+$')) THEN
              val_expr := (val::text);
            ELSE
              val_expr := quote_literal(trim(both '"' FROM val::text));
            END IF;
          END IF;
        END IF;

        -- Append to advanced SQL
        IF idx = 1 THEN
          v_advanced_sql := format('(%s %s %s)', col_expr, op_expr, val_expr);
        ELSE
          v_advanced_sql := v_advanced_sql || format(' %s (%s %s %s)', COALESCE(NULLIF(connector,''),'AND'), col_expr, op_expr, val_expr);
        END IF;
      END LOOP;
    END;
  END IF;

  v_sql := '
    WITH joined AS (
      SELECT 
        c.contact_id,
        o.company_id,
        o.company_name,
        c.first_name,
        c.last_name,
        COALESCE(c.official_email_id, c.personal_email_id) AS email,
        COALESCE(c.mobile_number, c.direct_phone_number) AS phone,
        COALESCE(c."City_ID", o.city_id) AS city_id,
        cm.city,
        cm.state,
        o.industry,
        c.job_level,
        c.department
      FROM public.contact_master c
      LEFT JOIN public.organisation_master o ON o.company_id = c.company_id::bigint
      LEFT JOIN public.city_master cm ON cm.city_id = COALESCE(c."City_ID", o.city_id)
    )
    SELECT * FROM joined WHERE 1=1' || v_where_clauses || CASE WHEN v_advanced_sql <> '' THEN ' AND ('|| v_advanced_sql ||')' ELSE '' END;

  -- Save results when requested
  IF p_save THEN
    EXECUTE 'INSERT INTO public.audience_results(
              run_id, contact_id, company_id, company_name, first_name, last_name, email, phone, city_id, city, state, industry, job_level, department)
            ' ||
            'SELECT $1, contact_id, company_id, company_name, first_name, last_name, email, phone, city_id, city, state, industry, job_level, department FROM (' || v_sql || ') q'
    USING v_run_id;

    GET DIAGNOSTICS v_rowcount = ROW_COUNT;
    UPDATE public.audience_runs SET total_results = COALESCE(v_rowcount,0), status = 'completed' WHERE id = v_run_id;

    RETURN v_run_id;
  ELSE
    -- If not saving, still create a run for traceability but marked completed with zero count
    INSERT INTO public.audience_runs(id, name, status, filters, source, total_results)
    VALUES (v_run_id, p_run_name, 'completed', COALESCE(p_filters, '{}'::jsonb), 'company_contact', 0);
    RETURN v_run_id;
  END IF;
END;
$$;

-- Helper read-only function to fetch results by run
CREATE OR REPLACE FUNCTION public.get_audience_results(p_run_id uuid)
RETURNS SETOF public.audience_results
LANGUAGE sql
AS $$
  SELECT * FROM public.audience_results WHERE run_id = p_run_id ORDER BY id;
$$;
