import React, { useState } from 'react';
import { supabase, testDatabaseConnection } from '../../services/supabaseClient';

const DatabaseDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runDatabaseTests = async () => {
    setIsLoading(true);
    setTestResults('Running database tests...\n\n');

    try {
      // Test 1: Connection
      const connectionTest = await testDatabaseConnection();
      setTestResults(prev => prev + `Connection Test: ${connectionTest.success ? 'PASSED' : 'FAILED'}\n`);
      if (!connectionTest.success) {
        setTestResults(prev => prev + `Error: ${connectionTest.error}\nDetails: ${connectionTest.details}\n\n`);
      }

      // Test 2: Check if profiles table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (tableError) {
        setTestResults(prev => prev + `Profiles Table Test: FAILED\n`);
        setTestResults(prev => prev + `Error: ${tableError.message}\n\n`);
      } else {
        setTestResults(prev => prev + `Profiles Table Test: PASSED\n\n`);
      }

      // Test 3: Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setTestResults(prev => prev + `Session Test: FAILED\n`);
        setTestResults(prev => prev + `Error: ${sessionError.message}\n\n`);
      } else {
        setTestResults(prev => prev + `Session Test: ${session ? 'LOGGED IN' : 'NOT LOGGED IN'}\n`);
        if (session) {
          setTestResults(prev => prev + `User ID: ${session.user.id}\n`);
          setTestResults(prev => prev + `Email: ${session.user.email}\n\n`);
        }
      }

      // Test 4: Check projects table
      const { data: projectsCheck, error: projectsError } = await supabase
        .from('projects')
        .select('count')
        .limit(1);

      if (projectsError) {
        setTestResults(prev => prev + `Projects Table Test: FAILED\n`);
        setTestResults(prev => prev + `Error: ${projectsError.message}\n\n`);
      } else {
        setTestResults(prev => prev + `Projects Table Test: PASSED\n\n`);
      }

    } catch (error) {
      setTestResults(prev => prev + `Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-4 max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Database Debug</h3>
        
        <button
          onClick={runDatabaseTests}
          disabled={isLoading}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Testing...' : 'Run Database Tests'}
        </button>

        {testResults && (
          <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
            {testResults}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseDebug;