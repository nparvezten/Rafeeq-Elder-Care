-- ==============================================================================
-- Rafeeq Care MVP - Database Schema (v0.4 Migration)
-- Features Added:
-- 1. Bedside Care Routine & Shift Handover Logs (care_routine_logs)
-- 2. Consumable Care Supplies (care_supplies)
-- 3. Medical Equipment Rentals (equipment_rentals)
-- 4. Home Rehab Specialists (rehab_specialists)
-- 5. Rehab Session Logs (rehab_sessions)
-- ==============================================================================

-- 1. Bedside Care Routine & Shift Handover Logs Table
CREATE TABLE IF NOT EXISTS public.care_routine_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    position TEXT,
    performed_by TEXT NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for care_routine_logs
ALTER TABLE public.care_routine_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read bedside care activity logs
CREATE POLICY "Allow public read access on care_routine_logs"
    ON public.care_routine_logs
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert bedside care activity logs
CREATE POLICY "Allow authenticated insert on care_routine_logs"
    ON public.care_routine_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);


-- 2. Consumable Care Supplies Table
CREATE TABLE IF NOT EXISTS public.care_supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pieces',
    threshold INTEGER NOT NULL DEFAULT 5,
    brand TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for care_supplies
ALTER TABLE public.care_supplies ENABLE ROW LEVEL SECURITY;

-- Allow public read access on care_supplies
CREATE POLICY "Allow public read access on care_supplies"
    ON public.care_supplies
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update care_supplies
CREATE POLICY "Allow authenticated insert on care_supplies"
    ON public.care_supplies
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on care_supplies"
    ON public.care_supplies
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 3. Medical Equipment Rentals Table
CREATE TABLE IF NOT EXISTS public.equipment_rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_name TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    vendor_phone TEXT NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    renewal_due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for equipment_rentals
ALTER TABLE public.equipment_rentals ENABLE ROW LEVEL SECURITY;

-- Allow public read access on equipment_rentals
CREATE POLICY "Allow public read access on equipment_rentals"
    ON public.equipment_rentals
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update equipment_rentals
CREATE POLICY "Allow authenticated insert on equipment_rentals"
    ON public.equipment_rentals
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on equipment_rentals"
    ON public.equipment_rentals
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 4. Home Rehab Specialists Table
CREATE TABLE IF NOT EXISTS public.rehab_specialists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT NOT NULL,
    schedule_frequency TEXT NOT NULL,
    fee_per_visit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    clinic_or_agency TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for rehab_specialists
ALTER TABLE public.rehab_specialists ENABLE ROW LEVEL SECURITY;

-- Allow public read access on rehab_specialists
CREATE POLICY "Allow public read access on rehab_specialists"
    ON public.rehab_specialists
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update rehab_specialists
CREATE POLICY "Allow authenticated insert on rehab_specialists"
    ON public.rehab_specialists
    FOR INSERT
    TO authenticated
    WITH CHECK (true);


-- 5. Rehab Session Logs Table
CREATE TABLE IF NOT EXISTS public.rehab_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID REFERENCES public.rehab_specialists(id) ON DELETE SET NULL,
    specialist_name TEXT NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    exercises_summary TEXT NOT NULL,
    fee_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    caregiver_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for rehab_sessions
ALTER TABLE public.rehab_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access on rehab_sessions
CREATE POLICY "Allow public read access on rehab_sessions"
    ON public.rehab_sessions
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert on rehab_sessions
CREATE POLICY "Allow authenticated insert on rehab_sessions"
    ON public.rehab_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
