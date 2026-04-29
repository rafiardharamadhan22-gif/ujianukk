-- SQL SETUP FOR SUPABASE
-- Run these scripts in your Supabase SQL Editor

-- 1. Profiles table to store additional user info
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT CHECK (role IN ('ADMIN', 'GURU', 'TENAGA_KEPENDIDIKAN', 'SISWA')),
    major TEXT,
    nisn TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Exams table (Grades)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC,
    status TEXT,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT,
    status TEXT CHECK (status IN ('HADIR', 'IZIN', 'SAKIT', 'ALFA')),
    location TEXT DEFAULT 'Tangerang Selatan',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Exams viewable by student and staff" ON public.exams FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'GURU'))
);

CREATE POLICY "Attendance viewable by everyone" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Users can create own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
