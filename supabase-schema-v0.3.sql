-- ====================================================================
-- Rafeeq Care MVP v0.3 - New Database Tables & RLS Security Policies
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nzppxhrbtgmxfuhfkgcm/sql/new
-- ====================================================================

-- 1. Helplines Directory Table
CREATE TABLE IF NOT EXISTS public.helplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('international', 'national', 'local')),
  phone TEXT NOT NULL,
  email TEXT,
  area TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Private Gratitude Entries Table
CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text TEXT NOT NULL,
  response TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Web Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ====================================================================
-- Enable Row Level Security (RLS)
-- ====================================================================

ALTER TABLE public.helplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- RLS Policies for Helplines Directory
-- Public read access for family members, authenticated write access.
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read access to helplines" ON public.helplines;
CREATE POLICY "Allow public read access to helplines"
  ON public.helplines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert helplines" ON public.helplines;
CREATE POLICY "Allow authenticated users to insert helplines"
  ON public.helplines FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow authenticated users to update helplines" ON public.helplines;
CREATE POLICY "Allow authenticated users to update helplines"
  ON public.helplines FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete helplines" ON public.helplines;
CREATE POLICY "Allow authenticated users to delete helplines"
  ON public.helplines FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- --------------------------------------------------------------------
-- RLS Policies for Private Gratitude Reflection
-- Family members can view and manage their own private entries.
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow family members to read their gratitude entries" ON public.gratitude_entries;
CREATE POLICY "Allow family members to read their gratitude entries"
  ON public.gratitude_entries FOR SELECT USING (auth.role() = 'authenticated' OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow family members to insert gratitude entries" ON public.gratitude_entries;
CREATE POLICY "Allow family members to insert gratitude entries"
  ON public.gratitude_entries FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Allow family members to delete gratitude entries" ON public.gratitude_entries;
CREATE POLICY "Allow family members to delete gratitude entries"
  ON public.gratitude_entries FOR DELETE USING (auth.uid() = created_by OR created_by IS NULL);

-- --------------------------------------------------------------------
-- RLS Policies for Push Subscriptions
-- --------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public insert to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public insert to push_subscriptions"
  ON public.push_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role read push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow service role read push_subscriptions"
  ON public.push_subscriptions FOR SELECT USING (true);
