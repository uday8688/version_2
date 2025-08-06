-- Create community events table
CREATE TABLE public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('kids', 'adults', 'elderly', 'all')),
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  registration_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  UNIQUE(event_id, user_id)
);

-- Create visitor requests table
CREATE TABLE public.visitor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visitor_email TEXT,
  purpose TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'checked_in', 'checked_out')),
  approved_by UUID,
  approval_time TIMESTAMPTZ,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create background verifications table
CREATE TABLE public.background_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('aadhaar', 'pan', 'license', 'passport')),
  document_number TEXT NOT NULL,
  document_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  expiry_date DATE,
  api_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create community posts table for neighbor networking
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  property_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('general', 'buy_sell', 'help', 'complaint', 'suggestion')),
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create post comments table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_events
CREATE POLICY "Community members can view events" ON public.community_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leases l 
    JOIN units u ON l.unit_id = u.id 
    WHERE u.property_id = community_events.property_id 
    AND l.tenant_id = auth.uid() 
    AND l.status = 'active'
  ) OR
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = community_events.property_id 
    AND p.owner_id = auth.uid()
  ) OR
  get_user_role_safe() = 'admin'
);

CREATE POLICY "Property owners and admins can manage events" ON public.community_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = community_events.property_id 
    AND p.owner_id = auth.uid()
  ) OR
  get_user_role_safe() = 'admin'
);

-- RLS Policies for event_registrations
CREATE POLICY "Users can manage their registrations" ON public.event_registrations
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Event organizers can view registrations" ON public.event_registrations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_events ce
    JOIN properties p ON ce.property_id = p.id
    WHERE ce.id = event_registrations.event_id
    AND (p.owner_id = auth.uid() OR ce.created_by = auth.uid())
  ) OR
  get_user_role_safe() = 'admin'
);

-- RLS Policies for visitor_requests
CREATE POLICY "Tenants can manage their visitor requests" ON public.visitor_requests
FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Property staff can view visitor requests" ON public.visitor_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leases l
    JOIN units u ON l.unit_id = u.id
    JOIN properties p ON u.property_id = p.id
    WHERE l.tenant_id = visitor_requests.tenant_id
    AND p.owner_id = auth.uid()
  ) OR
  get_user_role_safe() IN ('admin', 'vendor')
);

-- RLS Policies for background_verifications
CREATE POLICY "Users can view their verifications" ON public.background_verifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage verifications" ON public.background_verifications
FOR ALL USING (get_user_role_safe() = 'admin');

-- RLS Policies for community_posts
CREATE POLICY "Community members can view posts" ON public.community_posts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leases l 
    JOIN units u ON l.unit_id = u.id 
    WHERE u.property_id = community_posts.property_id 
    AND l.tenant_id = auth.uid() 
    AND l.status = 'active'
  ) OR
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = community_posts.property_id 
    AND p.owner_id = auth.uid()
  ) OR
  get_user_role_safe() = 'admin'
);

CREATE POLICY "Community members can create posts" ON public.community_posts
FOR INSERT WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM leases l 
    JOIN units u ON l.unit_id = u.id 
    WHERE u.property_id = community_posts.property_id 
    AND l.tenant_id = auth.uid() 
    AND l.status = 'active'
  )
);

CREATE POLICY "Authors can update their posts" ON public.community_posts
FOR UPDATE USING (author_id = auth.uid());

-- RLS Policies for post_comments
CREATE POLICY "Community members can view comments" ON public.post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_posts cp
    JOIN leases l ON l.tenant_id = auth.uid()
    JOIN units u ON l.unit_id = u.id
    WHERE cp.id = post_comments.post_id
    AND u.property_id = cp.property_id
    AND l.status = 'active'
  ) OR
  get_user_role_safe() = 'admin'
);

CREATE POLICY "Community members can create comments" ON public.post_comments
FOR INSERT WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM community_posts cp
    JOIN leases l ON l.tenant_id = auth.uid()
    JOIN units u ON l.unit_id = u.id
    WHERE cp.id = post_comments.post_id
    AND u.property_id = cp.property_id
    AND l.status = 'active'
  )
);

CREATE POLICY "Authors can update their comments" ON public.post_comments
FOR UPDATE USING (author_id = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.event_registrations 
ADD CONSTRAINT fk_event_registrations_event 
FOREIGN KEY (event_id) REFERENCES public.community_events(id) ON DELETE CASCADE;

ALTER TABLE public.post_comments 
ADD CONSTRAINT fk_post_comments_post 
FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitor_requests_updated_at
  BEFORE UPDATE ON public.visitor_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_background_verifications_updated_at
  BEFORE UPDATE ON public.background_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();