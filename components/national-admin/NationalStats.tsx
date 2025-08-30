import React, { useMemo } from 'react';
import { User, UserRole, Project } from '../../types';
import GlobeIcon from '../icons/GlobeIcon';
import FolderIcon from '../icons/FolderIcon';
import GavelIcon from '../icons/GavelIcon';
import { NationalAdminView } from './Sidebar';
import LeadersBoard from '../shared/LeadersBoard';
import JudgingProgressDashboard from '../shared/JudgingProgressDashboard';
import { useAuth } from '../../hooks/useAuth';

interface NationalStatsProps {
    users: User[];
    projects: Project[];
    setActiveView: (view: NationalAdminView) => void;
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

const NationalStats: React.FC<NationalStatsProps> = ({ users, projects, setActiveView }) => {
    const { users: allUsers } = useAuth(); // Need all users for judge context

    const stats = useMemo(() => {
        const regionalAdmins = users.filter(u => u.role === UserRole.REGIONAL_ADMIN).length;
        const nationalJudges = users.filter(u => u.role === UserRole.JUDGE && (u.assignedRegion === 'National' || !u.assignedRegion)).length;
        const nationalProjects = projects.filter(p => p.level === 'National');
        return { regionalAdmins, nationalJudges, nationalProjects };
    }, [users, projects]);

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">National Fair Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        title="Regional Admins" 
                        value={stats.regionalAdmins} 
                        icon={<GlobeIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('regionalAdmins')} 
                    />
                    <StatCard 
                        title="National Projects" 
                        value={stats.nationalProjects.length} 
                        icon={<FolderIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('projects')} 
                    />
                    <StatCard 
                        title="National Judges" 
                        value={stats.nationalJudges} 
                        icon={<GavelIcon className="w-6 h-6" />} 
                        onClick={() => setActiveView('judges')} 
                    />
                </div>
            </div>
            <JudgingProgressDashboard projects={stats.nationalProjects} users={allUsers} />
            <LeadersBoard projects={projects.filter(p => p.level === 'National')} title="National Competition Leaderboard" />
        </div>
    );
};

export default NationalStats;
