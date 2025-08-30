
import React, { useState, useMemo } from 'react';
import { User, Project } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import Sidebar, { CountyAdminView } from './Sidebar';
import CountyStats from './CountyStats';
import SubCountyAdminManagement from './SubCountyAdminManagement';
import CountyJudgeManagement from './CountyJudgeManagement';
import ProjectManagement from './ProjectManagement';
import Reports from './Reports';
import RankingReport from '../shared/RankingReport';

interface CountyAdminDashboardProps {
    user: User;
}

const CountyAdminDashboard: React.FC<CountyAdminDashboardProps> = ({ user }) => {
    const [activeView, setActiveView] = useState<CountyAdminView>('dashboard');
    const { users, addUser, updateUser, removeUser } = useAuth();
    const { projects: allProjects } = useProjects();
    
    const adminCounty = user.assignedCounty;

    const countyData = useMemo(() => {
        if (!adminCounty) {
            // If no county assignment, return empty data rather than crashing
            return { users: [], projects: [] };
        }
        const filteredUsers = users.filter(u => u.assignedCounty === adminCounty);
        const filteredProjects = allProjects.filter(p => p.county === adminCounty);
        return { users: filteredUsers, projects: filteredProjects };
    }, [users, allProjects, adminCounty]);

    // Only check for assignment if user role requires it
    const requiresCountyAssignment = user.role === 'County Admin';
    
    if (requiresCountyAssignment && !adminCounty) {
        return (
            <main className="container mx-auto p-8">
                <div className="text-center bg-red-100 dark:bg-red-900/50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">Configuration Error</h2>
                    <p className="mt-2 text-red-600 dark:text-red-300">
                        Your account is not assigned to a county. Please contact a Regional Administrator.
                    </p>
                </div>
            </main>
        );
    }
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <CountyStats users={countyData.users} projects={countyData.projects} setActiveView={setActiveView} currentUser={user} />;
            case 'subCountyAdmins':
                return <SubCountyAdminManagement users={countyData.users} onAddUser={addUser} onUpdateUser={updateUser} onRemoveUser={removeUser} currentUser={user} />;
            case 'judges':
                return <CountyJudgeManagement users={countyData.users} onAddUser={addUser} onUpdateUser={updateUser} onRemoveUser={removeUser} currentUser={user} />;
            case 'projects':
                return <ProjectManagement projects={countyData.projects} />;
            case 'rankingReport':
                return <RankingReport user={user} projects={allProjects} />;
            case 'summaryReports':
            case 'judgingReports':
                return <Reports view={activeView} projects={countyData.projects} currentUser={user} />;
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

export default CountyAdminDashboard;
