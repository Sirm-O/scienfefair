


import React, { useState, useMemo } from 'react';
import { User, UserRole, NewUser, JudgeAssignment } from '../../types';
import { useAuth, BulkAddResult } from '../../hooks/useAuth';
import CloseIcon from '../icons/CloseIcon';
import UploadIcon from '../icons/UploadIcon';
import DownloadIcon from '../icons/DownloadIcon';
import { PROJECT_CATEGORIES } from '../../constants';

interface BulkRegisterModalProps {
    onClose: () => void;
    userContext: User; // The admin user, for context
    targetRole: 'judge' | 'admin';
}

type ModalView = 'upload' | 'loading' | 'results';

const BulkRegisterModal: React.FC<BulkRegisterModalProps> = ({ onClose, userContext, targetRole }) => {
    const { addBulkUsers } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [view, setView] = useState<ModalView>('upload');
    const [results, setResults] = useState<BulkAddResult | null>(null);

    const config = useMemo(() => {
        if (targetRole === 'judge') {
            return {
                title: 'Bulk Register Judges',
                headers: ['Name', 'Email', 'Section A Category', 'Section BC Category'],
                exampleData: 'John Doe,john.doe@example.com,Mathematical Science,Physics\nJane Smith,jane.smith@example.com,,Biology and Biotechnology',
                parse: (lineData: string[], context: User): NewUser => {
                    const assignmentACategory = lineData[2]?.trim();
                    const assignmentBCCategory = lineData[3]?.trim();
                    const assignments: JudgeAssignment[] = [];

                    if (assignmentACategory) {
                        if (!PROJECT_CATEGORIES.includes(assignmentACategory)) {
                            throw new Error(`Invalid Section A category: '${assignmentACategory}'.`);
                        }
                        assignments.push({ category: assignmentACategory, section: 'A' });
                    }
                    if (assignmentBCCategory) {
                        if (!PROJECT_CATEGORIES.includes(assignmentBCCategory)) {
                            throw new Error(`Invalid Section BC category: '${assignmentBCCategory}'.`);
                        }
                        assignments.push({ category: assignmentBCCategory, section: 'BC' });
                    }

                    return {
                        name: lineData[0]?.trim(),
                        email: lineData[1]?.trim(),
                        role: UserRole.JUDGE,
                        assignments: assignments.length > 0 ? assignments : undefined,
                        assignedRegion: context.assignedRegion,
                        assignedCounty: context.assignedCounty,
                        assignedSubCounty: context.assignedSubCounty,
                    };
                }
            };
        }
        
        // Admin registration logic
        switch (userContext.role) {
            case UserRole.SUPERADMIN:
                return {
                    title: 'Bulk Register Users',
                    headers: ['Name', 'Email', 'Role', 'Region', 'County', 'SubCounty'],
                    exampleData: 'Admin Name,admin@example.com,Regional Admin,Coast,,\nJudge Name,judge@example.com,Judge,,,',
                    parse: (lineData: string[]): NewUser => ({
                        name: lineData[0]?.trim(),
                        email: lineData[1]?.trim(),
                        role: lineData[2]?.trim() as UserRole,
                        assignedRegion: lineData[3]?.trim() || undefined,
                        assignedCounty: lineData[4]?.trim() || undefined,
                        assignedSubCounty: lineData[5]?.trim() || undefined,
                    })
                };
            case UserRole.NATIONAL_ADMIN:
                return {
                    title: 'Bulk Register Regional Admins',
                    headers: ['Name', 'Email', 'Region'],
                    exampleData: 'Coast Admin,coast.admin@example.com,Coast',
                    parse: (lineData: string[]): NewUser => ({
                        name: lineData[0]?.trim(),
                        email: lineData[1]?.trim(),
                        role: UserRole.REGIONAL_ADMIN,
                        assignedRegion: lineData[2]?.trim(),
                    })
                };
            case UserRole.REGIONAL_ADMIN:
                 return {
                    title: 'Bulk Register County/Sub-County Admins',
                    headers: ['Name', 'Email', 'Role', 'County', 'SubCounty'],
                    exampleData: 'Mombasa Admin,mombasa.admin@example.com,County Admin,Mombasa,',
                    parse: (lineData: string[], context: User): NewUser => ({
                        name: lineData[0]?.trim(),
                        email: lineData[1]?.trim(),
                        role: lineData[2]?.trim() as UserRole,
                        assignedRegion: context.assignedRegion,
                        assignedCounty: lineData[3]?.trim(),
                        assignedSubCounty: lineData[4]?.trim() || undefined,
                    })
                };
            case UserRole.COUNTY_ADMIN:
                return {
                    title: 'Bulk Register Sub-County Admins',
                    headers: ['Name', 'Email', 'SubCounty'],
                    exampleData: 'Kisauni Admin,kisauni.admin@example.com,Kisauni',
                    parse: (lineData: string[], context: User): NewUser => ({
                        name: lineData[0]?.trim(),
                        email: lineData[1]?.trim(),
                        role: UserRole.SUB_COUNTY_ADMIN,
                        assignedRegion: context.assignedRegion,
                        assignedCounty: context.assignedCounty,
                        assignedSubCounty: lineData[2]?.trim(),
                    })
                };
            default: // Fallback for Sub-County admin trying to bulk add (which is only judges)
                 return {
                    title: 'Bulk Register Judges',
                    headers: ['Name', 'Email', 'Section A Category', 'Section BC Category'],
                    exampleData: 'John Doe,john.doe@example.com,Mathematical Science,\nJane Smith,jane.smith@example.com,,Biology and Biotechnology',
                    parse: (lineData: string[], context: User): NewUser => {
                        const assignmentACategory = lineData[2]?.trim();
                        const assignmentBCCategory = lineData[3]?.trim();
                        const assignments: JudgeAssignment[] = [];
                        if (assignmentACategory) {
                            if (!PROJECT_CATEGORIES.includes(assignmentACategory)) throw new Error(`Invalid Section A category: '${assignmentACategory}'.`);
                            assignments.push({ category: assignmentACategory, section: 'A' });
                        }
                        if (assignmentBCCategory) {
                             if (!PROJECT_CATEGORIES.includes(assignmentBCCategory)) throw new Error(`Invalid Section BC category: '${assignmentBCCategory}'.`);
                            assignments.push({ category: assignmentBCCategory, section: 'BC' });
                        }
                        return {
                            name: lineData[0]?.trim(),
                            email: lineData[1]?.trim(),
                            role: UserRole.JUDGE,
                            assignments: assignments.length > 0 ? assignments : undefined,
                            assignedRegion: context.assignedRegion,
                            assignedCounty: context.assignedCounty,
                            assignedSubCounty: context.assignedSubCounty,
                        };
                    }
                };
        }

    }, [targetRole, userContext]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        const csvHeader = config.headers.join(',') + '\n';
        const csvContent = "data:text/csv;charset=utf-8," + csvHeader + config.exampleData;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_registration_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRegister = async () => {
        if (!file) return;

        setView('loading');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length <= 1) {
                alert("The CSV file is empty or contains only headers.");
                setView('upload');
                return;
            }
            const csvHeaders = lines[0].split(',').map(h => h.trim());
            
            // Validate headers
            if (csvHeaders.length !== config.headers.length || !config.headers.every((h, i) => h.toLowerCase() === csvHeaders[i].toLowerCase())) {
                alert(`Invalid CSV headers. Expected: ${config.headers.join(', ')}`);
                setView('upload');
                return;
            }

            const usersToCreate: NewUser[] = [];
            const parsingErrors: BulkAddResult['errors'] = [];

            lines.slice(1).forEach((line, index) => {
                const rowNum = index + 2;
                try {
                    // Simple CSV split, doesn't handle commas in quotes
                    const data = line.split(',');
                    if (data.length > config.headers.length) {
                         throw new Error(`Row ${rowNum}: Too many columns. Expected ${config.headers.length}, found ${data.length}.`);
                    }
                    
                    const newUser = config.parse(data, userContext);
                    
                    if (!newUser.name || !newUser.email) {
                        throw new Error(`Row ${rowNum}: Name and Email are required.`);
                    }
                    if (!Object.values(UserRole).includes(newUser.role)) {
                         throw new Error(`Row ${rowNum}: Invalid role specified: '${newUser.role}'.`);
                    }

                    usersToCreate.push(newUser);

                } catch(err) {
                     const parts = line.split(',');
                     parsingErrors.push({ 
                        name: parts[0] || `Row ${rowNum}`, 
                        email: parts[1] || 'N/A', 
                        reason: err instanceof Error ? err.message : 'Unknown parsing error'
                    });
                }
            });

            const resultData = await addBulkUsers(usersToCreate);
            resultData.errors.push(...parsingErrors); // Combine API errors and parsing errors
            setResults(resultData);
            setView('results');
        };
        reader.readAsText(file);
    };
    
    const renderUploadView = () => (
        <>
            <div className="p-6 space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Step 1: Download Template</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Download the CSV template and fill it with user details. Required columns are: {config.headers.join(', ')}.
                    </p>
                    <button onClick={handleDownloadTemplate} className="mt-3 flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download CSV Template
                    </button>
                </div>
                
                <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Step 2: Upload File</h4>
                     <label htmlFor="file-upload" className="mt-2 flex justify-center w-full h-32 px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-400">
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <p className="pl-1">{file ? file.name : 'Click to upload a file'}</p>
                            </div>
                             <p className="text-xs text-gray-500">CSV up to 1MB</p>
                        </div>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                    </label>
                </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t dark:border-gray-700 space-x-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                </button>
                <button onClick={handleRegister} disabled={!file} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed">
                    Upload & Register
                </button>
            </div>
        </>
    );

    const renderLoadingView = () => (
        <div className="p-10 flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">Processing registrations...</p>
        </div>
    );
    
    const renderResultsView = () => (
         <>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Registration Complete</h4>
                {results && results.successCount > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700 rounded-md">
                        <p><span className="font-bold">{results.successCount}</span> users were registered successfully.</p>
                        <p className="text-sm mt-1">They will receive an email with a temporary password to log in.</p>
                    </div>
                )}
                 {results && results.errors.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                        <p className="font-semibold text-red-800 dark:text-red-200">
                             <span className="font-bold">{results.errors.length}</span> registrations failed:
                        </p>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                            {results.errors.map((err, index) => (
                                <li key={index}>
                                    <span className="font-medium">{err.name} ({err.email}):</span> {err.reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-end p-4 border-t dark:border-gray-700">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    Close
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{config.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                {view === 'upload' && renderUploadView()}
                {view === 'loading' && renderLoadingView()}
                {view === 'results' && renderResultsView()}
            </div>
        </div>
    );
};

export default BulkRegisterModal;