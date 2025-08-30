
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Project, NewProject } from '../types';
import { supabase } from '../services/supabaseClient';

interface ProjectContextType {
  projects: Project[];
  error: string | null;
  addProject: (projectData: NewProject) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchProjects = async () => {
      setError(null);
      
      try {
        const { data, error: dbError } = await supabase.from('projects').select('*');
        
        if (dbError) {
          console.error('Error fetching projects:', dbError);
          
          if (dbError.message.includes("relation \"projects\" does not exist")) {
            setError("Database setup incomplete: The 'projects' table doesn't exist. Please contact the administrator to set up the database tables.");
          } else if (dbError.message.includes("schema cache")) {
            setError("Database connection error: Schema cache issue. Please refresh the page or contact support.");
          } else {
            setError(`Failed to fetch projects: ${dbError.message}`);
          }
          return;
        }
        
        // Map all projects from snake_case to camelCase
        const mappedProjects: Project[] = (data || []).map(project => ({
          id: project.id,
          patronId: project.patron_id,
          title: project.title,
          category: project.category,
          regNo: project.reg_no,
          presenters: project.presenters || [],
          school: project.school,
          region: project.region,
          county: project.county,
          subCounty: project.sub_county,
          status: project.status,
          level: project.level,
          zone: project.zone,
        }));
        
        setProjects(mappedProjects);
      } catch (error) {
        console.error('Unexpected error fetching projects:', error);
        setError('An unexpected error occurred while loading projects. Please try refreshing the page.');
      }
    };
    
    fetchProjects();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        console.log('Project change received!', payload);
         if(payload.errors) {
            setError(`Realtime error: ${payload.errors[0]}`);
        } else {
            fetchProjects(); // Re-fetch all projects on any change for simplicity
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addProject = useCallback(async (projectData: NewProject): Promise<Project> => {
    setError(null);
    
    // Generate Reg No client-side for immediate feedback, DB will enforce uniqueness
    const projectCount = projects.length + 1; // Simple increment
    const countyCode = projectData.county.replace(/\s/g, '').slice(0, 3).toUpperCase();
    const regNo = `KSEF/${new Date().getFullYear()}/${countyCode}/${String(projectCount).padStart(4, '0')}`;

    const newProjectData = {
      patron_id: projectData.patronId,
      title: projectData.title.trim(),
      category: projectData.category,
      presenters: projectData.presenters,
      school: projectData.school.trim(),
      region: projectData.region,
      county: projectData.county,
      sub_county: projectData.subCounty,
      reg_no: regNo,
      status: 'Qualified',
      level: 'Sub-County',
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProjectData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        
        if (error.code === '23505') { // Unique constraint violation
          throw new Error("A project with a similar registration number already exists. Please try again.");
        }
        
        if (error.message.includes("relation \"projects\" does not exist")) {
          throw new Error("Database setup incomplete: The 'projects' table doesn't exist. Please contact the administrator to set up the database.");
        }
        
        throw new Error(`Failed to register project: ${error.message}`);
      }
      
      // Map snake_case response to camelCase for our app
      const newProject: Project = {
        id: data.id,
        patronId: data.patron_id,
        title: data.title,
        category: data.category,
        regNo: data.reg_no,
        presenters: data.presenters,
        school: data.school,
        region: data.region,
        county: data.county,
        subCounty: data.sub_county,
        status: data.status,
        level: data.level,
      };
      
      // Update local state immediately to show the new project
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      return newProject;
    } catch (error) {
      console.error('Project registration error:', error);
      throw error;
    }
  }, [projects]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<void> => {
    // Convert camelCase to snake_case for Supabase
    const updatesForDb: Record<string, any> = { ...updates };
    if (updates.subCounty) updatesForDb.sub_county = updates.subCounty;
    if (updates.regNo) updatesForDb.reg_no = updates.regNo;
    if (updates.patronId) updatesForDb.patron_id = updates.patronId;
    
    const { error } = await supabase
      .from('projects')
      .update(updatesForDb)
      .eq('id', projectId);

    if (error) throw error;
  }, []);

  const removeProject = useCallback(async (projectId: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, error, addProject, updateProject, removeProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};