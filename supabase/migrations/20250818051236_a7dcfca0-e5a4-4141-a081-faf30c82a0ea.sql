-- Create RPC function to get contact summary
CREATE OR REPLACE FUNCTION public.get_contact_summary()
RETURNS TABLE(
  total bigint,
  with_email bigint,
  with_mobile bigint,
  new_30d bigint
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN (official_email_id IS NOT NULL AND official_email_id != '') 
               OR (personal_email_id IS NOT NULL AND personal_email_id != '') 
               THEN 1 END) as with_email,
    COUNT(CASE WHEN (mobile_number IS NOT NULL AND mobile_number != '') 
               OR (direct_phone_number IS NOT NULL AND direct_phone_number != '') 
               THEN 1 END) as with_mobile,
    COUNT(CASE WHEN contact_id > (SELECT COALESCE(MAX(contact_id) - FLOOR(COUNT(*) * 0.1), 0) 
                                  FROM contact_master) 
               THEN 1 END) as new_30d
  FROM contact_master;
$$;