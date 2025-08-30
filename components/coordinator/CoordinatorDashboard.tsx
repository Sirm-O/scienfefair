import React, { useMemo, useState } from 'react';
import { Project, User } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import ProjectDetailsModal from '../shared/ProjectDetailsModal';

// A card for each conflict project
const ConflictProjectCard: React.FC<{ project: Project; onResolve: (project: Project) => void; }> = ({ project, onResolve }) => {
    const conflictType = project.conflict?.type === 'School' ? 'School Conflict' : 'Score Discrepancy';
    const conflictColor = project.conflict?.type === 'School' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                 <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{project.category}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${conflictColor}`}>
                        {conflictType}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400"><strong>School:</strong> {project.school}</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {project.conflict?.type === 'School' 
                        ? "This project is from a judge's school and requires your impartial review."
                        : "The scores from the initial judges have a large discrepancy. Your evaluation is needed to resolve it."
                    }
                 </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-end">
                <button 
                    onClick={() => onResolve(project)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Review & Judge
                </button>
            </div>
        </div>
    );
};

const CoordinatorDashboard: React.FC<{ user: User }> = ({ user }) => {
    const { projects } = useProjects();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const conflictProjects = useMemo(() => {
        return projects.filter(p => 
            p.status === 'Conflict' &&
            (p.conflict?.coordinatorId === user.id || (p.category === user.coordinatorCategory && !p.conflict?.coordinatorId))
        );
    }, [projects, user]);
    
    // Clicking 'Review & Judge' would ideally open a full scorecard.
    // For this mock-up, we will open the project details modal.
    const handleResolveClick = (project: Project) => {
        setSelectedProject(project);
    };

    const handleCloseModal = () => {
        setSelectedProject(null);
    };

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Coordinator Dashboard</h2>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Review projects with conflicts for the <span className="font-semibold">{user.coordinatorCategory}</span> category.
                </p>
            </div>

            {conflictProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conflictProjects.map(project => (
                        <ConflictProjectCard key={project.id} project={project} onResolve={handleResolveClick} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">All Clear!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">There are no projects requiring conflict resolution at this time.</p>
                </div>
            )}

            {selectedProject && (
                // This modal would ideally be a Scorecard modal for the coordinator.
                // Using ProjectDetailsModal as a placeholder to show the project info.
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={handleCloseModal}
                />
            )}
        </main>
    );
};

export default CoordinatorDashboard;
