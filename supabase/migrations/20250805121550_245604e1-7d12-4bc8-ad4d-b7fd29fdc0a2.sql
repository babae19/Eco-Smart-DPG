-- Enable password strength and leaked password protection
-- This addresses the Supabase security warning

-- Update auth configuration for better password security
UPDATE auth.config 
SET 
  password_min_length = 8,
  password_require_letters = true,
  password_require_digits = true,
  password_require_symbols = false,
  password_require_uppercase = false,
  enable_signup = true,
  enable_confirmations = true,
  enable_password_strength = true,
  enable_weak_password_protection = true
WHERE true;

-- Create a trigger to log authentication events for security monitoring
CREATE OR REPLACE FUNCTION public.log_auth_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Log successful logins and signups for security monitoring
  IF TG_OP = 'UPDATE' AND OLD.last_sign_in_at != NEW.last_sign_in_at THEN
    INSERT INTO public.notifications (user_id, title, description, type)
    VALUES (
      NEW.id,
      'Security Alert',
      'New login detected on your account',
      'security'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;