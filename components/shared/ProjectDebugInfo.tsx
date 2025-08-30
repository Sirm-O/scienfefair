import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import InfoIcon from '../icons/InfoIcon';

const ProjectDebugInfo: React.FC = () => {
  const { projects, error } = useProjects();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const patronProjects = projects.filter(p => p.patronId === currentUser.id);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        title="Debug Info"
      >
        <InfoIcon className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Debug Info</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Current User:</h4>
              <p className="text-gray-600 dark:text-gray-400">ID: {currentUser.id}</p>
              <p className="text-gray-600 dark:text-gray-400">Role: {currentUser.role}</p>
              <p className="text-gray-600 dark:text-gray-400">School: {currentUser.school || 'Not set'}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Projects Status:</h4>
              <p className="text-gray-600 dark:text-gray-400">Total Projects: {projects.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Your Projects: {patronProjects.length}</p>
              {error && (
                <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
            
            {patronProjects.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Your Projects:</h4>
                <div className="space-y-2">
                  {patronProjects.map(project => (
                    <div key={project.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      <p><strong>Title:</strong> {project.title}</p>
                      <p><strong>Reg No:</strong> {project.regNo}</p>
                      <p><strong>Status:</strong> {project.status}</p>
                      <p><strong>ID:</strong> {project.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Supabase Connection:</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Status: {error ? '❌ Error' : '✅ Connected'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDebugInfo;