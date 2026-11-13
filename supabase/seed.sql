-- ==============================================================================
-- SPACE CLUB MISSION CONTROL SEED DATA
-- Pre-populates:
-- - 3 Technical Domains
-- - 1 Admin Profile + 9 Member Profiles
-- - Member Domain Junctions
-- - 14 Days of Daily Attendance Logs with Absence Reasoning
-- - 6 Active Domain Tasks with Assignees and Deadlines
-- ==============================================================================

-- 1. SEED DOMAINS (NASA-punk Cassette Futurism Palette: #3A6B5C, #D95D24, #E29526)
INSERT INTO public.domains (id, name, color_code, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Robotics', '#3A6B5C', 'Autonomous planetary rovers, LIDAR SLAM navigation, and robotic arm manipulators.'),
    ('22222222-2222-2222-2222-222222222222', 'Rocketry', '#D95D24', 'Solid/liquid propulsion, dual-deployment avionics, and composite airframe engineering.'),
    ('33333333-3333-3333-3333-333333333333', 'Astronautics', '#E29526', 'CubeSat nanosatellite bus design, ADCS magnetorquer detumbling, and SDR ground station tracking.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    color_code = EXCLUDED.color_code, 
    description = EXCLUDED.description;

-- 2. SEED PROFILES (1 Admin + 9 Members)
-- Note: When using Supabase Auth in production, create these users in auth.users first, or insert into profiles directly for development.
INSERT INTO public.profiles (id, full_name, student_id, email, role, role_title)
VALUES
    -- Admin (Commander)
    ('a0000000-0000-0000-0000-000000000001', 'Elena Rostova', 'SC-2024-001', 'elena.rostova@spaceclub.org', 'admin', 'Mission Commander & Chief Flight Systems Engineer'),
    -- Member 1 (Robotics Lead)
    ('a0000000-0000-0000-0000-000000000002', 'Marcus Chen', 'SC-2024-002', 'marcus.chen@spaceclub.org', 'member', 'Autonomy & Computer Vision Lead'),
    -- Member 2 (Rocketry Lead)
    ('a0000000-0000-0000-0000-000000000003', 'Aisha Al-Mansoor', 'SC-2024-003', 'aisha.mansoor@spaceclub.org', 'member', 'Propulsion & Combustion Specialist'),
    -- Member 3 (Astronautics Lead)
    ('a0000000-0000-0000-0000-000000000004', 'Devon Vance', 'SC-2024-004', 'devon.vance@spaceclub.org', 'member', 'Ground Station Communications Lead'),
    -- Member 4 (Robotics)
    ('a0000000-0000-0000-0000-000000000005', 'Kavya Sharma', 'SC-2024-005', 'kavya.sharma@spaceclub.org', 'member', 'Embedded Firmware & ROS Developer'),
    -- Member 5 (Rocketry / Robotics Dual)
    ('a0000000-0000-0000-0000-000000000006', 'Liam O’Connor', 'SC-2024-006', 'liam.oconnor@spaceclub.org', 'member', 'Aerostructures & Mechanical CAD Engineer'),
    -- Member 6 (Astronautics)
    ('a0000000-0000-0000-0000-000000000007', 'Sophia Patel', 'SC-2024-007', 'sophia.patel@spaceclub.org', 'member', 'ADCS Magnetorquer & Orbit Analyst'),
    -- Member 7 (Rocketry)
    ('a0000000-0000-0000-0000-000000000008', 'Tariq Hassan', 'SC-2024-008', 'tariq.hassan@spaceclub.org', 'member', 'Static Test Stand Safety Officer'),
    -- Member 8 (Robotics)
    ('a0000000-0000-0000-0000-000000000009', 'Zoe Nakamura', 'SC-2024-009', 'zoe.nakamura@spaceclub.org', 'member', 'Rover Mobility & Suspension Engineer'),
    -- Member 9 (Astronautics)
    ('a0000000-0000-0000-0000-000000000010', 'Carlos Mendez', 'SC-2024-010', 'carlos.mendez@spaceclub.org', 'member', 'CubeSat Power Systems (EPS) Specialist')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    student_id = EXCLUDED.student_id,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    role_title = EXCLUDED.role_title;

-- 3. SEED MEMBER DOMAINS (Many-to-Many)
INSERT INTO public.member_domains (member_id, domain_id)
VALUES
    -- Elena Rostova: Rocketry & Astronautics
    ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
    ('a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333'),
    -- Marcus Chen: Robotics
    ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111'),
    -- Aisha Al-Mansoor: Rocketry
    ('a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222'),
    -- Devon Vance: Astronautics
    ('a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333'),
    -- Kavya Sharma: Robotics
    ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111'),
    -- Liam O’Connor: Rocketry & Robotics
    ('a0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222'),
    ('a0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111'),
    -- Sophia Patel: Astronautics
    ('a0000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333'),
    -- Tariq Hassan: Rocketry
    ('a0000000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222'),
    -- Zoe Nakamura: Robotics
    ('a0000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111'),
    -- Carlos Mendez: Astronautics
    ('a0000000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (member_id, domain_id) DO NOTHING;

-- 4. SEED 6 ACTIVE TASKS
INSERT INTO public.tasks (id, domain_id, title, description, deadline, priority, status, created_by)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111', -- Robotics
        'Stereo Vision & Depth SLAM Node Calibration',
        'Calibrate dual Intel RealSense D435i camera rig on the Mars Rover chassis and tune ROS 2 navigation point-cloud filters.',
        NOW() + INTERVAL '1 day 4 hours',
        'Critical',
        'In Progress',
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        '22222222-2222-2222-2222-222222222222', -- Rocketry
        'Static Hot-Fire Test Stand Pressure Transducers Wiring',
        'Assemble pressure transducer signal conditioning circuit and relay trigger safety interlock for M-class motor test bench.',
        NOW() + INTERVAL '6 hours', -- Due today! Urgent
        'Critical',
        'In Progress',
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        '33333333-3333-3333-3333-333333333333', -- Astronautics
        'CubeSat UHF Ground Station Yagi Antenna Tuning',
        'Measure VSWR and align the azimuth-elevation rotator on the engineering roof to track NOAA & amateur weather satellites.',
        NOW() + INTERVAL '3 days 6 hours',
        'High',
        'Pending',
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111', -- Robotics
        'Rover Rocker-Bogie CNC Machining & Anodization',
        'Finalize CNC toolpaths in Fusion 360 and mill suspension arms from 6061-T6 aluminum stock.',
        NOW() + INTERVAL '5 days',
        'Medium',
        'Pending',
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'b0000000-0000-0000-0000-000000000005',
        '22222222-2222-2222-2222-222222222222', -- Rocketry
        'Dual-Deployment Altimeter Barometric Chamber Pulse Test',
        'Perform vacuum chamber pulse testing on the Jolly Logic and Raven altimeters to verify black powder charge continuity.',
        NOW() - INTERVAL '1 day', -- Overdue! Red indicator
        'High',
        'In Progress',
        'a0000000-0000-0000-0000-000000000001'
    ),
    (
        'b0000000-0000-0000-0000-000000000006',
        '33333333-3333-3333-3333-333333333333', -- Astronautics
        'ADCS Magnetorquer Coil Current Simulation in MATLAB',
        'Verify 3-axis B-field detumbling algorithm in MATLAB against IGRF-13 geomagnetic field model.',
        NOW() + INTERVAL '7 days',
        'Low',
        'Completed',
        'a0000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. SEED TASK ASSIGNEES
INSERT INTO public.task_assignees (task_id, member_id)
VALUES
    -- Task 1: Marcus Chen & Kavya Sharma
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005'),
    -- Task 2: Elena Rostova & Aisha Al-Mansoor & Tariq Hassan
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008'),
    -- Task 3: Devon Vance & Sophia Patel
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007'),
    -- Task 4: Liam O’Connor & Zoe Nakamura
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000006'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000009'),
    -- Task 5: Tariq Hassan & Elena Rostova
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000008'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001'),
    -- Task 6: Sophia Patel & Carlos Mendez
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000010')
ON CONFLICT (task_id, member_id) DO NOTHING;

-- 6. SEED 14 DAYS OF ATTENDANCE LOGS (Past 14 Days)
-- Generates past 14 days of realistic logs with varied reasons for absences
DO $$
DECLARE
    curr_offset INTEGER;
    target_date DATE;
BEGIN
    FOR curr_offset IN 0..13 LOOP
        target_date := CURRENT_DATE - curr_offset;

        -- Member 1 (Elena - Rocketry & Astro): High attendance
        INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
        VALUES ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', target_date, 'Present', NULL, NULL)
        ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;

        -- Member 2 (Marcus - Robotics): Present except day 4 (Exams)
        IF curr_offset = 4 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', target_date, 'Absent', 'Exams', 'AI & Machine Learning Midterm Exam')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 3 (Aisha - Rocketry): Absent today & day 7 (Exams & Emergency)
        IF curr_offset = 0 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', target_date, 'Absent', 'Exams', 'Thermodynamics Final Paper')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSIF curr_offset = 7 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', target_date, 'Absent', 'Emergency', 'Dental emergency appointment')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 4 (Devon - Astronautics): Absent day 2 (Holiday)
        IF curr_offset = 2 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', target_date, 'Absent', 'Holiday', 'Approved family holiday travel')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 5 (Kavya - Robotics): Absent day 5 (Other)
        IF curr_offset = 5 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', target_date, 'Absent', 'Other', 'Attending IEEE Student Robotics Symposium')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 6 (Liam - Rocketry): Absent today (Emergency)
        IF curr_offset = 0 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', target_date, 'Absent', 'Emergency', 'Urgent family medical assistance')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 7 (Sophia - Astronautics): Absent day 3 (Exams)
        IF curr_offset = 3 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', target_date, 'Absent', 'Exams', 'Astrophysics seminar presentation & exam')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 8 (Tariq - Rocketry): Present
        INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
        VALUES ('a0000000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', target_date, 'Present', NULL, NULL)
        ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;

        -- Member 9 (Zoe - Robotics): Absent today (Holiday)
        IF curr_offset = 0 THEN
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', target_date, 'Absent', 'Holiday', 'Pre-scheduled annual leave')
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        ELSE
            INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
            VALUES ('a0000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', target_date, 'Present', NULL, NULL)
            ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;
        END IF;

        -- Member 10 (Carlos - Astronautics): Present
        INSERT INTO public.attendance_records (member_id, domain_id, attendance_date, status, absence_category, absence_reason_note)
        VALUES ('a0000000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333333', target_date, 'Present', NULL, NULL)
        ON CONFLICT (member_id, domain_id, attendance_date) DO NOTHING;

    END LOOP;
END $$;
