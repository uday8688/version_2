-- Add notification system tables
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  read_at TIMESTAMPTZ,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  maintenance_updates BOOLEAN DEFAULT true,
  community_announcements BOOLEAN DEFAULT true,
  visitor_requests BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add utility bills table
CREATE TABLE public.utility_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  bill_type TEXT NOT NULL, -- 'electricity', 'water', 'gas', 'internet'
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update payments table to include more fields
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_fee NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view their preferences" ON public.notification_preferences
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their preferences" ON public.notification_preferences
FOR ALL USING (user_id = auth.uid());

-- Utility bills policies
CREATE POLICY "Tenants can view their utility bills" ON public.utility_bills
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leases l 
    WHERE l.unit_id = utility_bills.unit_id 
    AND l.tenant_id = auth.uid() 
    AND l.status = 'active'
  )
);

CREATE POLICY "Property owners can view utility bills" ON public.utility_bills
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM units u 
    JOIN properties p ON u.property_id = p.id
    WHERE u.id = utility_bills.unit_id 
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage utility bills" ON public.utility_bills
FOR ALL USING (get_current_user_role() = 'admin');

-- Add triggers for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_utility_bills_updated_at
BEFORE UPDATE ON public.utility_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();