
import React, { useState } from 'react';
import Sidebar, { NationalAdminView } from './Sidebar';
import NationalStats from './NationalStats';
import { useAuth } from '../../hooks/useAuth';
import RegionalAdminManagement from './RegionalAdminManagement';
import NationalJudgeManagement from './NationalJudgeManagement';
import ProjectManagement from './ProjectManagement';
import { useProjects } from '../../hooks/useProjects';
import Reports from './Reports';
import RankingReport from '../shared/RankingReport';

const NationalAdminDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<NationalAdminView>('dashboard');
    const { users, addUser, updateUser, removeUser, currentUser } = useAuth();
    const { projects } = useProjects();

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <NationalStats users={users} projects={projects} setActiveView={setActiveView} />;
            case 'regionalAdmins':
                return <RegionalAdminManagement users={users} onAddUser={addUser} onUpdateUser={updateUser} onRemoveUser={removeUser} />;
            case 'judges':
                return <NationalJudgeManagement users={users} onAddUser={addUser} onUpdateUser={updateUser} onRemoveUser={removeUser} currentUser={currentUser!} />;
            case 'projects':
                return <ProjectManagement projects={projects} />;
            case 'rankingReport':
                return <RankingReport user={currentUser!} projects={projects} />;
            case 'summaryReports':
            case 'judgingReports':
                return <Reports view={activeView} projects={projects} />;
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

export default NationalAdminDashboard;
