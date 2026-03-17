
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS referred_by text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS withdraw_password text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gender text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS username text DEFAULT NULL;

-- Generate a unique referral code for each existing user
UPDATE public.profiles SET referral_code = UPPER(SUBSTRING(id::text FROM 1 FOR 8)) WHERE referral_code IS NULL;

-- Create function to generate referral code on new profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.referral_code := UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();
