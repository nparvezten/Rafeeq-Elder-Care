-- ====================================================================
-- Rafeeq Care MVP v0.2 - New Database Tables & RLS Security Policies
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nzppxhrbtgmxfuhfkgcm/sql/new
-- ====================================================================

-- 1. Respite Care Request Board Table
CREATE TABLE IF NOT EXISTS public.respite_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_range TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed')),
  claimed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Government Scheme / Low-Cost Diagnostic Directory Table
CREATE TABLE IF NOT EXISTS public.diagnostic_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('government', 'subsidized', 'low-cost-private')),
  area TEXT NOT NULL,
  services TEXT NOT NULL,
  contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ====================================================================
-- Enable Row Level Security (RLS)
-- ====================================================================

ALTER TABLE public.respite_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_centers ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- RLS Policies for Respite Requests Board
-- Plain English Rule: Public read access for family members, authenticated insert/update.
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read access to respite_requests" ON public.respite_requests;
CREATE POLICY "Allow public read access to respite_requests"
  ON public.respite_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert respite_requests" ON public.respite_requests;
CREATE POLICY "Allow authenticated users to insert respite_requests"
  ON public.respite_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow authenticated users to update respite_requests" ON public.respite_requests;
CREATE POLICY "Allow authenticated users to update respite_requests"
  ON public.respite_requests FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete respite_requests" ON public.respite_requests;
CREATE POLICY "Allow authenticated users to delete respite_requests"
  ON public.respite_requests FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- --------------------------------------------------------------------
-- RLS Policies for Diagnostic Centers Directory
-- Plain English Rule: Public read access for family members, authenticated insert/update.
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read access to diagnostic_centers" ON public.diagnostic_centers;
CREATE POLICY "Allow public read access to diagnostic_centers"
  ON public.diagnostic_centers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert diagnostic_centers" ON public.diagnostic_centers;
CREATE POLICY "Allow authenticated users to insert diagnostic_centers"
  ON public.diagnostic_centers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow authenticated users to update diagnostic_centers" ON public.diagnostic_centers;
CREATE POLICY "Allow authenticated users to update diagnostic_centers"
  ON public.diagnostic_centers FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete diagnostic_centers" ON public.diagnostic_centers;
CREATE POLICY "Allow authenticated users to delete diagnostic_centers"
  ON public.diagnostic_centers FOR DELETE TO authenticated USING (auth.role() = 'authenticated');
