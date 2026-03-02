-- Add bio, specialization, experience_years, and avatar_url to profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the validation trigger if it exists (optional but good practice)
CREATE OR REPLACE FUNCTION public.validate_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.full_name IS NOT NULL THEN
    NEW.full_name := trim(NEW.full_name);
    IF length(NEW.full_name) > 200 THEN
      NEW.full_name := substring(NEW.full_name, 1, 200);
    END IF;
    IF length(NEW.full_name) = 0 THEN
      NEW.full_name := NULL;
    END IF;
  END IF;

  IF NEW.specialization IS NOT NULL THEN
    NEW.specialization := trim(NEW.specialization);
    IF length(NEW.specialization) > 100 THEN
      NEW.specialization := substring(NEW.specialization, 1, 100);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
