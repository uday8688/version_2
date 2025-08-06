-- Fix infinite recursion in database policies by creating simpler, non-recursive policies

-- Drop existing problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "tenants_can_view_their_lease" ON public.leases;
DROP POLICY IF EXISTS "tenants_can_view_their_unit" ON public.units;
DROP POLICY IF EXISTS "owners_can_view_their_properties_units" ON public.units;

-- Create simple, non-recursive policies for leases
CREATE POLICY "tenants_can_view_their_lease_simple" 
ON public.leases 
FOR SELECT 
USING (tenant_id = auth.uid());

CREATE POLICY "owners_can_view_their_property_leases" 
ON public.leases 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.units u 
    JOIN public.properties p ON u.property_id = p.id 
    WHERE u.id = leases.unit_id 
    AND p.owner_id = auth.uid()
));

-- Create simple, non-recursive policies for units
CREATE POLICY "tenants_can_view_their_unit_simple" 
ON public.units 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.leases l 
    WHERE l.unit_id = units.id 
    AND l.tenant_id = auth.uid()
));

CREATE POLICY "owners_can_view_their_units_simple" 
ON public.units 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = units.property_id 
    AND p.owner_id = auth.uid()
));

-- Allow admins and vendors to view units
CREATE POLICY "admins_vendors_can_view_units" 
ON public.units 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (user_metadata->>'role')::text IN ('admin', 'vendor')
));