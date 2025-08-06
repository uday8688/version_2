-- Fix payments table policies to allow INSERT operations
CREATE POLICY "Users can create payments for their leases" ON public.payments
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases 
    WHERE leases.id = payments.lease_id 
    AND leases.tenant_id = auth.uid()
  )
);

-- Add policy for edge functions to insert payments (for Stripe integration)
CREATE POLICY "System can insert payments" ON public.payments
FOR INSERT 
WITH CHECK (true);

-- Add policy for users to update their own payments (for status updates)
CREATE POLICY "Users can update their payment status" ON public.payments
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM leases 
    WHERE leases.id = payments.lease_id 
    AND leases.tenant_id = auth.uid()
  )
);

-- Add policy for system to update payments (for Stripe webhooks)
CREATE POLICY "System can update payments" ON public.payments
FOR UPDATE 
USING (true);