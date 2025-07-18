-- Create Department Master table
CREATE TABLE public.department_master (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Job Level Master table
CREATE TABLE public.job_level_master (
  id SERIAL PRIMARY KEY,
  job_level_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Company Turnover Master table
CREATE TABLE public.comp_turnover_master (
  id SERIAL PRIMARY KEY,
  turnover_range VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Employee Range Master table
CREATE TABLE public.emp_range_master (
  id SERIAL PRIMARY KEY,
  employee_range VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.department_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_level_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_turnover_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emp_range_master ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since these are master data)
CREATE POLICY "Allow public read access to department_master"
ON public.department_master FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to job_level_master"
ON public.job_level_master FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to comp_turnover_master"
ON public.comp_turnover_master FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to emp_range_master"
ON public.emp_range_master FOR SELECT
USING (true);

-- Allow insert/update/delete for authenticated users (admin functionality)
CREATE POLICY "Allow authenticated insert on department_master"
ON public.department_master FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on department_master"
ON public.department_master FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete on department_master"
ON public.department_master FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert on job_level_master"
ON public.job_level_master FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on job_level_master"
ON public.job_level_master FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete on job_level_master"
ON public.job_level_master FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert on comp_turnover_master"
ON public.comp_turnover_master FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on comp_turnover_master"
ON public.comp_turnover_master FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete on comp_turnover_master"
ON public.comp_turnover_master FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert on emp_range_master"
ON public.emp_range_master FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on emp_range_master"
ON public.emp_range_master FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete on emp_range_master"
ON public.emp_range_master FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_department_master_updated_at
BEFORE UPDATE ON public.department_master
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_level_master_updated_at
BEFORE UPDATE ON public.job_level_master
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comp_turnover_master_updated_at
BEFORE UPDATE ON public.comp_turnover_master
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emp_range_master_updated_at
BEFORE UPDATE ON public.emp_range_master
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();