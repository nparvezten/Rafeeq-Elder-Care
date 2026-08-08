-- ====================================================================
-- Rafeeq Care MVP - Supabase Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nzppxhrbtgmxfuhfkgcm/sql/new
-- ====================================================================

-- 1. Attendants Directory Table
CREATE TABLE IF NOT EXISTS public.attendants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('nurse', 'doctor', 'attendant', 'other')),
  area TEXT NOT NULL,
  contact_number TEXT,
  rate_info TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Shared Expense Tracker Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  paid_by TEXT NOT NULL,
  split_between TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ====================================================================
-- Enable Row Level Security (RLS)
-- ====================================================================

ALTER TABLE public.attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- RLS Policies for Attendants Directory
-- Plain English Rule: Anyone (anon and authenticated) can view attendant directory entries.
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read access to attendants" ON public.attendants;
DROP POLICY IF EXISTS "Allow authenticated users to read attendants" ON public.attendants;
CREATE POLICY "Allow public read access to attendants"
  ON public.attendants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert attendants" ON public.attendants;
CREATE POLICY "Allow authenticated users to insert attendants"
  ON public.attendants FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow authenticated users to update attendants" ON public.attendants;
CREATE POLICY "Allow authenticated users to update attendants"
  ON public.attendants FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete attendants" ON public.attendants;
CREATE POLICY "Allow authenticated users to delete attendants"
  ON public.attendants FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- --------------------------------------------------------------------
-- RLS Policies for Shared Expenses
-- Plain English Rule: Anyone (anon and authenticated) can view care expenses.
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read access to expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow authenticated users to read expenses" ON public.expenses;
CREATE POLICY "Allow public read access to expenses"
  ON public.expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert expenses" ON public.expenses;
CREATE POLICY "Allow authenticated users to insert expenses"
  ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow authenticated users to update expenses" ON public.expenses;
CREATE POLICY "Allow authenticated users to update expenses"
  ON public.expenses FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete expenses" ON public.expenses;
CREATE POLICY "Allow authenticated users to delete expenses"
  ON public.expenses FOR DELETE TO authenticated USING (auth.role() = 'authenticated');
