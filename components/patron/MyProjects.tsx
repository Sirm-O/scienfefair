

import React, { useState, useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { User, Project } from '../../types';
import ProjectCard from './ProjectCard';
import RegisterProjectModal from './RegisterProjectModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import DetailedProjectReportModal from '../shared/DetailedProjectReportModal';
import { getJudgingProgressForAllProjects } from '../../utils/mockScores';
import ProjectDetailsModal from '../shared/ProjectDetailsModal';

interface MyProjectsProps {
    user: User;
}

const MyProjects: React.FC<MyProjectsProps> = ({ user }) => {
    const { projects: allProjects, removeProject } = useProjects();
    
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [removingProject, setRemovingProject] = useState<Project | null>(null);
    const [viewingReportForProject, setViewingReportForProject] = useState<Project | null>(null);
    const [viewingDetailsForProject, setViewingDetailsForProject] = useState<Project | null>(null);

    
    const patronProjects = useMemo(() => {
        return allProjects.filter(p => p.patronId === user.id);
    }, [allProjects, user.id]);

    const judgingProgress = useMemo(() => getJudgingProgressForAllProjects(allProjects), [allProjects]);

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setRegisterModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setRegisterModalOpen(false);
        setEditingProject(null);
    };

    const handleCardClick = (project: Project) => {
        if (project.status === 'Completed') {
            setViewingReportForProject(project);
        } else {
            setViewingDetailsForProject(project);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Projects</h2>
                <button 
                    onClick={() => setRegisterModalOpen(true)}
                    className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    + Register New Project
                </button>
            </div>

            {patronProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {patronProjects.map(project => (
                        <ProjectCard 
                            key={project.id}
                            project={project}
                            onEdit={() => handleEdit(project)}
                            onRemove={() => setRemovingProject(project)}
                            onViewReport={() => setViewingReportForProject(project)}
                            judgingProgress={judgingProgress[project.id]}
                            onClick={() => handleCardClick(project)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg mt-6">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Projects Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click "Register New Project" to get started.</p>
                </div>
            )}
            
            {(isRegisterModalOpen || editingProject) && (
                <RegisterProjectModal
                    isOpen={isRegisterModalOpen || !!editingProject}
                    onClose={handleCloseModal}
                    patronUser={user}
                    projectToEdit={editingProject}
                />
            )}

            {removingProject && (
                <ConfirmationModal 
                    title="Remove Project"
                    message={`Are you sure you want to remove the project "${removingProject.title}"? This cannot be undone.`}
                    onConfirm={async () => {
                        await removeProject(removingProject.id);
                        setRemovingProject(null);
                    }}
                    onCancel={() => setRemovingProject(null)}
                />
            )}
            
            {viewingReportForProject && (
                <DetailedProjectReportModal 
                    project={viewingReportForProject}
                    onClose={() => setViewingReportForProject(null)}
                />
            )}

            {viewingDetailsForProject && (
                <ProjectDetailsModal
                    project={viewingDetailsForProject}
                    onClose={() => setViewingDetailsForProject(null)}
                />
            )}
        </div>
    );
};

export default MyProjects;
