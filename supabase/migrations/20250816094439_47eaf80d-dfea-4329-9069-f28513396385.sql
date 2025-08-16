-- Create function for audience preview with pagination
CREATE OR REPLACE FUNCTION public.preview_audience(
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
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
  department text,
  total_count bigint
) 
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_sql text;
  v_where_clauses text := '';
  v_advanced_sql text := '';
  v_count_sql text;
  v_total_count bigint := 0;
BEGIN
  -- Build WHERE clauses from filters
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

  -- Get total count first
  v_count_sql := '
    WITH joined AS (
      SELECT c.contact_id
      FROM public.contact_master c
      LEFT JOIN public.organisation_master o ON o.company_id = c.company_id::bigint
      LEFT JOIN public.city_master cm ON cm.city_id = COALESCE(c."City_ID", o.city_id)
      WHERE 1=1' || v_where_clauses || '
    )
    SELECT COUNT(*) FROM joined';

  EXECUTE v_count_sql INTO v_total_count;

  -- Build main query with pagination
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
        c.department,
        ' || v_total_count || '::bigint AS total_count
      FROM public.contact_master c
      LEFT JOIN public.organisation_master o ON o.company_id = c.company_id::bigint
      LEFT JOIN public.city_master cm ON cm.city_id = COALESCE(c."City_ID", o.city_id)
      WHERE 1=1' || v_where_clauses || '
    )
    SELECT * FROM joined
    ORDER BY contact_id
    LIMIT ' || p_limit || ' OFFSET ' || p_offset;

  RETURN QUERY EXECUTE v_sql;
END;
$function$;