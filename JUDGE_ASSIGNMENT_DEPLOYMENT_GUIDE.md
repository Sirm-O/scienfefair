# Judge Assignment System Deployment Guide

## Overview
This document provides step-by-step instructions to deploy the new judge assignment system that fixes the data disconnect between admin project assignments and judge access to assigned projects.

## Problem Solved
- **Before**: Judges were automatically assigned projects using a hash algorithm, ignoring admin assignments
- **After**: Judges only see projects specifically assigned to them by administrators

## Files Changed/Added

### New Files Created:
1. `judge-assignments-migration.sql` - Database migration script
2. `services/judgeAssignmentService.ts` - Service for managing assignments  
3. `components/shared/AssignJudgeToProjectModal.tsx` - Modal for assigning judges
4. `components/shared/ProjectAssignmentManagement.tsx` - Interface for managing project assignments

### Files Modified:
1. `types.ts` - Added new assignment types
2. `components/Dashboard.tsx` - Updated JudgeDashboard to use assignments
3. `components/national-admin/ProjectManagement.tsx` - Added assignment buttons
4. `components/regional-admin/ProjectManagement.tsx` - Added assignment buttons  
5. `components/county-admin/ProjectManagement.tsx` - Added assignment buttons
6. `components/subcounty-admin/ProjectManagement.tsx` - Added assignment buttons

## Deployment Steps

### Step 1: Database Migration
1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `judge-assignments-migration.sql`
4. Click **Run** to execute the migration
5. Verify the new `judge_assignments` table is created

### Step 2: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Test the System

#### For Administrators:
1. **Login as an admin** (National, Regional, County, or Sub-County Admin)
2. **Navigate to Projects** in the sidebar
3. **Find a project** with status "Judging" 
4. **Click "Assign Judges"** button next to any project
5. **Assign judges** to Section A and/or Section BC:
   - Click "Assign Judge" for either section
   - Select an eligible judge from the dropdown
   - Add optional notes
   - Click "Assign Judge" or "Auto-Assign"

#### For Judges:
1. **Login as a judge** that has been assigned projects
2. **Judge Dashboard** should now show:
   - Loading state while fetching assignments
   - Category buttons with project counts (green badges)
   - Only assigned projects for each category/section
   - Clear messaging if no projects are assigned

### Step 4: Verify the Fix Works

#### Test Scenarios:
1. **Admin assigns project to judge** → Judge should see that project
2. **Admin removes assignment** → Judge should no longer see the project  
3. **Judge with no assignments** → Should see "No Project Assignments" message
4. **Judge switches categories** → Should only see projects for that category/section
5. **Auto-assignment** → Should automatically assign eligible judges

## Key Features

### For Administrators:
- **Visual assignment management** - See all judge assignments per project
- **Eligible judge filtering** - Only shows judges who can judge specific projects
- **Conflict prevention** - Prevents assigning judges from same school
- **Geographic compliance** - Respects judge regional assignments
- **Auto-assignment option** - Automatically assigns based on platform rules
- **Assignment notes** - Add context to assignments

### For Judges:
- **Real assignments** - Only see specifically assigned projects
- **Assignment counts** - Green badges show number of assigned projects
- **Category switching** - Toggle between different assignment categories
- **Clear status messages** - Know exactly why no projects are showing
- **Loading indicators** - Proper feedback during data fetching

## Database Schema

### New `judge_assignments` Table:
```sql
- id (UUID, Primary Key)
- judge_id (UUID, References profiles.id)  
- project_id (UUID, References projects.id)
- section ('A' or 'BC')
- assigned_by (UUID, References profiles.id)
- status ('Active', 'Completed', 'Reassigned') 
- notes (TEXT, Optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### New Functions:
- `auto_assign_judges_to_project()` - Bulk assignment based on rules
- `get_judge_assigned_projects()` - Get assignments for a judge

## API Endpoints (Service Methods)

### JudgeAssignmentService:
- `getJudgeAssignments(judgeId)` - Get all assignments for a judge
- `getProjectAssignments(projectId)` - Get all judges assigned to a project
- `createAssignment(assignmentData)` - Assign a judge to a project
- `removeAssignment(assignmentId)` - Remove an assignment
- `getAvailableJudges(projectId, section)` - Get eligible judges for assignment
- `autoAssignJudges(projectId, section)` - Auto-assign judges using rules
- `getAssignmentStats()` - Get assignment statistics for dashboards

## Troubleshooting

### If judges still don't see projects:
1. **Check database migration** - Ensure `judge_assignments` table exists
2. **Verify assignments exist** - Check assignments were created in admin interface  
3. **Check judge categories** - Ensure judge has matching category assignments
4. **Check geographic scope** - Verify judge's assigned region/county matches project
5. **Check project status** - Only 'Judging' status projects are shown
6. **Check browser console** - Look for any JavaScript errors

### If assignment interface doesn't load:
1. **Check imports** - Ensure all new components are properly imported
2. **Check file paths** - Verify all file paths are correct
3. **Check permissions** - Ensure user has admin role
4. **Restart dev server** - Sometimes needed after adding new files

### Common Error Messages:
- **"No eligible judges available"** - No judges match the category/geographic requirements
- **"Judge is already assigned"** - Trying to assign same judge twice
- **"Failed to load assignments"** - Database connection or permission issue

## Migration Notes

### Existing System Compatibility:
- **Judge category assignments** (assignments field) remain unchanged
- **Project filtering** logic is preserved but now used for eligibility checking
- **Admin interfaces** are enhanced, not replaced
- **Backward compatibility** - System works even if no assignments exist yet

### Data Migration:
- **No automatic migration** of existing judge-project relationships
- **Admins must manually assign** judges to projects after deployment
- **Old hash-based assignment** is completely removed
- **Fresh start** approach ensures clean, admin-controlled assignments

## Success Metrics

✅ **Admin Assignment Interface**
- Admins can see all project assignments
- Can assign/remove judges easily  
- Auto-assignment works correctly
- Assignment counts are accurate

✅ **Judge Dashboard Experience**  
- Judges see only assigned projects
- Clear messaging when no assignments
- Project counts display correctly
- Loading states work properly

✅ **Data Integrity**
- No conflicts of interest (same school)
- Geographic assignments respected
- Category assignments enforced
- Assignment status tracking works

## Next Steps

1. **Train administrators** on new assignment interface
2. **Assign judges to existing projects** in 'Judging' status
3. **Monitor assignment statistics** in admin dashboards
4. **Gather feedback** from judges and administrators
5. **Consider enhancements** like bulk assignment tools

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database migration completed
3. Ensure proper user roles and permissions
4. Contact technical support with specific error messages

---
*This deployment guide ensures a smooth transition from the old automatic assignment system to the new admin-controlled assignment system.*