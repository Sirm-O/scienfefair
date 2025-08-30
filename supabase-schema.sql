-- KSEF Judging Platform Database Schema
-- Run this script in your Supabase SQL Editor to set up the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Patron (Advisor)',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    force_password_change BOOLEAN DEFAULT false,
    id_number VARCHAR(20),
    tsc_number VARCHAR(20),
    school VARCHAR(255),
    teaching_subjects TEXT[],
    phone_number VARCHAR(20),
    assignments JSONB,
    coordinator_category VARCHAR(100),
    assigned_region VARCHAR(100),
    assigned_county VARCHAR(100),
    assigned_sub_county VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table for project management
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patron_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    presenters TEXT[] NOT NULL DEFAULT '{}',
    school VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    county VARCHAR(100) NOT NULL,
    sub_county VARCHAR(100) NOT NULL,
    zone VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Qualified',
    level VARCHAR(20) NOT NULL DEFAULT 'Sub-County',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create scores table for storing judge scores
CREATE TABLE IF NOT EXISTS scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    judge_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    section VARCHAR(5) NOT NULL, -- 'A' or 'BC'
    scores JSONB NOT NULL DEFAULT '{}',
    feedback JSONB NOT NULL DEFAULT '{}',
    total_score_a DECIMAL(5,2) DEFAULT 0,
    total_score_b DECIMAL(5,2) DEFAULT 0,
    total_score_c DECIMAL(5,2) DEFAULT 0,
    final_total DECIMAL(5,2) DEFAULT 0,
    is_submitted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(project_id, judge_id, section)
);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Patron (Advisor)')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at_scores BEFORE UPDATE ON scores FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Patrons can create projects" ON projects;
DROP POLICY IF EXISTS "Patrons can update own projects" ON projects;
DROP POLICY IF EXISTS "Patrons can delete own projects" ON projects;
DROP POLICY IF EXISTS "Judges can manage scores" ON scores;
DROP POLICY IF EXISTS "Users can view scores" ON scores;

-- Profiles policies (Fixed to prevent infinite recursion)
-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow service role and authenticated users to view all profiles
-- This avoids the infinite recursion by using auth.jwt() instead of querying profiles table
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'role')::text IN ('Super Administrator', 'National Admin', 'Regional Admin', 'County Admin', 'Sub-County Admin') OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('Super Administrator', 'National Admin', 'Regional Admin', 'County Admin', 'Sub-County Admin')
);

-- Allow admins to insert/update/delete profiles
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'role')::text IN ('Super Administrator', 'National Admin', 'Regional Admin', 'County Admin', 'Sub-County Admin') OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('Super Administrator', 'National Admin', 'Regional Admin', 'County Admin', 'Sub-County Admin')
);

-- Projects policies (Simplified and safe)
-- Allow everyone to view projects
CREATE POLICY "projects_select_all" ON projects FOR SELECT USING (true);

-- Allow patrons to create projects (using auth metadata to avoid recursion)
CREATE POLICY "projects_insert_patrons" ON projects FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'Patron (Advisor)' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Patron (Advisor)' OR
    auth.role() = 'service_role'
);

-- Allow patrons to update their own projects
CREATE POLICY "projects_update_own" ON projects FOR UPDATE USING (
    patron_id = auth.uid() OR auth.role() = 'service_role'
);

-- Allow patrons to delete their own projects
CREATE POLICY "projects_delete_own" ON projects FOR DELETE USING (
    patron_id = auth.uid() OR auth.role() = 'service_role'
);

-- Scores policies (Simplified and safe)
-- Allow everyone to view scores
CREATE POLICY "scores_select_all" ON scores FOR SELECT USING (true);

-- Allow judges to manage scores (using auth metadata to avoid recursion)
CREATE POLICY "scores_judges_all" ON scores FOR ALL USING (
    (auth.jwt() ->> 'role')::text = 'Judge' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'Judge' OR
    auth.role() = 'service_role'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_patron_id ON projects(patron_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_level ON projects(level);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_scores_project_id ON scores(project_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge_id ON scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.projects TO anon, authenticated;
GRANT ALL ON public.scores TO anon, authenticated;