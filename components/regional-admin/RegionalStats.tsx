import React, { useMemo } from 'react';
import { User, UserRole, Project } from '../../types';
import UsersIcon from '../icons/UsersIcon';
import FolderIcon from '../icons/FolderIcon';
import GavelIcon from '../icons/GavelIcon';
import { RegionalAdminView } from './Sidebar';
import LeadersBoard from '../shared/LeadersBoard';
import JudgingProgressDashboard from '../shared/JudgingProgressDashboard';
import { useAuth } from '../../hooks/useAuth';

interface RegionalStatsProps {
    users: User[];
    projects: Project[];
    setActiveView: (view: RegionalAdminView) => void;
    currentUser: User;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; onClick: () => void; }> = ({ title, value, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all duration-200"
    >
        <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </button>
);

const RegionalStats: React.FC<RegionalStatsProps> = ({ users, projects, setActiveView, currentUser }) => {
    const { users: allUsers } = useAuth(); // Need all users for judge context

    const stats = useMemo(() => {
        const countyAdmins = users.filter(u => u.role === UserRole.COUNTY_ADMIN).length;
        const regionalJudges = users.filter(u => u.role === UserRole.JUDGE).length;
        return { countyAdmins, regionalJudges, projects };
    }, [users, projects]);
    
    const projectsForLevel = useMemo(() => stats.projects.filter(p => p.level === 'Regional'), [stats.projects]);

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{currentUser.assignedRegion} Region Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        title="County Admins" 
                        value={stats.countyAdmins} 
                        icon={<UsersIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('countyAdmins')} 
                    />
                    <StatCard 
                        title="Regional Projects" 
                        value={stats.projects.length} 
                        icon={<FolderIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('projects')} 
                    />
                    <StatCard 
                        title="Regional Judges" 
                        value={stats.regionalJudges} 
                        icon={<GavelIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('judges')} 
                    />
                </div>
            </div>
            <JudgingProgressDashboard projects={projectsForLevel} users={allUsers} />
            <LeadersBoard projects={projects.filter(p => p.level === 'Regional')} title={`${currentUser.assignedRegion} Region Leaderboard`} />
        </div>
    );
};

export default RegionalStats;
