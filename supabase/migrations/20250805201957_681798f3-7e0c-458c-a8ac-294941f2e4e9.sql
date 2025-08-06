-- Fix infinite recursion in RLS policies by dropping problematic policies and recreating them properly

-- Drop all existing policies for leases table to fix infinite recursion
DROP POLICY IF EXISTS "Admins can view all leases" ON public.leases;
DROP POLICY IF EXISTS "Property owners can view leases" ON public.leases;
DROP POLICY IF EXISTS "Tenants can view their leases" ON public.leases;
DROP POLICY IF EXISTS "owners_can_view_their_property_leases" ON public.leases;
DROP POLICY IF EXISTS "tenants_can_view_their_lease_simple" ON public.leases;

-- Drop all existing policies for units table to fix infinite recursion
DROP POLICY IF EXISTS "units_admin_access" ON public.units;
DROP POLICY IF EXISTS "units_owner_access" ON public.units;
DROP POLICY IF EXISTS "units_tenant_view" ON public.units;
DROP POLICY IF EXISTS "units_vendor_view" ON public.units;

-- Create new safe policies for leases table
CREATE POLICY "leases_admin_can_view_all" ON public.leases
FOR SELECT USING (get_user_role_safe() = 'admin');

CREATE POLICY "leases_tenants_can_view_own" ON public.leases
FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "leases_owners_can_view_property_leases" ON public.leases
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.units u 
    JOIN public.properties p ON u.property_id = p.id 
    WHERE u.id = leases.unit_id AND p.owner_id = auth.uid()
  )
);

-- Create new safe policies for units table
CREATE POLICY "units_admin_full_access" ON public.units
FOR ALL USING (get_user_role_safe() = 'admin');

CREATE POLICY "units_owners_full_access" ON public.units
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = units.property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "units_tenants_view_own" ON public.units
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.leases l 
    WHERE l.unit_id = units.id AND l.tenant_id = auth.uid() AND l.status = 'active'
  )
);

CREATE POLICY "units_vendors_view_all" ON public.units
FOR SELECT USING (get_user_role_safe() = 'vendor');