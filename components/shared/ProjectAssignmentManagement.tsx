import React, { useState, useEffect } from 'react';
import { Project, JudgeProjectAssignment } from '../../types';
import JudgeAssignmentService from '../../services/judgeAssignmentService';
import AssignJudgeToProjectModal from './AssignJudgeToProjectModal';

interface ProjectAssignmentManagementProps {
    project: Project;
    onClose: () => void;
}

const ProjectAssignmentManagement: React.FC<ProjectAssignmentManagementProps> = ({ project, onClose }) => {
    const [assignments, setAssignments] = useState<JudgeProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [assignModalOpen, setAssignModalOpen] = useState<{ open: boolean; section?: 'A' | 'BC' }>({ open: false });

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            setError(null);
            const projectAssignments = await JudgeAssignmentService.getProjectAssignments(project.id);
            setAssignments(projectAssignments);
        } catch (err) {
            console.error('Error fetching project assignments:', err);
            setError('Failed to load project assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [project.id]);

    const handleRemoveAssignment = async (assignmentId: string) => {
        if (!confirm('Are you sure you want to remove this assignment?')) return;

        try {
            const result = await JudgeAssignmentService.removeAssignment(assignmentId);
            if (result.success) {
                await fetchAssignments(); // Refresh the list
            } else {
                alert(`Failed to remove assignment: ${result.message}`);
            }
        } catch (err) {
            console.error('Error removing assignment:', err);
            alert('Failed to remove assignment');
        }
    };

    const handleAssignSuccess = () => {
        fetchAssignments(); // Refresh assignments after successful assignment
    };

    // Group assignments by section
    const assignmentsBySection = {
        A: assignments.filter(a => a.section === 'A'),
        BC: assignments.filter(a => a.section === 'BC'),
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Judge Assignments
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {project.title} • {project.category} • {project.level}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading assignments...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Section A Assignments */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Section A (Written) - {assignmentsBySection.A.length} judge(s)
                                    </h3>
                                    <button
                                        onClick={() => setAssignModalOpen({ open: true, section: 'A' })}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Assign Judge
                                    </button>
                                </div>
                                <div className="p-4">
                                    {assignmentsBySection.A.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No judges assigned to Section A
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignmentsBySection.A.map(assignment => (
                                                <div
                                                    key={assignment.id}
                                                    className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {assignment.judge?.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {assignment.judge?.email} • {assignment.judge?.school}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Assigned: {formatDate(assignment.createdAt)}
                                                        </p>
                                                        {assignment.notes && (
                                                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                                Note: {assignment.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveAssignment(assignment.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section BC Assignments */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Section B & C (Oral/Project) - {assignmentsBySection.BC.length} judge(s)
                                    </h3>
                                    <button
                                        onClick={() => setAssignModalOpen({ open: true, section: 'BC' })}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Assign Judge
                                    </button>
                                </div>
                                <div className="p-4">
                                    {assignmentsBySection.BC.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            No judges assigned to Section B & C
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {assignmentsBySection.BC.map(assignment => (
                                                <div
                                                    key={assignment.id}
                                                    className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {assignment.judge?.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {assignment.judge?.email} • {assignment.judge?.school}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Assigned: {formatDate(assignment.createdAt)}
                                                        </p>
                                                        {assignment.notes && (
                                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                                Note: {assignment.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveAssignment(assignment.id)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Assignment Summary</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Total Judges:</span>
                                        <span className="ml-2 font-medium">{assignments.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Sections Covered:</span>
                                        <span className="ml-2 font-medium">
                                            {assignmentsBySection.A.length > 0 && assignmentsBySection.BC.length > 0 
                                                ? 'A, B & C' 
                                                : assignmentsBySection.A.length > 0 
                                                ? 'A only' 
                                                : assignmentsBySection.BC.length > 0 
                                                ? 'B & C only' 
                                                : 'None'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Assign Judge Modal */}
            {assignModalOpen.open && assignModalOpen.section && (
                <AssignJudgeToProjectModal
                    project={project}
                    section={assignModalOpen.section}
                    onClose={() => setAssignModalOpen({ open: false })}
                    onAssignSuccess={handleAssignSuccess}
                />
            )}
        </div>
    );
};

export default ProjectAssignmentManagement;