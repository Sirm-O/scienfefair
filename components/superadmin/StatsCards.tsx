import React, { useMemo } from 'react';
import { User, UserRole } from '../../types';
import { RoleFilter } from './SuperAdminDashboard';
import TotalUsersIcon from '../icons/TotalUsersIcon';
import AdministratorsIcon from '../icons/AdministratorsIcon';
import JudgesIcon from '../icons/JudgesIcon';
import PatronsIcon from '../icons/PatronsIcon';

interface StatsCardsProps {
    users: User[];
    onCardClick: (filter: RoleFilter | 'ALL') => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; onClick: () => void; }> = ({ title, value, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all duration-200"
    >
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </button>
);


const StatsCards: React.FC<StatsCardsProps> = ({ users, onCardClick }) => {

    const stats = useMemo(() => {
        const totalUsers = users.length;
        const judges = users.filter(u => u.role === UserRole.JUDGE).length;
        const patrons = users.filter(u => u.role === UserRole.PATRON).length;
        const admins = users.filter(u => u.role.toLowerCase().includes('admin')).length;
        return { totalUsers, judges, patrons, admins };
    }, [users]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Platform Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<TotalUsersIcon />} onClick={() => onCardClick('ALL')} />
                <StatCard title="Administrators" value={stats.admins} icon={<AdministratorsIcon />} onClick={() => onCardClick('ADMIN')} />
                <StatCard title="Judges" value={stats.judges} icon={<JudgesIcon />} onClick={() => onCardClick('JUDGE')} />
                <StatCard title="Patrons" value={stats.patrons} icon={<PatronsIcon />} onClick={() => onCardClick('PATRON')} />
            </div>
        </div>
    );
};

export default StatsCards;