-- KSEF Platform: Fix Infinite Recursion in RLS Policies
-- Run this script in your Supabase SQL Editor to fix the infinite recursion issue

-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Patrons can create projects" ON projects;
DROP POLICY IF EXISTS "Patrons can update own projects" ON projects;
DROP POLICY IF EXISTS "Patrons can delete own projects" ON projects;
DROP POLICY IF EXISTS "Judges can manage scores" ON scores;
DROP POLICY IF EXISTS "Users can view scores" ON scores;

-- Also drop any policies with the new naming convention in case they exist
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "projects_select_all" ON projects;
DROP POLICY IF EXISTS "projects_insert_patrons" ON projects;
DROP POLICY IF EXISTS "projects_update_own" ON projects;
DROP POLICY IF EXISTS "projects_delete_own" ON projects;
DROP POLICY IF EXISTS "scores_select_all" ON scores;
DROP POLICY IF EXISTS "scores_judges_all" ON scores;

-- Create new, safe policies that avoid infinite recursion

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

-- Verify the policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'scores')
ORDER BY tablename, policyname;