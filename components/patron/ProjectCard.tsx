

import React from 'react';
import { Project } from '../../types';
import { JudgingProgress } from '../../utils/mockScores';

interface ProjectCardProps {
    project: Project;
    onEdit: () => void;
    onRemove: () => void;
    onViewReport: () => void;
    judgingProgress?: JudgingProgress;
    onClick?: () => void;
}

const statusColorMap: Record<Project['status'], string> = {
    'Qualified': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Judging': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Conflict': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const levelColorMap: Record<Project['level'], string> = {
    'Sub-County': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'County': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Regional': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'National': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusDescriptions: Record<Project['status'], string> = {
    'Qualified': "Project has been successfully registered and is awaiting the start of judging for its current competition level.",
    'Judging': "Project is currently being evaluated by judges at this competition level.",
    'Completed': "Judging for this project at the current level is complete. Scores and feedback are available.",
    'Conflict': "A conflict was detected (e.g., score discrepancy). A coordinator will review it."
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onRemove, onViewReport, judgingProgress, onClick }) => {
    const isCompleted = project.status === 'Completed';

    const progressPercentage = judgingProgress 
        ? (judgingProgress.judgesScored / judgingProgress.totalJudges) * 100 
        : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div onClick={onClick} className="p-6 flex-grow cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{project.category}</p>
                    <div className="relative group flex items-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[project.status]}`}>
                            {project.status}
                        </span>
                        <div className="absolute bottom-full right-0 mb-2 w-60 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                            {statusDescriptions[project.status]}
                            <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                    <p><strong>Presenters:</strong> {project.presenters.join(', ')}</p>
                    <p><strong>Current Level:</strong> <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${levelColorMap[project.level]}`}>{project.level}</span></p>
                </div>

                {judgingProgress && (project.status === 'Judging' || project.status === 'Completed') && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Judging Progress</h4>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {judgingProgress.judgesScored}/{judgingProgress.totalJudges}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                )}

            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-end space-x-2">
                {isCompleted && (
                     <button onClick={onViewReport} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        View Report
                    </button>
                )}
                <button onClick={onEdit} className="px-3 py-1 text-xs font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">
                    Edit
                </button>
                <button onClick={onRemove} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-200 dark:hover:bg-red-900">
                    Remove
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
