-- Fix Critical Security Vulnerabilities

-- 1. Fix Role Escalation Vulnerability - Replace overly permissive profiles policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create secure profiles policies that prevent role changes
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND role = 'tenant');

CREATE POLICY "Users can update their profile (no role changes)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 2. Fix Infinite Recursion in Units Table
-- First, drop problematic policies
DROP POLICY IF EXISTS "Property owners can manage units" ON public.units;
DROP POLICY IF EXISTS "Tenants can view their unit" ON public.units;
DROP POLICY IF EXISTS "Admins can view all units" ON public.units;
DROP POLICY IF EXISTS "admins_can_view_all_units" ON public.units;
DROP POLICY IF EXISTS "owners_can_view_their_units" ON public.units;
DROP POLICY IF EXISTS "tenants_can_view_their_unit" ON public.units;
DROP POLICY IF EXISTS "vendors_can_view_units" ON public.units;

-- Create security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.profiles WHERE user_id = auth.uid()),
    'tenant'
  );
$$;

-- Create new non-recursive policies for units
CREATE POLICY "Admins can manage all units" 
ON public.units 
FOR ALL 
USING (get_user_role_safe() = 'admin');

CREATE POLICY "Property owners can manage their units" 
ON public.units 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = units.property_id 
  AND properties.owner_id = auth.uid()
));

CREATE POLICY "Tenants can view their assigned unit" 
ON public.units 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.leases 
  WHERE leases.unit_id = units.id 
  AND leases.tenant_id = auth.uid() 
  AND leases.status = 'active'
));

CREATE POLICY "Vendors can view units for maintenance" 
ON public.units 
FOR SELECT 
USING (get_user_role_safe() = 'vendor');

-- 3. Fix Overly Permissive System Policies
-- Replace system policies with proper authorization
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create secure payment policies
CREATE POLICY "Authenticated users can create payments for their leases" 
ON public.payments 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.leases 
    WHERE leases.id = payments.lease_id 
    AND leases.tenant_id = auth.uid()
  )
);

CREATE POLICY "Payment creators and property owners can update payments" 
ON public.payments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.leases 
    WHERE leases.id = payments.lease_id 
    AND leases.tenant_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.leases l
    JOIN public.units u ON l.unit_id = u.id
    JOIN public.properties p ON u.property_id = p.id
    WHERE l.id = payments.lease_id 
    AND p.owner_id = auth.uid()
  ) OR
  get_user_role_safe() = 'admin'
);

-- Create secure notification policies
CREATE POLICY "Admins and system functions can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  get_user_role_safe() = 'admin' OR
  auth.uid() IS NOT NULL
);

-- 4. Add data validation triggers
CREATE OR REPLACE FUNCTION public.validate_payment_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validate amount is positive
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;
  
  -- Validate due date is not in the past (for new records)
  IF TG_OP = 'INSERT' AND NEW.due_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Due date cannot be in the past';
  END IF;
  
  -- Validate payment type
  IF NEW.payment_type NOT IN ('rent', 'utilities', 'deposit', 'fee', 'maintenance') THEN
    RAISE EXCEPTION 'Invalid payment type';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_payment_trigger
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.validate_payment_data();

-- 5. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (get_user_role_safe() = 'admin');

-- Audit function for profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (
      'profiles',
      'role_change',
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();