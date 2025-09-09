-- Update RLS policies for profiles to allow broader access
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more permissive policies
CREATE POLICY "Allow authenticated users to view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (true);

-- Update user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Allow authenticated users to view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);