-- ============================================================
-- Veterinary Medical Records System (idempotent / safe to re-run)
-- Uses ALTER TABLE ... ADD COLUMN IF NOT EXISTS for any
-- pre-existing tables to safely add missing columns.
-- ============================================================

-- ── FARMERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL DEFAULT '',
    phone_number TEXT,
    village TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all expected columns exist (safe if already present)
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS full_name    TEXT NOT NULL DEFAULT '';
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS village      TEXT;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS notes        TEXT;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'farmers' AND policyname = 'Admins can manage farmers'
  ) THEN
    CREATE POLICY "Admins can manage farmers"
      ON public.farmers FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS farmers_full_name_idx  ON public.farmers (full_name);
CREATE INDEX IF NOT EXISTS farmers_created_at_idx ON public.farmers (created_at DESC);

-- ── LIVESTOCK ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.livestock (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id    UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    species      TEXT NOT NULL DEFAULT 'Other',
    breed        TEXT,
    identifier   TEXT,
    gender       TEXT,
    date_of_birth DATE,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS farmer_id    UUID REFERENCES public.farmers(id) ON DELETE CASCADE;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS species      TEXT NOT NULL DEFAULT 'Other';
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS breed        TEXT;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS identifier   TEXT;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS gender       TEXT;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS notes        TEXT;
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.livestock ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'livestock' AND policyname = 'Admins can manage livestock'
  ) THEN
    CREATE POLICY "Admins can manage livestock"
      ON public.livestock FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS livestock_farmer_id_idx   ON public.livestock (farmer_id);
CREATE INDEX IF NOT EXISTS livestock_species_idx     ON public.livestock (species);
CREATE INDEX IF NOT EXISTS livestock_created_at_idx  ON public.livestock (created_at DESC);

-- ── MEDICAL_RECORDS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livestock_id    UUID NOT NULL REFERENCES public.livestock(id) ON DELETE CASCADE,
    visit_date      TIMESTAMPTZ NOT NULL DEFAULT now(),
    symptoms        TEXT NOT NULL DEFAULT '',
    diagnosis       TEXT NOT NULL DEFAULT '',
    treatment_given TEXT NOT NULL DEFAULT '',
    medications_used TEXT,
    cost            NUMERIC(10, 2),
    next_visit_date DATE,
    vet_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vet_name        TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS livestock_id     UUID REFERENCES public.livestock(id) ON DELETE CASCADE;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS visit_date       TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS symptoms         TEXT NOT NULL DEFAULT '';
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS diagnosis        TEXT NOT NULL DEFAULT '';
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS treatment_given  TEXT NOT NULL DEFAULT '';
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS medications_used TEXT;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS cost             NUMERIC(10, 2);
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS next_visit_date  DATE;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS vet_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS vet_name         TEXT;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS notes            TEXT;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'medical_records' AND policyname = 'Admins can manage medical records'
  ) THEN
    CREATE POLICY "Admins can manage medical records"
      ON public.medical_records FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS medical_records_livestock_id_idx ON public.medical_records (livestock_id);
CREATE INDEX IF NOT EXISTS medical_records_visit_date_idx   ON public.medical_records (visit_date DESC);
CREATE INDEX IF NOT EXISTS medical_records_vet_id_idx       ON public.medical_records (vet_id);

-- ── AUTO-UPDATE updated_at TRIGGER ───────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_farmers_updated_at') THEN
    CREATE TRIGGER update_farmers_updated_at
      BEFORE UPDATE ON public.farmers
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_livestock_updated_at') THEN
    CREATE TRIGGER update_livestock_updated_at
      BEFORE UPDATE ON public.livestock
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medical_records_updated_at') THEN
    CREATE TRIGGER update_medical_records_updated_at
      BEFORE UPDATE ON public.medical_records
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ── REALTIME ─────────────────────────────────────────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.farmers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
