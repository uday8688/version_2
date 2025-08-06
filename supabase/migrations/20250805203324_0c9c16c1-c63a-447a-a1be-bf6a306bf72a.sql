-- Fix infinite recursion in units table RLS policies by simplifying them

-- Drop the problematic policies first
DROP POLICY IF EXISTS "units_admin_full_access" ON public.units;
DROP POLICY IF EXISTS "units_owners_full_access" ON public.units;
DROP POLICY IF EXISTS "units_tenants_view_own" ON public.units;
DROP POLICY IF EXISTS "units_vendors_view_all" ON public.units;

-- Create new simplified policies without recursion
CREATE POLICY "units_admin_access" 
ON public.units FOR ALL 
USING (get_user_role_safe() = 'admin');

CREATE POLICY "units_owners_access" 
ON public.units FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = units.property_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "units_tenants_read" 
ON public.units FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM leases l 
    WHERE l.unit_id = units.id 
    AND l.tenant_id = auth.uid() 
    AND l.status = 'active'
  )
);

CREATE POLICY "units_vendors_read" 
ON public.units FOR SELECT 
USING (get_user_role_safe() = 'vendor');