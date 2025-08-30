
import React from 'react';
import { PatronView } from './PatronDashboard';
import DashboardIcon from '../icons/DashboardIcon';
import FileTextIcon from '../icons/FileTextIcon';

interface SidebarProps {
  activeView: PatronView;
  setActiveView: (view: PatronView) => void;
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
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0">
      <nav className="space-y-2">
        <NavItem
          icon={<DashboardIcon className="w-6 h-6" />}
          label="Dashboard"
          isActive={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          icon={<FileTextIcon className="w-6 h-6" />}
          label="My Projects"
          isActive={activeView === 'projects'}
          onClick={() => setActiveView('projects')}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;
