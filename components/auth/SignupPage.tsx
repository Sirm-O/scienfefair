import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, NewUser } from '../../types';

const SignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [tscNumber, setTscNumber] = useState('');
    const [school, setSchool] = useState('');
    const [subject1, setSubject1] = useState('');
    const [subject2, setSubject2] = useState('');
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const teachingSubjects = [subject1, subject2].map(s => s.trim()).filter(Boolean);

            const userData: NewUser = {
                name,
                email,
                phoneNumber,
                idNumber,
                role: UserRole.PATRON,
                tscNumber,
                school,
                teachingSubjects,
            };

            await signup(userData);
             // On success, a message is shown to check email.
             // No redirect happens until confirmation.
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const commonInputClass = "mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                 <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
                    {error}
                </div>
            )}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                <strong>Note:</strong> This registration page is for <strong>Project Advisors (Patrons)</strong> only. Judge and Administrator accounts are created by the system administrator.
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                </label>
                <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={commonInputClass}
                />
            </div>
             <div>
                <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                </label>
                <input
                    id="email-signup"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={commonInputClass}
                />
            </div>
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                </label>
                <input
                    id="phoneNumber"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={commonInputClass}
                />
            </div>
             <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ID Number
                </label>
                <input
                    id="idNumber"
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className={commonInputClass}
                />
            </div>

            <div>
                <label htmlFor="tscNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    TSC Number
                </label>
                <input
                    id="tscNumber"
                    type="text"
                    required
                    value={tscNumber}
                    onChange={(e) => setTscNumber(e.target.value)}
                    className={commonInputClass}
                />
            </div>

            <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    School
                </label>
                <input
                    id="school"
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className={commonInputClass}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teaching Subjects
                </label>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        id="subject1"
                        type="text"
                        placeholder="Subject 1"
                        required
                        value={subject1}
                        onChange={(e) => setSubject1(e.target.value)}
                        className={commonInputClass.replace("mt-1 ", "")}
                    />
                    <input
                        id="subject2"
                        type="text"
                        placeholder="Subject 2 (Optional)"
                        value={subject2}
                        onChange={(e) => setSubject2(e.target.value)}
                        className={commonInputClass.replace("mt-1 ", "")}
                    />
                </div>
            </div>

             <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">A confirmation link will be sent to your email to complete registration.</p>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creating Account...' : 'Sign up'}
                </button>
            </div>
        </form>
    );
};

export default SignupPage;
