
import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './components/auth/AuthPage';
import { ThemeProvider } from './hooks/useTheme';
import { ProjectProvider, useProjects } from './hooks/useProjects';
import ForcePasswordChangeModal from './components/shared/ForcePasswordChangeModal';
import { testDatabaseConnection } from './services/supabaseClient';
import DatabaseDebug from './components/debug/DatabaseDebug';
import ErrorBoundary from './components/ErrorBoundary';
import TestPage from './components/TestPage';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { error: projectError } = useProjects();
  const [dbStatus, setDbStatus] = useState<{ success: boolean; error?: string; details?: any } | null>(null);

  console.log('AppContent render - currentUser:', currentUser, 'projectError:', projectError);

  // Test database connection on mount but don't block rendering
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const result = await testDatabaseConnection();
        setDbStatus(result);
        if (!result.success) {
          console.error('Database connection test failed:', result);
        }
      } catch (error) {
        console.error('Database test error:', error);
        setDbStatus({ success: false, error: 'Connection test failed', details: 'Unknown error' });
      }
    };
    checkDatabase();
  }, []);

  // Show database error if connection failed
  if (dbStatus && !dbStatus.success) {
    const isRLSError = dbStatus.details && dbStatus.details.includes('infinite recursion');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-200">
            {isRLSError ? 'Database Policy Error' : 'Database Connection Error'}
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {dbStatus.error}
          </p>
          <div className="mt-2 p-3 bg-red-50 dark:bg-gray-700 rounded-md text-sm text-red-800 dark:text-red-200 text-left font-mono">
            {dbStatus.details}
          </div>
          
          {isRLSError && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-left">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">🔧 How to Fix:</h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>1. Open your Supabase Dashboard</li>
                <li>2. Navigate to SQL Editor</li>
                <li>3. Run the <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">fix-rls-policies.sql</code> script</li>
                <li>4. Refresh this page</li>
              </ol>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500">
            {isRLSError 
              ? 'This error occurs when Row Level Security policies create circular dependencies.' 
              : 'Please ensure the database schema has been set up correctly.'}
          </p>
          <div className="mt-6 space-x-2">
            <button 
              onClick={() => setDbStatus(null)} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue Anyway
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If there's a force password change requirement, show the modal
  if (currentUser?.forcePasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200">Password Change Required</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            You must change your password before continuing.
          </p>
          <div className="mt-6">
            <ForcePasswordChangeModal 
              user={currentUser}
              onSuccess={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    );
  }

  // If a project-related database error occurs after login, show a dedicated error screen.
  if (projectError && currentUser) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-200">Application Error</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                    An error occurred while trying to connect to the database.
                </p>
                <div className="mt-2 p-3 bg-red-50 dark:bg-gray-700 rounded-md text-sm text-red-800 dark:text-red-200 text-left font-mono">
                  {projectError}
                </div>
                <p className="mt-4 text-sm text-gray-500">Please contact the system administrator. You may need to sign out and sign back in after the issue is resolved.</p>
            </div>
        </div>
      );
  }

  // Main render logic with fallback
  try {
    return (
      <div className="min-h-screen font-sans text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        {currentUser ? (
          <Dashboard user={currentUser} />
        ) : (
          <AuthPage />
        )}
        {process.env.NODE_ENV === 'development' && <DatabaseDebug />}
      </div>
    );
  } catch (error) {
    console.error('App rendering error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-200">Application Error</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            An unexpected error occurred while rendering the application.
          </p>
          <div className="mt-2 p-3 bg-red-50 dark:bg-gray-700 rounded-md text-sm text-red-800 dark:text-red-200 text-left font-mono">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};


const App: React.FC = () => {
  console.log('App.tsx: App component rendering');
  
  // Add a test mode to debug rendering issues
  const isTestMode = window.location.search.includes('test=true');
  
  if (isTestMode) {
    return (
      <ErrorBoundary>
        <TestPage />
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <AppContent />
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;