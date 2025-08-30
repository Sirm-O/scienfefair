

import React from 'react';
import DashboardIcon from '../icons/DashboardIcon';
import UsersIcon from '../icons/UsersIcon';
import GavelIcon from '../icons/GavelIcon';
import FolderIcon from '../icons/FolderIcon';
import ChartIcon from '../icons/ChartIcon';
import TrophyIcon from '../icons/TrophyIcon';

export type RegionalAdminView = 'dashboard' | 'countyAdmins' | 'judges' | 'projects' | 'rankingReport' | 'summaryReports' | 'judgingReports';

interface SidebarProps {
  activeView: RegionalAdminView;
  setActiveView: (view: RegionalAdminView) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-72 bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0">
      <nav className="space-y-2">
        <NavItem
          icon={<DashboardIcon className="w-6 h-6" />}
          label="Dashboard"
          isActive={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
         <NavItem
          icon={<UsersIcon className="w-6 h-6" />}
          label="County Admins"
          isActive={activeView === 'countyAdmins'}
          onClick={() => setActiveView('countyAdmins')}
        />
         <NavItem
          icon={<GavelIcon className="w-6 h-6" />}
          label="Regional Judges"
          isActive={activeView === 'judges'}
          onClick={() => setActiveView('judges')}
        />
        <NavItem
          icon={<FolderIcon className="w-6 h-6" />}
          label="Project Management"
          isActive={activeView === 'projects'}
          onClick={() => setActiveView('projects')}
        />
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reporting</p>
         <NavItem
          icon={<TrophyIcon className="w-6 h-6" />}
          label="Ranking Report"
          isActive={activeView === 'rankingReport'}
          onClick={() => setActiveView('rankingReport')}
        />
         <NavItem
          icon={<ChartIcon className="w-6 h-6" />}
          label="Summary Reports"
          isActive={activeView === 'summaryReports'}
          onClick={() => setActiveView('summaryReports')}
        />
         <NavItem
          icon={<ChartIcon className="w-6 h-6" />}
          label="Judging Reports"
          isActive={activeView === 'judgingReports'}
          onClick={() => setActiveView('judgingReports')}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
