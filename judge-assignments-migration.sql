-- Judge Assignments Migration Script
-- Run this script in your Supabase SQL Editor to add judge-project assignment functionality

-- Create judge_assignments table to track specific judge-project assignments
CREATE TABLE IF NOT EXISTS judge_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    judge_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    section VARCHAR(5) NOT NULL, -- 'A' or 'BC'
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who made the assignment
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Reassigned'
    notes TEXT, -- Optional notes from admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure each judge can only be assigned to a project once per section
    UNIQUE(judge_id, project_id, section)
);

-- Add updated_at trigger for judge_assignments
CREATE TRIGGER handle_updated_at_judge_assignments 
    BEFORE UPDATE ON judge_assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_judge_assignments_judge_id ON judge_assignments(judge_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_project_id ON judge_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_status ON judge_assignments(status);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_section ON judge_assignments(section);

-- Enable RLS on judge_assignments table
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for judge_assignments
-- Allow all authenticated users to view assignments (judges need to see their assignments)
CREATE POLICY "judge_assignments_select_all" ON judge_assignments 
    FOR SELECT USING (true);

-- Allow admins to manage assignments
CREATE POLICY "judge_assignments_admin_all" ON judge_assignments 
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.jwt() ->> 'role')::text IN ('Super Administrator', 'National Admin', 'Regional Admin', 'County Admin', 'Sub-County Admin') OR
        (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('Super Administrator', 'National Admin', 'Regional Admin', 'County Admin', 'Sub-County Admin')
    );

-- Grant permissions
GRANT ALL ON judge_assignments TO anon, authenticated;

-- Function to automatically assign judges to projects based on existing logic
-- This can be used by admins to bulk-assign judges or as a fallback
CREATE OR REPLACE FUNCTION auto_assign_judges_to_project(
    target_project_id UUID,
    assignment_section VARCHAR(5) DEFAULT 'A'
) RETURNS TABLE(
    assigned_judge_id UUID,
    judge_name TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    project_record projects;
    eligible_judges profiles[];
    selected_judge profiles;
    assignment_exists BOOLEAN;
BEGIN
    -- Get the project details
    SELECT * INTO project_record FROM projects WHERE id = target_project_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, 'Project not found'::TEXT, FALSE, 'Invalid project ID'::TEXT;
        RETURN;
    END IF;
    
    -- Find eligible judges for this project
    -- Judges must: have matching category assignment, be active, not from same school, match geographic scope
    FOR selected_judge IN 
        SELECT p.* FROM profiles p
        WHERE p.role = 'Judge' 
        AND p.status = 'Active'
        AND p.school != project_record.school  -- No conflict of interest
        AND jsonb_path_exists(
            p.assignments, 
            '$[*] ? (@.section == $section && @.category == $category)',
            jsonb_build_object('section', assignment_section, 'category', project_record.category)
        )
        AND (
            -- Geographic eligibility based on project level
            (project_record.level = 'Sub-County' AND p.assigned_sub_county = project_record.sub_county) OR
            (project_record.level = 'County' AND p.assigned_county = project_record.county) OR
            (project_record.level = 'Regional' AND p.assigned_region = project_record.region) OR
            (project_record.level = 'National' AND p.assigned_region = 'National') OR
            (project_record.level = 'National' AND p.assigned_region IS NULL)
        )
        ORDER BY p.created_at  -- First come, first served for fairness
        LIMIT 2  -- Assign up to 2 judges per section
    LOOP
        -- Check if assignment already exists
        SELECT EXISTS(
            SELECT 1 FROM judge_assignments 
            WHERE judge_id = selected_judge.id 
            AND project_id = target_project_id 
            AND section = assignment_section
            AND status = 'Active'
        ) INTO assignment_exists;
        
        IF NOT assignment_exists THEN
            -- Create the assignment
            INSERT INTO judge_assignments (judge_id, project_id, section, assigned_by, notes)
            VALUES (
                selected_judge.id, 
                target_project_id, 
                assignment_section, 
                auth.uid(),
                'Auto-assigned by system'
            );
            
            RETURN QUERY SELECT 
                selected_judge.id, 
                selected_judge.name, 
                TRUE, 
                'Successfully assigned'::TEXT;
        ELSE
            RETURN QUERY SELECT 
                selected_judge.id, 
                selected_judge.name, 
                FALSE, 
                'Already assigned'::TEXT;
        END IF;
    END LOOP;
    
    -- If no judges were found/assigned
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            'No eligible judges found'::TEXT, 
            FALSE, 
            'No judges available for this project and section'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assigned projects for a judge
CREATE OR REPLACE FUNCTION get_judge_assigned_projects(
    judge_user_id UUID DEFAULT auth.uid()
) RETURNS TABLE(
    project_id UUID,
    section VARCHAR(5),
    assignment_status VARCHAR(20),
    project_title TEXT,
    project_category TEXT,
    project_status TEXT,
    project_level TEXT,
    assignment_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ja.project_id,
        ja.section,
        ja.status,
        p.title,
        p.category,
        p.status,
        p.level,
        ja.notes
    FROM judge_assignments ja
    JOIN projects p ON ja.project_id = p.id
    WHERE ja.judge_id = judge_user_id
    AND ja.status = 'Active'
    ORDER BY ja.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample assignments if you want to test (OPTIONAL - remove if not needed)
-- This would assign existing judges to existing projects
-- INSERT INTO judge_assignments (judge_id, project_id, section, assigned_by, notes)
-- SELECT 
--     (SELECT id FROM profiles WHERE role = 'Judge' LIMIT 1),
--     (SELECT id FROM projects WHERE status = 'Judging' LIMIT 1),
--     'A',
--     (SELECT id FROM profiles WHERE role LIKE '%Admin%' LIMIT 1),
--     'Initial test assignment'
-- WHERE EXISTS(SELECT 1 FROM profiles WHERE role = 'Judge')
-- AND EXISTS(SELECT 1 FROM projects WHERE status = 'Judging')
-- ON CONFLICT DO NOTHING;

COMMENT ON TABLE judge_assignments IS 'Tracks specific assignments of judges to projects for evaluation';
COMMENT ON FUNCTION auto_assign_judges_to_project IS 'Automatically assigns eligible judges to a project based on platform rules';
COMMENT ON FUNCTION get_judge_assigned_projects IS 'Returns all active project assignments for a specific judge';