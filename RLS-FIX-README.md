# Database RLS Policy Fix

## Problem
You're encountering this error:
```
Database Connection Error
Database connection failed
infinite recursion detected in policy for relation "profiles"
```

## Root Cause
This error occurs because the Row Level Security (RLS) policies on the `profiles` table create infinite recursion. The problematic policies try to query the `profiles` table to check user roles, but since RLS is enabled on `profiles`, they need to check the policies again, creating an infinite loop.

## Solution

### Step 1: Open Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your KSEF project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Click **New Query** in the SQL Editor
2. Copy and paste the entire contents of `fix-rls-policies.sql` file
3. Click **Run** to execute the script

### Step 3: Verify the Fix
1. The script will drop the problematic policies and create new, safe ones
2. Refresh your KSEF application
3. The error should be resolved

## What the Fix Does

The fix replaces problematic policies that query the `profiles` table with safe policies that use:
- `auth.jwt()` to read user metadata directly from the JWT token
- `auth.role()` to check the user's role without querying the database
- `auth.uid()` for user ID comparisons

## Prevention

To prevent this issue in the future:
1. Never create RLS policies that query the same table they're protecting
2. Use JWT metadata and auth functions instead of database queries in policies
3. Test policies thoroughly before deploying to production

## Files Modified
- `supabase-schema.sql` - Updated with fixed policies
- `fix-rls-policies.sql` - Standalone fix script
- App error handling - Enhanced to detect and explain this specific error

## Technical Details

### Before (Problematic):
```sql
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('Super Administrator', ...)
    )
);
```

### After (Fixed):
```sql
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
    auth.role() = 'service_role' OR
    (auth.jwt() ->> 'role')::text IN ('Super Administrator', ...) OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('Super Administrator', ...)
);
```

The key difference is using `auth.jwt()` instead of querying the `profiles` table, which breaks the recursion cycle.