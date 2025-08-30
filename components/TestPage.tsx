import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🎯 KSEF Platform Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          React is working correctly! Basic rendering is functional.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ React Components Loading</p>
          <p>✅ Tailwind CSS Working</p>
          <p>✅ Dark Mode Support</p>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => console.log('Button clicked!')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;