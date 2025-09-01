-- Fix the search path security issue for build_audience function
CREATE OR REPLACE FUNCTION public.build_audience(
  p_filters jsonb, 
  p_run_name text DEFAULT NULL::text, 
  p_save boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_run_id uuid := gen_random_uuid();
  v_sql text;
  v_where_clauses text := '';
  v_rowcount bigint := 0;
BEGIN
  -- Create the audience run record first
  IF p_save THEN
    INSERT INTO public.audience_runs(id, name, status, filters, source)
    VALUES (v_run_id, p_run_name, 'running', COALESCE(p_filters, '{}'::jsonb), 'company_contact');
  END IF;

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

  -- Build and execute the main query to save results
  v_sql := '
    INSERT INTO public.audience_results(
      run_id, contact_id, company_id, company_name, first_name, last_name, 
      email, phone, city_id, city, state, industry, job_level, department
    )
    SELECT 
      $1,
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
    WHERE 1=1' || v_where_clauses;

  IF p_save THEN
    EXECUTE v_sql USING v_run_id;
    GET DIAGNOSTICS v_rowcount = ROW_COUNT;
    
    -- Update the run with the final count and status
    UPDATE public.audience_runs 
    SET total_results = COALESCE(v_rowcount, 0), status = 'completed' 
    WHERE id = v_run_id;
  ELSE
    -- Just create a placeholder run without saving results
    INSERT INTO public.audience_runs(id, name, status, filters, source, total_results)
    VALUES (v_run_id, p_run_name, 'completed', COALESCE(p_filters, '{}'::jsonb), 'company_contact', 0);
  END IF;

  RETURN v_run_id;
END;
$function$;