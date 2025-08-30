
import React, { useState, useMemo } from 'react';
import { User, UserRole, Project } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import Sidebar, { RegionalAdminView } from './Sidebar';
import RegionalStats from './RegionalStats';
import CountyAdminManagement from './CountyAdminManagement';
import RegionalJudgeManagement from './RegionalJudgeManagement';
import ProjectManagement from './ProjectManagement';
import Reports from './Reports';
import RankingReport from '../shared/RankingReport';

interface RegionalAdminDashboardProps {
    user: User;
}

const RegionalAdminDashboard: React.FC<RegionalAdminDashboardProps> = ({ user }) => {
    const [activeView, setActiveView] = useState<RegionalAdminView>('dashboard');
    const { users, addUser, updateUser, removeUser } = useAuth();
    const { projects: allProjects } = useProjects();
    
    const adminRegion = user.assignedRegion;

    const regionalData = useMemo(() => {
        if (!adminRegion) {
            // If no region assignment, return empty data rather than crashing
            return { users: [], projects: [] };
        }
        const filteredUsers = users.filter(u => u.assignedRegion === adminRegion);
        const filteredProjects = allProjects.filter(p => p.region === adminRegion);
        return { users: filteredUsers, projects: filteredProjects };
    }, [users, allProjects, adminRegion]);

    // Only check for assignment if user role requires it
    const requiresRegionalAssignment = user.role === 'Regional Admin';
    
    if (requiresRegionalAssignment && !adminRegion) {
        return (
            <main className="container mx-auto p-8">
                <div className="text-center bg-red-100 dark:bg-red-900/50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">Configuration Error</h2>
                    <p className="mt-2 text-red-600 dark:text-red-300">
                        Your account is not assigned to a region. Please contact the Super Administrator.
                    </p>
                </div>
            </main>
        );
    }
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <RegionalStats users={regionalData.users} projects={regionalData.projects} setActiveView={setActiveView} currentUser={user} />;
            case 'countyAdmins':
                return <CountyAdminManagement users={regionalData.users} onAddUser={addUser} onUpdateUser={updateUser} onRemoveUser={removeUser} currentUser={user} />;
            case 'judges':
                return <RegionalJudgeManagement users={regionalData.users} onAddUser={addUser} onUpdateUser={updateUser} onRemoveUser={removeUser} currentUser={user} />;
            case 'projects':
                return <ProjectManagement projects={regionalData.projects} />;
            case 'rankingReport':
                return <RankingReport user={user} projects={allProjects} />;
            case 'summaryReports':
            case 'judgingReports':
                return <Reports view={activeView} projects={regionalData.projects} currentUser={user} />;
            default:
                return null;
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-6 sm:p-8 lg:p-10">
                {renderContent()}
            </main>
        </div>
    );
};

export default RegionalAdminDashboard;
