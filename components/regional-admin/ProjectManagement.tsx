

import React, { useState, useMemo } from 'react';
import { Project } from '../../types';
import ProjectDetailsModal from '../shared/ProjectDetailsModal';
import { PROJECT_CATEGORIES } from '../../constants';
import { processProjects, getJudgingProgressForAllProjects, getRankingForAllProjects, JudgingProgress, PromotionStatus } from '../../utils/mockScores';
import DetailedProjectReportModal from '../shared/DetailedProjectReportModal';
import ProjectAssignmentManagement from '../shared/ProjectAssignmentManagement';

interface ProjectManagementProps {
    projects: Project[];
}

// FIX: Add local type for processed projects to include `effectiveStatus` and `effectiveLevel`.
type ProcessedProject = Project & { effectiveLevel: Project['level']; effectiveStatus: Project['status'] };

// FIX: Added 'Conflict' status to the color map to match the Project type.
const statusColorMap: Record<Project['status'], string> = {
    'Qualified': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Judging': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Conflict': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const PromotionStatusBadge: React.FC<{ status?: PromotionStatus }> = ({ status }) => {
    if (!status) return <span className="text-xs text-gray-400 dark:text-gray-500">--</span>;

    const colorMap: Record<PromotionStatus, string> = {
        'Promoted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700',
        'Not Promoted': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700',
        'Pending Ranking': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colorMap[status]}`}>
            {status}
        </span>
    );
};

const JudgingStatusProgress: React.FC<{ progress?: JudgingProgress }> = ({ progress }) => {
    if (!progress) return null;
    const percentage = progress.totalJudges > 0 ? (progress.judgesScored / progress.totalJudges) * 100 : 0;
    return (
        <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {progress.judgesScored}/{progress.totalJudges}
            </span>
        </div>
    );
};


const ProjectManagement: React.FC<ProjectManagementProps> = ({ projects }) => {
    const [viewingDetailsForProject, setViewingDetailsForProject] = useState<Project | null>(null);
    const [viewingReportForProject, setViewingReportForProject] = useState<Project | null>(null);
    const [managingAssignmentsForProject, setManagingAssignmentsForProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const processedProjects = useMemo(() => processProjects(projects), [projects]);
    const judgingProgress = useMemo(() => getJudgingProgressForAllProjects(processedProjects), [processedProjects]);
    const promotionStatus = useMemo(() => getRankingForAllProjects(processedProjects), [processedProjects]);

    const filteredProjects = useMemo(() => {
        return processedProjects.filter(project => {
            const categoryMatch = !categoryFilter || project.category === categoryFilter;
            const statusMatch = !statusFilter || project.effectiveStatus === statusFilter;

            if (!searchTerm) {
                return categoryMatch && statusMatch;
            }

            const lowercasedTerm = searchTerm.toLowerCase();
            const searchMatch =
                project.title.toLowerCase().includes(lowercasedTerm) ||
                project.school.toLowerCase().includes(lowercasedTerm) ||
                project.presenters.some(p => p.toLowerCase().includes(lowercasedTerm));

            return categoryMatch && statusMatch && searchMatch;
        });
    }, [processedProjects, searchTerm, categoryFilter, statusFilter]);

    // FIX: Updated `project` type to `ProcessedProject` to allow access to `effectiveStatus`.
    const handleViewClick = (project: ProcessedProject) => {
        if (project.effectiveStatus === 'Completed') {
            setViewingReportForProject(project);
        } else {
            setViewingDetailsForProject(project);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Regional Project Management</h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
                A list of all projects originating from this region.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-grow min-w-[300px]">
                    <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                    <input
                        id="searchFilter"
                        type="text"
                        placeholder="By title, school, or presenter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category</label>
                    <select
                        id="categoryFilter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {PROJECT_CATEGORIES.sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Judging">Judging</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Project</th>
                            <th scope="col" className="py-3 px-6">Lifecycle Status</th>
                            <th scope="col" className="py-3 px-6">Judging Progress</th>
                            <th scope="col" className="py-3 px-6">Promotion Status</th>
                            <th scope="col" className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                 <td className="py-4 px-6">
                                    <p className="font-medium text-gray-900 dark:text-white">{project.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{project.school} - {project.county}</p>
                                </td>
                                <td className="py-4 px-6">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${statusColorMap[project.effectiveStatus]}`}>
                                        {project.effectiveStatus}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <JudgingStatusProgress progress={judgingProgress[project.id]} />
                                </td>
                                <td className="py-4 px-6">
                                    <PromotionStatusBadge status={promotionStatus[project.id]} />
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button 
                                        onClick={() => handleViewClick(project)}
                                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredProjects.length === 0 && <p className="text-center py-8 text-gray-500">No projects match the current filters.</p>}
            </div>
            {viewingDetailsForProject && (
                <ProjectDetailsModal
                    project={viewingDetailsForProject}
                    onClose={() => setViewingDetailsForProject(null)}
                />
            )}
             {viewingReportForProject && (
                <DetailedProjectReportModal
                    project={viewingReportForProject}
                    onClose={() => setViewingReportForProject(null)}
                />
            )}
        </div>
    );
};

export default ProjectManagement;