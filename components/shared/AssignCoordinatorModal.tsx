
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { PROJECT_CATEGORIES } from '../../constants';
import CloseIcon from '../icons/CloseIcon';

interface AssignCoordinatorModalProps {
    judges: User[]; // Pass in only eligible judges
    onClose: () => void;
    onAssign: (userId: string, category: string) => Promise<void>;
}

const AssignCoordinatorModal: React.FC<AssignCoordinatorModalProps> = ({ judges, onClose, onAssign }) => {
    const [selectedJudgeId, setSelectedJudgeId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAssign = async () => {
        if (!selectedJudgeId || !selectedCategory) return;
        setIsSaving(true);
        try {
            await onAssign(selectedJudgeId, selectedCategory);
            onClose();
        } catch (error) {
            console.error("Failed to assign coordinator:", error);
            // Optionally, set an error state to show in the UI
        } finally {
            setIsSaving(false);
        }
    };

    const isAssignDisabled = !selectedJudgeId || !selectedCategory || isSaving;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Assign Coordinator Role</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Select an active judge and a category to assign them as a Coordinator. This will change their role and remove any existing judge assignments.
                    </p>
                    <div>
                        <label htmlFor="judge-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Judge</label>
                        <select
                            id="judge-select"
                            value={selectedJudgeId}
                            onChange={(e) => setSelectedJudgeId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        >
                            <option value="">-- Choose a Judge --</option>
                            {judges.map(judge => (
                                <option key={judge.id} value={judge.id}>{judge.name}</option>
                            ))}
                        </select>
                         {judges.length === 0 && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">No judges are available to be assigned as coordinators.</p>}
                    </div>
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Category</label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={!selectedJudgeId}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        >
                            <option value="">-- Choose a Category --</option>
                            {PROJECT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-end p-4 border-t dark:border-gray-700 space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={isAssignDisabled}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Assigning...' : 'Assign Coordinator'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignCoordinatorModal;
