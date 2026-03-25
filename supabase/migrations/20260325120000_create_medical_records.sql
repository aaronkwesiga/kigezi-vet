-- ============================================================
-- Veterinary Medical Records System
-- Tables: farmers, livestock, medical_records
-- ============================================================

-- FARMERS table: Tracks livestock owners / clients
CREATE TABLE public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT,
    village TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage farmers"
  ON public.farmers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX farmers_full_name_idx ON public.farmers (full_name);
CREATE INDEX farmers_created_at_idx ON public.farmers (created_at DESC);

-- LIVESTOCK table: Tracks individual animals or flocks belonging to a farmer
CREATE TABLE public.livestock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    species TEXT NOT NULL,      -- e.g., Cattle, Goat, Sheep, Poultry, Pig, Dog, Cat
    breed TEXT,
    identifier TEXT,            -- Ear tag number, name, or any identifier
    gender TEXT,                -- Male, Female, N/A
    date_of_birth DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage livestock"
  ON public.livestock
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX livestock_farmer_id_idx ON public.livestock (farmer_id);
CREATE INDEX livestock_species_idx ON public.livestock (species);
CREATE INDEX livestock_created_at_idx ON public.livestock (created_at DESC);

-- MEDICAL_RECORDS table: Tracks treatments, diagnoses per visit
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livestock_id UUID NOT NULL REFERENCES public.livestock(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    symptoms TEXT NOT NULL DEFAULT '',
    diagnosis TEXT NOT NULL DEFAULT '',
    treatment_given TEXT NOT NULL DEFAULT '',
    medications_used TEXT,
    cost NUMERIC(10, 2),
    next_visit_date DATE,
    vet_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vet_name TEXT,              -- Stored directly in case user is later removed
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage medical records"
  ON public.medical_records
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX medical_records_livestock_id_idx ON public.medical_records (livestock_id);
CREATE INDEX medical_records_visit_date_idx ON public.medical_records (visit_date DESC);
CREATE INDEX medical_records_vet_id_idx ON public.medical_records (vet_id);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_livestock_updated_at
  BEFORE UPDATE ON public.livestock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates in the admin panel
ALTER PUBLICATION supabase_realtime ADD TABLE public.farmers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;
