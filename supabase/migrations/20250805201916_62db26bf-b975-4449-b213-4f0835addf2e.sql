-- Create sample utility bills for testing
INSERT INTO public.utility_bills (
  property_id, 
  unit_id, 
  bill_type, 
  amount, 
  due_date, 
  billing_period_start, 
  billing_period_end, 
  status
) 
SELECT 
  p.id as property_id,
  u.id as unit_id,
  'electricity' as bill_type,
  ROUND((RANDOM() * 150 + 50)::numeric, 2) as amount,
  CURRENT_DATE + INTERVAL '15 days' as due_date,
  CURRENT_DATE - INTERVAL '1 month' as billing_period_start,
  CURRENT_DATE as billing_period_end,
  'pending' as status
FROM properties p
JOIN units u ON u.property_id = p.id
LIMIT 10;

-- Add water bills
INSERT INTO public.utility_bills (
  property_id, 
  unit_id, 
  bill_type, 
  amount, 
  due_date, 
  billing_period_start, 
  billing_period_end, 
  status
) 
SELECT 
  p.id as property_id,
  u.id as unit_id,
  'water' as bill_type,
  ROUND((RANDOM() * 80 + 30)::numeric, 2) as amount,
  CURRENT_DATE + INTERVAL '10 days' as due_date,
  CURRENT_DATE - INTERVAL '1 month' as billing_period_start,
  CURRENT_DATE as billing_period_end,
  'pending' as status
FROM properties p
JOIN units u ON u.property_id = p.id
LIMIT 5;

-- Add gas bills
INSERT INTO public.utility_bills (
  property_id, 
  unit_id, 
  bill_type, 
  amount, 
  due_date, 
  billing_period_start, 
  billing_period_end, 
  status
) 
SELECT 
  p.id as property_id,
  u.id as unit_id,
  'gas' as bill_type,
  ROUND((RANDOM() * 70 + 25)::numeric, 2) as amount,
  CURRENT_DATE + INTERVAL '20 days' as due_date,
  CURRENT_DATE - INTERVAL '1 month' as billing_period_start,
  CURRENT_DATE as billing_period_end,
  'pending' as status
FROM properties p
JOIN units u ON u.property_id = p.id
LIMIT 3;