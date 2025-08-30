import React from 'react';
import { User, Project } from '../../types';
import StatsCards from './StatsCards';
import { RoleFilter } from './SuperAdminDashboard';
import JudgingProgressDashboard from '../shared/JudgingProgressDashboard';
import { useAuth } from '../../hooks/useAuth';

interface DashboardOverviewProps {
    users: User[];
    projects: Project[];
    onCardClick: (filter: RoleFilter | 'ALL') => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ users, projects, onCardClick }) => {
    const { users: allUsers } = useAuth(); // All users for context
    return (
        <div className="space-y-10">
            <StatsCards users={users} onCardClick={onCardClick} />
            <JudgingProgressDashboard projects={projects} users={allUsers} />
        </div>
    );
};

export default DashboardOverview;
