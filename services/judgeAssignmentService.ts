import { supabase } from './supabaseClient';
import { JudgeProjectAssignment, CreateJudgeAssignmentData, AssignmentResult, User, Project } from '../types';

/**
 * Service for managing judge-project assignments
 */
export class JudgeAssignmentService {
  
  /**
   * Get all assignments for a specific judge
   */
  static async getJudgeAssignments(judgeId: string): Promise<JudgeProjectAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('judge_assignments')
        .select(`
          *,
          judge:profiles!judge_id(id, name, email),
          project:projects!project_id(id, title, category, status, level, school),
          assignedByUser:profiles!assigned_by(id, name, email)
        `)
        .eq('judge_id', judgeId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(assignment => ({
        id: assignment.id,
        judgeId: assignment.judge_id,
        projectId: assignment.project_id,
        section: assignment.section,
        assignedBy: assignment.assigned_by,
        status: assignment.status,
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        judge: assignment.judge,
        project: assignment.project,
        assignedByUser: assignment.assignedByUser,
      })) || [];
    } catch (error) {
      console.error('Error fetching judge assignments:', error);
      throw error;
    }
  }

  /**
   * Get all assignments for a specific project
   */
  static async getProjectAssignments(projectId: string): Promise<JudgeProjectAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('judge_assignments')
        .select(`
          *,
          judge:profiles!judge_id(id, name, email, assignments),
          project:projects!project_id(id, title, category, status, level),
          assignedByUser:profiles!assigned_by(id, name, email)
        `)
        .eq('project_id', projectId)
        .eq('status', 'Active')
        .order('section', { ascending: true });

      if (error) throw error;

      return data?.map(assignment => ({
        id: assignment.id,
        judgeId: assignment.judge_id,
        projectId: assignment.project_id,
        section: assignment.section,
        assignedBy: assignment.assigned_by,
        status: assignment.status,
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        judge: assignment.judge,
        project: assignment.project,
        assignedByUser: assignment.assignedByUser,
      })) || [];
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      throw error;
    }
  }

  /**
   * Create a new judge assignment
   */
  static async createAssignment(assignmentData: CreateJudgeAssignmentData): Promise<AssignmentResult> {
    try {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('judge_assignments')
        .select('id')
        .eq('judge_id', assignmentData.judgeId)
        .eq('project_id', assignmentData.projectId)
        .eq('section', assignmentData.section)
        .eq('status', 'Active')
        .single();

      if (existingAssignment) {
        return {
          success: false,
          message: 'Judge is already assigned to this project for this section',
        };
      }

      // Create the assignment
      const { data, error } = await supabase
        .from('judge_assignments')
        .insert({
          judge_id: assignmentData.judgeId,
          project_id: assignmentData.projectId,
          section: assignmentData.section,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          notes: assignmentData.notes,
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Judge assigned successfully',
        assignmentId: data.id,
      };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create assignment',
      };
    }
  }

  /**
   * Remove a judge assignment
   */
  static async removeAssignment(assignmentId: string): Promise<AssignmentResult> {
    try {
      const { error } = await supabase
        .from('judge_assignments')
        .update({ status: 'Reassigned' })
        .eq('id', assignmentId);

      if (error) throw error;

      return {
        success: true,
        message: 'Assignment removed successfully',
      };
    } catch (error) {
      console.error('Error removing assignment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove assignment',
      };
    }
  }

  /**
   * Get available judges for a project (those eligible but not yet assigned)
   */
  static async getAvailableJudges(projectId: string, section: 'A' | 'BC'): Promise<User[]> {
    try {
      // First get the project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get all judges with the required category assignment
      const { data: allJudges, error: judgesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Judge')
        .eq('status', 'Active');

      if (judgesError) throw judgesError;

      // Get already assigned judges for this project and section
      const { data: assignedJudges, error: assignedError } = await supabase
        .from('judge_assignments')
        .select('judge_id')
        .eq('project_id', projectId)
        .eq('section', section)
        .eq('status', 'Active');

      if (assignedError) throw assignedError;

      const assignedJudgeIds = new Set(assignedJudges?.map(a => a.judge_id) || []);

      // Filter judges based on eligibility criteria
      const eligibleJudges = allJudges?.filter(judge => {
        // Skip if already assigned
        if (assignedJudgeIds.has(judge.id)) return false;

        // Skip if same school (conflict of interest)
        if (judge.school === project.school) return false;

        // Check if judge has assignment for this category and section
        const assignments = judge.assignments || [];
        const hasMatchingAssignment = assignments.some((assignment: any) => 
          assignment.category === project.category && assignment.section === section
        );
        if (!hasMatchingAssignment) return false;

        // Check geographic eligibility
        switch (project.level) {
          case 'Sub-County':
            return judge.assigned_sub_county === project.sub_county;
          case 'County':
            return judge.assigned_county === project.county;
          case 'Regional':
            return judge.assigned_region === project.region;
          case 'National':
            return judge.assigned_region === 'National' || !judge.assigned_region;
          default:
            return false;
        }
      }) || [];

      return eligibleJudges.map(judge => ({
        id: judge.id,
        name: judge.name,
        email: judge.email,
        role: judge.role,
        status: judge.status,
        forcePasswordChange: judge.force_password_change,
        idNumber: judge.id_number,
        tscNumber: judge.tsc_number,
        school: judge.school,
        teachingSubjects: judge.teaching_subjects,
        phoneNumber: judge.phone_number,
        assignments: judge.assignments,
        coordinatorCategory: judge.coordinator_category,
        assignedRegion: judge.assigned_region,
        assignedCounty: judge.assigned_county,
        assignedSubCounty: judge.assigned_sub_county,
      }));
    } catch (error) {
      console.error('Error getting available judges:', error);
      throw error;
    }
  }

  /**
   * Automatically assign judges to a project using the platform's rules
   */
  static async autoAssignJudges(projectId: string, section: 'A' | 'BC'): Promise<AssignmentResult[]> {
    try {
      const { data, error } = await supabase.rpc('auto_assign_judges_to_project', {
        target_project_id: projectId,
        assignment_section: section,
      });

      if (error) throw error;

      return data.map((result: any) => ({
        success: result.success,
        message: result.message,
        assignmentId: result.success ? result.assigned_judge_id : undefined,
      }));
    } catch (error) {
      console.error('Error auto-assigning judges:', error);
      return [{
        success: false,
        message: error instanceof Error ? error.message : 'Failed to auto-assign judges',
      }];
    }
  }

  /**
   * Get assignment statistics for admin dashboards
   */
  static async getAssignmentStats(): Promise<{
    totalAssignments: number;
    assignmentsBySection: { section: string; count: number }[];
    assignmentsByStatus: { status: string; count: number }[];
  }> {
    try {
      const { data: assignments, error } = await supabase
        .from('judge_assignments')
        .select('section, status');

      if (error) throw error;

      const totalAssignments = assignments?.length || 0;
      
      const assignmentsBySection = [
        { section: 'A', count: assignments?.filter(a => a.section === 'A').length || 0 },
        { section: 'BC', count: assignments?.filter(a => a.section === 'BC').length || 0 },
      ];

      const statusCounts = assignments?.reduce((acc: any, assignment) => {
        acc[assignment.status] = (acc[assignment.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const assignmentsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
      }));

      return {
        totalAssignments,
        assignmentsBySection,
        assignmentsByStatus,
      };
    } catch (error) {
      console.error('Error getting assignment stats:', error);
      return {
        totalAssignments: 0,
        assignmentsBySection: [],
        assignmentsByStatus: [],
      };
    }
  }

  /**
   * Bulk assign multiple judges to multiple projects
   */
  static async bulkAssign(assignments: CreateJudgeAssignmentData[]): Promise<AssignmentResult[]> {
    const results: AssignmentResult[] = [];

    for (const assignment of assignments) {
      const result = await this.createAssignment(assignment);
      results.push(result);
    }

    return results;
  }
}

export default JudgeAssignmentService;