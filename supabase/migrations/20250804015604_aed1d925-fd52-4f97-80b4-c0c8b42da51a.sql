-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id),
  total_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms DECIMAL(2,1) NOT NULL DEFAULT 1.0,
  square_feet INTEGER,
  rent_amount DECIMAL(10,2) NOT NULL,
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, unit_number)
);

-- Create leases table
CREATE TABLE public.leases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(user_id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(user_id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(user_id),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'rent' CHECK (payment_type IN ('rent', 'security_deposit', 'late_fee', 'utilities', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date DATE,
  due_date DATE NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service provider jobs table
CREATE TABLE public.service_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_request_id UUID NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES public.profiles(user_id),
  scheduled_date DATE,
  scheduled_time TIME,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  completion_photos TEXT[], -- Array of photo URLs
  invoice_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for properties
CREATE POLICY "Owners can view their properties" ON public.properties FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Owners can create properties" ON public.properties FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their properties" ON public.properties FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Admins can view all properties" ON public.properties FOR SELECT TO authenticated USING (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies for units
CREATE POLICY "Property owners can manage units" ON public.units FOR ALL USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Tenants can view their unit" ON public.units FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.leases WHERE unit_id = units.id AND tenant_id = auth.uid() AND status = 'active')
);
CREATE POLICY "Admins can view all units" ON public.units FOR SELECT TO authenticated USING (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies for leases
CREATE POLICY "Property owners can view leases" ON public.leases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Tenants can view their leases" ON public.leases FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY "Admins can view all leases" ON public.leases FOR SELECT TO authenticated USING (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies for maintenance requests
CREATE POLICY "Tenants can create maintenance requests" ON public.maintenance_requests FOR INSERT WITH CHECK (tenant_id = auth.uid());
CREATE POLICY "Tenants can view their requests" ON public.maintenance_requests FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY "Property owners can view requests" ON public.maintenance_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Service providers can view assigned requests" ON public.maintenance_requests FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "Admins can view all requests" ON public.maintenance_requests FOR SELECT TO authenticated USING (
  public.get_current_user_role() = 'admin'
);

-- RLS Policies for payments
CREATE POLICY "Tenants can view their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.leases WHERE id = lease_id AND tenant_id = auth.uid())
);
CREATE POLICY "Property owners can view payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.leases l JOIN public.units u ON l.unit_id = u.id JOIN public.properties p ON u.property_id = p.id WHERE l.id = lease_id AND p.owner_id = auth.uid())
);

-- RLS Policies for announcements
CREATE POLICY "Property residents can view announcements" ON public.announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.leases l JOIN public.units u ON l.unit_id = u.id WHERE u.property_id = property_id AND l.tenant_id = auth.uid() AND l.status = 'active')
  OR EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
);
CREATE POLICY "Property owners can manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
);

-- RLS Policies for service jobs
CREATE POLICY "Service providers can view their jobs" ON public.service_jobs FOR SELECT USING (service_provider_id = auth.uid());
CREATE POLICY "Service providers can update their jobs" ON public.service_jobs FOR UPDATE USING (service_provider_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX idx_units_property_id ON public.units(property_id);
CREATE INDEX idx_leases_unit_id ON public.leases(unit_id);
CREATE INDEX idx_leases_tenant_id ON public.leases(tenant_id);
CREATE INDEX idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);
CREATE INDEX idx_maintenance_requests_tenant_id ON public.maintenance_requests(tenant_id);
CREATE INDEX idx_payments_lease_id ON public.payments(lease_id);
CREATE INDEX idx_announcements_property_id ON public.announcements(property_id);
CREATE INDEX idx_service_jobs_service_provider_id ON public.service_jobs(service_provider_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_jobs_updated_at BEFORE UPDATE ON public.service_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();