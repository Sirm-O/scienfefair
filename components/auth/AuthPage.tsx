
import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { KSEF_LOGO_BASE64 } from '@/assets/ksef-logo';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    const toggleView = () => {
        setIsLoginView(prev => !prev);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src={KSEF_LOGO_BASE64} alt="KSEF Logo" className="h-24 w-auto mx-auto" />
                    <h1 className="text-3xl font-bold mt-4 text-gray-800 dark:text-white">KSEF Judging Platform</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {isLoginView ? 'Sign in to your account' : 'Create a new Project Advisor account'}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
                    {isLoginView ? <LoginPage /> : <SignupPage />}
                    
                    <div className="mt-6 text-center">
                        <button onClick={toggleView} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;