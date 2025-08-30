import React, { useState, useEffect } from 'react';
import { User, Project, CreateJudgeAssignmentData } from '../../types';
import JudgeAssignmentService from '../../services/judgeAssignmentService';
import CloseIcon from '../icons/CloseIcon';

interface AssignJudgeToProjectModalProps {
    project: Project;
    section: 'A' | 'BC';
    onClose: () => void;
    onAssignSuccess: () => void;
}

const AssignJudgeToProjectModal: React.FC<AssignJudgeToProjectModalProps> = ({ 
    project, 
    section, 
    onClose, 
    onAssignSuccess 
}) => {
    const [availableJudges, setAvailableJudges] = useState<User[]>([]);
    const [selectedJudgeId, setSelectedJudgeId] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvailableJudges = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const judges = await JudgeAssignmentService.getAvailableJudges(project.id, section);
                setAvailableJudges(judges);
            } catch (err) {
                console.error('Error fetching available judges:', err);
                setError('Failed to load available judges');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailableJudges();
    }, [project.id, section]);

    const handleAssign = async () => {
        if (!selectedJudgeId) return;

        try {
            setIsSaving(true);
            setError(null);

            const assignmentData: CreateJudgeAssignmentData = {
                judgeId: selectedJudgeId,
                projectId: project.id,
                section,
                notes: notes.trim() || undefined,
            };

            const result = await JudgeAssignmentService.createAssignment(assignmentData);
            
            if (result.success) {
                onAssignSuccess();
                onClose();
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Error creating assignment:', err);
            setError('Failed to create assignment');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAutoAssign = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const results = await JudgeAssignmentService.autoAssignJudges(project.id, section);
            
            const successCount = results.filter(r => r.success).length;
            if (successCount > 0) {
                onAssignSuccess();
                onClose();
            } else {
                const errors = results.filter(r => !r.success).map(r => r.message);
                setError(`Auto-assignment failed: ${errors.join(', ')}`);
            }
        } catch (err) {
            console.error('Error auto-assigning judges:', err);
            setError('Failed to auto-assign judges');
        } finally {
            setIsSaving(false);
        }
    };

    const isAssignDisabled = !selectedJudgeId || isSaving;
    const isAutoAssignDisabled = isSaving || availableJudges.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Assign Judge - Section {section}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Project Info */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-medium text-blue-800 dark:text-blue-300">
                            {project.title}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            {project.category} • {project.level} • {project.school}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>\n                            <p className="text-sm text-gray-500">Loading available judges...</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="judge-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Judge
                                </label>
                                <select
                                    id="judge-select"
                                    value={selectedJudgeId}
                                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Choose a Judge --</option>
                                    {availableJudges.map(judge => (
                                        <option key={judge.id} value={judge.id}>
                                            {judge.name} ({judge.school})
                                        </option>
                                    ))}
                                </select>
                                
                                {availableJudges.length === 0 && (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                        No eligible judges available for this project and section.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes about this assignment..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-between items-center p-6 border-t dark:border-gray-700 space-x-3">
                    <button
                        onClick={handleAutoAssign}
                        disabled={isAutoAssignDisabled}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                        {isSaving ? 'Auto-Assigning...' : 'Auto-Assign'}
                    </button>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={isAssignDisabled}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Assigning...' : 'Assign Judge'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignJudgeToProjectModal;