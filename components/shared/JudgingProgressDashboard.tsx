import React, { useMemo, useState } from 'react';
import { Project, User } from '../../types';
import { getAggregatedJudgingStatus, CategoryStatus, JudgeStatus } from '../../utils/mockScores';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import XCircleIcon from '../icons/XCircleIcon';

const JudgeStatusIndicator: React.FC<{ judge: JudgeStatus }> = ({ judge }) => (
    <div className="flex items-center space-x-2">
        {judge.hasJudged ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
        ) : (
            <XCircleIcon className="w-4 h-4 text-gray-400" />
        )}
        <span className={judge.hasJudged ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
            {judge.name}
        </span>
    </div>
);


const CategoryProgressCard: React.FC<{ category: string; data: CategoryStatus; }> = ({ category, data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const progressPercentage = data.totalProjects > 0 ? (data.completedProjects / data.totalProjects) * 100 : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`content-${category}`}
            >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{category}</h3>
                    <div className="flex items-center mt-2 sm:mt-0">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-3">
                            {data.completedProjects} / {data.totalProjects} Projects Judged
                        </span>
                        <div className="w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                         <svg className={`w-6 h-6 text-gray-500 dark:text-gray-400 ml-3 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div id={`content-${category}`} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        {data.projects.map(project => (
                            <div key={project.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200">{project.title}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm">
                                    <div>
                                        <p className="font-medium mb-1">Section A (Written)</p>
                                        <div className="space-y-1">
                                            {project.judgesA.map(j => <JudgeStatusIndicator key={j.name} judge={j} />)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Section B & C (Oral/Project)</p>
                                        <div className="space-y-1">
                                            {project.judgesBC.map(j => <JudgeStatusIndicator key={j.name} judge={j} />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


interface JudgingProgressDashboardProps {
    projects: Project[];
    users: User[];
}

const JudgingProgressDashboard: React.FC<JudgingProgressDashboardProps> = ({ projects, users }) => {
    const statusByCategory = useMemo(() => {
        return getAggregatedJudgingStatus(projects, users);
    }, [projects, users]);
    
    const sortedCategories = useMemo(() => Object.keys(statusByCategory).sort(), [statusByCategory]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Judging Progress Overview</h2>
             {sortedCategories.length > 0 ? (
                sortedCategories.map(category => (
                    <CategoryProgressCard key={category} category={category} data={statusByCategory[category]} />
                ))
            ) : (
                 <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No projects are currently in the judging phase.</p>
                </div>
            )}
        </div>
    );
};

export default JudgingProgressDashboard;
