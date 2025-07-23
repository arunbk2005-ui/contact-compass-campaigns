-- Enable RLS on the remaining tables
ALTER TABLE public.comp_turnover_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emp_range_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_level_master ENABLE ROW LEVEL SECURITY;