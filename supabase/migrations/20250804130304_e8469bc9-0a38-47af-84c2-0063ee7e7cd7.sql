-- Fix infinite recursion in units table RLS policies
-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Admins can manage all units" ON public.units;
DROP POLICY IF EXISTS "Property owners can manage their units" ON public.units;
DROP POLICY IF EXISTS "Tenants can view their assigned unit" ON public.units;
DROP POLICY IF EXISTS "Vendors can view units for maintenance" ON public.units;

-- Create non-recursive policies for units table
-- Use direct role comparison instead of function calls to avoid recursion

-- Policy for admins - check role directly from profiles table
CREATE POLICY "units_admin_access" 
ON public.units 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy for property owners - direct property ownership check
CREATE POLICY "units_owner_access" 
ON public.units 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = units.property_id 
    AND properties.owner_id = auth.uid()
  )
);

-- Policy for tenants - direct lease check
CREATE POLICY "units_tenant_view" 
ON public.units 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leases 
    WHERE leases.unit_id = units.id 
    AND leases.tenant_id = auth.uid() 
    AND leases.status = 'active'
  )
);

-- Policy for vendors - direct role check
CREATE POLICY "units_vendor_view" 
ON public.units 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'vendor'
  )
);