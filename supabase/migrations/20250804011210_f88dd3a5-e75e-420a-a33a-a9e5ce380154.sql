-- Make email confirmation optional for testing
-- This allows users to sign in immediately without email confirmation
-- Note: In production, you may want to re-enable this for security

-- Disable email confirmation requirement
UPDATE auth.config 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb), 
  '{MAILER_AUTOCONFIRM}', 
  'true'::jsonb
) 
WHERE id = 'auth';

-- Alternative approach if the above doesn't work:
-- We'll add a function to manually confirm test users
CREATE OR REPLACE FUNCTION public.confirm_test_user(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's email_confirmed_at field
  UPDATE auth.users 
  SET email_confirmed_at = now()
  WHERE email = user_email 
  AND email_confirmed_at IS NULL;
  
  RETURN FOUND;
END;
$$;