-- ==============================================================================
-- SPACE CLUB MISSION CONTROL DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS) POLICIES
-- Target: PostgreSQL / Supabase
-- ==============================================================================

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Core Domains Table
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color_code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Pre-seed Core Domains (Cassette Futurism Palette: #3A6B5C, #D95D24, #E29526)
INSERT INTO public.domains (name, color_code, description)
VALUES 
    ('Robotics', '#3A6B5C', 'Autonomous rovers, LIDAR SLAM, micro-controller firmware, and robotic manipulators.'),
    ('Rocketry', '#D95D24', 'Solid & liquid propulsion, supersonic aerodynamics, avionics, and recovery systems.'),
    ('Astronautics', '#E29526', 'CubeSats, orbital dynamics, ground station communication, and space science payloads.')
ON CONFLICT (name) DO NOTHING;

-- 2. Create User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    student_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    role_title TEXT DEFAULT 'Domain Specialist',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Member Domains Junction Table
CREATE TABLE IF NOT EXISTS public.member_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_member_domain UNIQUE (member_id, domain_id)
);

-- 4. Create Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
    absence_category TEXT CHECK (absence_category IN ('Holiday', 'Exams', 'Emergency', 'Other')),
    absence_reason_note TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_member_domain_date UNIQUE (member_id, domain_id, attendance_date),
    CONSTRAINT check_absence_category_required CHECK (
        (status = 'Present' AND absence_category IS NULL) OR
        (status = 'Absent' AND absence_category IS NOT NULL)
    )
);

-- 5. Create Domain Work Packages / Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create Task Assignees Junction Table
CREATE TABLE IF NOT EXISTS public.task_assignees (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (task_id, member_id)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON public.attendance_records(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_domain ON public.attendance_records(domain_id);
CREATE INDEX IF NOT EXISTS idx_tasks_domain ON public.tasks(domain_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_member_domains_member ON public.member_domains(member_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER FOR AUTH.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, student_id, email, role, role_title)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Space Club Recruit'),
        COALESCE(new.raw_user_meta_data->>'student_id', 'SC-' || substring(new.id::text from 1 for 6)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'member'),
        COALESCE(new.raw_user_meta_data->>'role_title', 'Domain Specialist')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==============================================================================

-- Check if current authenticated user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if authenticated user is assigned to a specific task
CREATE OR REPLACE FUNCTION public.is_task_assignee(check_task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.task_assignees
        WHERE task_id = check_task_id AND member_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- ENABLE RLS ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. Domains Table Policies
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view domains
CREATE POLICY "Allow authenticated read on domains"
    ON public.domains FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can modify domains
CREATE POLICY "Allow admin full write on domains"
    ON public.domains FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. Profiles Table Policies
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view profiles
CREATE POLICY "Allow authenticated read on profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own personal profile
CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can insert, update, or delete any profile
CREATE POLICY "Allow admin all access on profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. Member Domains Junction Policies
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view member domain assignments
CREATE POLICY "Allow authenticated read on member_domains"
    ON public.member_domains FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can allocate or remove member domains
CREATE POLICY "Allow admin full write on member_domains"
    ON public.member_domains FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Attendance Records Table Policies
-- ------------------------------------------------------------------------------
-- All club members can read attendance records (powers dashboard and progress graph)
CREATE POLICY "Allow authenticated read on attendance_records"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can record, update, or delete attendance records
CREATE POLICY "Allow admin insert on attendance_records"
    ON public.attendance_records FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update on attendance_records"
    ON public.attendance_records FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete on attendance_records"
    ON public.attendance_records FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. Tasks Table Policies
-- ------------------------------------------------------------------------------
-- Everyone authenticated can view tasks
CREATE POLICY "Allow authenticated read on tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (true);

-- Admins can create and delete tasks
CREATE POLICY "Allow admin insert on tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin delete on tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Admins have full update permissions on tasks
CREATE POLICY "Allow admin update on tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Assigned members can ONLY update the status of tasks assigned specifically to them
CREATE POLICY "Allow assigned members to update task status"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (public.is_task_assignee(id))
    WITH CHECK (public.is_task_assignee(id));

-- ------------------------------------------------------------------------------
-- 6. Task Assignees Junction Policies
-- ------------------------------------------------------------------------------
-- Everyone can view task assignees
CREATE POLICY "Allow authenticated read on task_assignees"
    ON public.task_assignees FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can assign or unassign members from tasks
CREATE POLICY "Allow admin full write on task_assignees"
    ON public.task_assignees FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
