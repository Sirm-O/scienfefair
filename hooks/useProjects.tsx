
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
      const { data, error: dbError } = await supabase.from('projects').select('*');
      if (dbError) {
        console.error('Error fetching projects:', dbError.message);
        if (dbError.message.includes("schema cache") || dbError.message.includes("does not exist")) {
             setError("Database connection error: The 'projects' table was not found. Please ensure the database has been set up correctly by running the provided SQL script in your Supabase project.");
        } else {
            setError(`Failed to fetch projects: ${dbError.message}`);
        }
      } else {
        setProjects(data as Project[]);
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

    const { data, error } = await supabase
      .from('projects')
      .insert(newProjectData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error("A project with a similar registration number already exists. Please try again.");
      }
      throw error;
    }
    
    // Supabase returns snake_case, we need to map to camelCase for our app type
    return { ...data, subCounty: data.sub_county, regNo: data.reg_no, patronId: data.patron_id } as Project;
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