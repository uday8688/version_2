-- Delete the incorrectly created sample users first
DELETE FROM auth.users WHERE email IN (
  'admin@aptcircle.com',
  'owner@aptcircle.com', 
  'tenant@aptcircle.com',
  'vendor@aptcircle.com'
);