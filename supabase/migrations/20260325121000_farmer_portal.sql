-- ============================================================
-- Farmer Portal Access & RLS
-- Allows users to sign up and view their own records by matching
-- their auth.email() with the farmers.email column.
-- ============================================================

-- 1. Add email field to farmers table
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS farmers_email_idx ON public.farmers(email);

-- 2. Update RLS for farmers table
-- Admins still have full access, but regular users can READ only their row
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'farmers' AND policyname = 'Farmers can view own profile'
  ) THEN
    CREATE POLICY "Farmers can view own profile"
      ON public.farmers FOR SELECT
      USING (email = (auth.jwt() ->> 'email'::text));
  END IF;
END $$;

-- 3. Update RLS for livestock table
-- Users can READ livestock if the farmer_id links to a farmer row with their email
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'livestock' AND policyname = 'Farmers can view own livestock'
  ) THEN
    CREATE POLICY "Farmers can view own livestock"
      ON public.livestock FOR SELECT
      USING (
        farmer_id IN (
          SELECT id FROM public.farmers WHERE email = (auth.jwt() ->> 'email'::text)
        )
      );
  END IF;
END $$;

-- 4. Update RLS for medical_records table
-- Users can READ medical records if the livestock belongs to their farmer account
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Farmers can view own records'
  ) THEN
    CREATE POLICY "Farmers can view own records"
      ON public.medical_records FOR SELECT
      USING (
        livestock_id IN (
          SELECT id FROM public.livestock WHERE farmer_id IN (
            SELECT id FROM public.farmers WHERE email = (auth.jwt() ->> 'email'::text)
          )
        )
      );
  END IF;
END $$;
