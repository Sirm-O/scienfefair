
import React, { useState } from 'react';
import { User } from '../../types';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import MyProjects from './MyProjects';

export type PatronView = 'dashboard' | 'projects';

interface PatronDashboardProps {
    user: User;
}

const PatronDashboard: React.FC<PatronDashboardProps> = ({ user }) => {
    const [activeView, setActiveView] = useState<PatronView>('dashboard');

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardOverview user={user} />;
            case 'projects':
                return <MyProjects user={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-6 sm:p-8 lg:p-10 bg-gray-100 dark:bg-gray-900">
                {renderContent()}
            </main>
        </div>
    );
};

export default PatronDashboard;
