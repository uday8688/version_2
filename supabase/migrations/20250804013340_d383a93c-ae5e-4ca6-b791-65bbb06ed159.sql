-- Create sample users for testing all roles
-- Note: These are test accounts with email_confirmed_at set to bypass email verification

-- Insert sample users into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES 
-- Admin user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@aptcircle.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Admin User", "role": "admin"}',
  'authenticated',
  'authenticated'
),
-- Owner user  
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'owner@aptcircle.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Property Owner", "role": "owner"}',
  'authenticated',
  'authenticated'
),
-- Tenant user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'tenant@aptcircle.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Tenant User", "role": "tenant"}',
  'authenticated',
  'authenticated'
),
-- Vendor user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'vendor@aptcircle.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Service Provider", "role": "vendor"}',
  'authenticated',
  'authenticated'
);

-- The profiles will be automatically created by the trigger we set up