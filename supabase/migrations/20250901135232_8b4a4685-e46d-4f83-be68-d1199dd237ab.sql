-- Fix search path for all functions to resolve security warnings

-- Update safe_uuid_array function with proper search path
CREATE OR REPLACE FUNCTION public.safe_uuid_array(p jsonb)
RETURNS uuid[] 
LANGUAGE sql 
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT coalesce(array_agg(val::uuid), '{}')
  FROM (
    SELECT value AS val
    FROM jsonb_array_elements_text(coalesce(p, '[]'::jsonb))
    WHERE value ~* '^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$'
  ) t;
$function$;

-- Update search_audience function with proper search path  
CREATE OR REPLACE FUNCTION public.search_audience(
  p_filters jsonb,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 50
)
RETURNS TABLE(
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
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
      AND (COALESCE((p_filters->>'has_phone')::boolean, false) = false OR (COALESCE(c.mobile_number, c.direct_phone_number) IS NOT NULL AND NULLIF(COALESCE(c.mobile_number, c.direct_phone_number), '') IS NOT NULL))
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
$function$;