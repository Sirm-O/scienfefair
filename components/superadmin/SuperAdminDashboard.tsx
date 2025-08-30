import React, { useState } from 'react';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import ReportGenerator from '../shared/ReportGenerator';
import DashboardOverview from './DashboardOverview';

type AdminView = 'dashboard' | 'users' | 'summaryReports' | 'judgingReports';
export type RoleFilter = 'ADMIN' | 'JUDGE' | 'PATRON' | null;


const SuperAdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>(null);
    const { users, updateUser, addUser, removeUser } = useAuth();
    const { projects } = useProjects();

    const handleCardClick = (filter: RoleFilter | 'ALL') => {
        setActiveView('users');
        setRoleFilter(filter === 'ALL' ? null : filter);
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-6 sm:p-8 lg:p-10">
                {activeView === 'dashboard' && (
                    <DashboardOverview
                        users={users}
                        projects={projects}
                        onCardClick={handleCardClick}
                    />
                )}
                {activeView === 'users' && (
                    <UserManagement 
                        users={users} 
                        onUpdateUser={updateUser}
                        onAddUser={addUser}
                        onRemoveUser={removeUser}
                        roleFilter={roleFilter}
                        onClearFilter={() => setRoleFilter(null)}
                    />
                )}
                {activeView === 'summaryReports' && (
                    <ReportGenerator 
                        title="Platform-Wide Summary Report"
                        projects={projects}
                        reportType="summary"
                    />
                )}
                {activeView === 'judgingReports' && (
                     <ReportGenerator 
                        title="Platform-Wide Judging Report"
                        projects={projects}
                        reportType="judging"
                    />
                )}
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
