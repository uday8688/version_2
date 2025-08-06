-- Fix infinite recursion in units table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "tenants_can_view_their_unit_simple" ON public.units;
DROP POLICY IF EXISTS "owners_can_view_their_units_simple" ON public.units;
DROP POLICY IF EXISTS "admins_vendors_can_view_units" ON public.units;

-- Create new secure policies without recursion
CREATE POLICY "owners_can_view_their_units" ON public.units
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = units.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "tenants_can_view_their_unit" ON public.units
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.leases 
      WHERE leases.unit_id = units.id 
      AND leases.tenant_id = auth.uid() 
      AND leases.status = 'active'
    )
  );

CREATE POLICY "admins_can_view_all_units" ON public.units
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "vendors_can_view_units" ON public.units
  FOR SELECT 
  USING (get_current_user_role() = 'vendor');

-- Fix maintenance_requests policies to avoid recursion
DROP POLICY IF EXISTS "Property owners can view requests" ON public.maintenance_requests;

CREATE POLICY "Property owners can view requests" ON public.maintenance_requests
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON u.property_id = p.id
      WHERE u.id = maintenance_requests.unit_id 
      AND p.owner_id = auth.uid()
    )
  );

-- Fix announcements policies 
DROP POLICY IF EXISTS "Property residents can view announcements" ON public.announcements;

CREATE POLICY "Property residents can view announcements" ON public.announcements
  FOR SELECT 
  USING (
    -- Property owners can view their property announcements
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = announcements.property_id 
      AND properties.owner_id = auth.uid()
    )
    OR
    -- Tenants can view announcements for properties they live in
    EXISTS (
      SELECT 1 FROM public.leases l
      JOIN public.units u ON l.unit_id = u.id
      WHERE u.property_id = announcements.property_id 
      AND l.tenant_id = auth.uid() 
      AND l.status = 'active'
    )
  );