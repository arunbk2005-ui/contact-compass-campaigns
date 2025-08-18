-- Helper function: turn JSONB array -> uuid[] safely (ignores blanks/invalids)
CREATE OR REPLACE FUNCTION safe_uuid_array(p jsonb)
RETURNS uuid[] LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(array_agg(val::uuid), '{}')
  FROM (
    SELECT value AS val
    FROM jsonb_array_elements_text(coalesce(p, '[]'::jsonb))
    WHERE value ~* '^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$'
  ) t;
$$;

-- Preview function (SECURITY DEFINER, no RLS issues)
CREATE OR REPLACE FUNCTION search_audience(
  p_filters jsonb,
  p_page int DEFAULT 1,
  p_page_size int DEFAULT 50
) RETURNS TABLE (
  contact_id integer, 
  full_name text, 
  email text, 
  mobile text,
  company_name text, 
  website text,
  industry text, 
  department text, 
  job_level text,
  city text,
  state text,
  total_count bigint
) LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      c.contact_id,
      COALESCE(c.first_name || ' ' || c.last_name, c.first_name, c.last_name) AS full_name,
      COALESCE(c.official_email_id, c.personal_email_id) AS email,
      COALESCE(c.mobile_number, c.direct_phone_number) AS mobile,
      o.company_name,
      o.website,
      o.industry,
      c.department,
      c.job_level,
      cm.city,
      cm.state
    FROM contact_master c
    LEFT JOIN organisation_master o ON o.company_id = c.company_id::bigint
    LEFT JOIN city_master cm ON cm.city_id = COALESCE(c."City_ID", o.city_id)
    WHERE 
      (p_filters ? 'industry' IS FALSE OR o.industry ILIKE '%' || (p_filters->>'industry') || '%')
      AND (p_filters ? 'city_id' IS FALSE OR COALESCE(c."City_ID", o.city_id) = (p_filters->>'city_id')::integer)
      AND (p_filters ? 'job_level' IS FALSE OR c.job_level ILIKE '%' || (p_filters->>'job_level') || '%')
      AND (p_filters ? 'department' IS FALSE OR c.department ILIKE '%' || (p_filters->>'department') || '%')
      AND (COALESCE((p_filters->>'has_email')::boolean, false) = false OR (COALESCE(c.official_email_id, c.personal_email_id) IS NOT NULL AND NULLIF(COALESCE(c.official_email_id, c.personal_email_id), '') IS NOT NULL))
      AND (COALESCE((p_filters->>'has_mobile')::boolean, false) = false OR (COALESCE(c.mobile_number, c.direct_phone_number) IS NOT NULL AND NULLIF(COALESCE(c.mobile_number, c.direct_phone_number), '') IS NOT NULL))
      AND (p_filters ? 'employee_min' IS FALSE OR o.no_of_employees_total >= (p_filters->>'employee_min')::integer)
      AND (p_filters ? 'employee_max' IS FALSE OR o.no_of_employees_total <= (p_filters->>'employee_max')::integer)
      AND (p_filters ? 'text_search' IS FALSE OR (
            o.company_name ILIKE '%' || (p_filters->>'text_search') || '%' OR
            COALESCE(c.first_name || ' ' || c.last_name, c.first_name, c.last_name) ILIKE '%' || (p_filters->>'text_search') || '%' OR
            c.official_email_id ILIKE '%' || (p_filters->>'text_search') || '%' OR
            c.personal_email_id ILIKE '%' || (p_filters->>'text_search') || '%'
          ))
  )
  SELECT
    contact_id,
    full_name,
    email,
    mobile,
    company_name,
    website,
    industry,
    department,
    job_level,
    city,
    state,
    COUNT(*) OVER () AS total_count
  FROM base
  ORDER BY full_name NULLS LAST
  LIMIT GREATEST(p_page_size, 1)
  OFFSET GREATEST(p_page - 1, 0) * GREATEST(p_page_size, 1);
$$;

-- Set permissions
REVOKE ALL ON FUNCTION search_audience(jsonb, int, int) FROM public;
GRANT EXECUTE ON FUNCTION search_audience(jsonb, int, int) TO authenticated, service_role;

-- Create supporting indexes for better performance
CREATE INDEX IF NOT EXISTS ix_contact_company_id ON contact_master(company_id);
CREATE INDEX IF NOT EXISTS ix_contact_city_id ON contact_master("City_ID");
CREATE INDEX IF NOT EXISTS ix_contact_department ON contact_master(department);
CREATE INDEX IF NOT EXISTS ix_contact_job_level ON contact_master(job_level);
CREATE INDEX IF NOT EXISTS ix_organisation_industry ON organisation_master(industry);
CREATE INDEX IF NOT EXISTS ix_organisation_city_id ON organisation_master(city_id);
CREATE INDEX IF NOT EXISTS ix_organisation_employees ON organisation_master(no_of_employees_total);