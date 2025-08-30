

import React, { useState, useMemo } from 'react';
import { User, UserRole, NewUser, JudgeAssignment } from '../../types';
import AddUserModal from './AddUserModal';
import ConfirmationModal from './ConfirmationModal';
import EditUserModal from '../superadmin/EditUserModal';
import UploadIcon from '../icons/UploadIcon';
import BulkRegisterModal from './BulkRegisterModal';
import AssignCoordinatorModal from './AssignCoordinatorModal';

interface JudgesAndCoordinatorsProps {
    users: User[];
    onAddUser: (userData: NewUser) => Promise<User>;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    currentUser: User;
    level: 'National' | 'Regional' | 'County' | 'Sub-County';
}

type ActiveTab = 'judges' | 'coordinators';

const statusColorMap = {
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const JudgesAndCoordinators: React.FC<JudgesAndCoordinatorsProps> = ({ users, onAddUser, onUpdateUser, onRemoveUser, currentUser, level }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('judges');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const [isAssignCoordinatorModalOpen, setAssignCoordinatorModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [removingUser, setRemovingUser] = useState<User | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 8000);
    };

    const handleAddUser = async (userData: NewUser) => {
        try {
            console.log('JudgesAndCoordinators: Adding user with data:', userData);
            const newUser = await onAddUser(userData);
            if (newUser) {
                console.log('JudgesAndCoordinators: User created successfully:', newUser);
                showNotification(`User ${newUser.name} created successfully. An invitation email has been sent. The default password is: ksef2026`);
            }
        } catch (error) {
            console.error("JudgesAndCoordinators: Failed to add user:", error);
            // Show a user-friendly error message
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while creating the user.';
            showNotification(`Error: ${errorMessage}`);
            throw error; // Re-throw to let AddUserModal handle it
        }
    };
    
    const { judges, coordinators } = useMemo(() => {
        const judges = users.filter(u => u.role === UserRole.JUDGE);
        const coordinators = users.filter(u => u.role === UserRole.COORDINATOR);
        return { judges, coordinators };
    }, [users]);
    
    const handleToggleStatus = async (user: User) => {
        await onUpdateUser(user.id, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
    };

    const handleAssignCoordinator = async (userId: string, category: string) => {
        await onUpdateUser(userId, {
            role: UserRole.COORDINATOR,
            coordinatorCategory: category,
            assignments: [], // Clear judge assignments
        });
    };
    
    const renderAssignments = (assignments?: JudgeAssignment[]) => {
        if (!assignments || assignments.length === 0) {
            return <span className="text-gray-400">Not Assigned</span>;
        }
        return assignments.map(a => `${a.category} (Sec ${a.section})`).join(', ');
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{level} Judge & Coordinator Management</h2>
                    <div className="flex space-x-4 mt-2">
                        <button onClick={() => setActiveTab('judges')} className={`pb-2 font-semibold ${activeTab === 'judges' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Judges</button>
                        <button onClick={() => setActiveTab('coordinators')} className={`pb-2 font-semibold ${activeTab === 'coordinators' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Coordinators</button>
                    </div>
                </div>
                {activeTab === 'judges' && (
                     <div className="flex items-center space-x-2">
                        <button onClick={() => setBulkModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                            <UploadIcon className="w-4 h-4 mr-2" />
                            Bulk Register Judges
                        </button>
                        <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            + Add Judge
                        </button>
                    </div>
                )}
                 {activeTab === 'coordinators' && (
                     <div className="flex items-center space-x-2">
                        <button onClick={() => setAssignCoordinatorModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            + Assign Coordinator
                        </button>
                    </div>
                )}
            </div>
             {notification && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
                    {notification}
                </div>
            )}
            {/* Content based on tab */}
            <div className="mt-4">
                {activeTab === 'judges' ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="py-3 px-6">Name</th>
                                    <th scope="col" className="py-3 px-6">Assignments</th>
                                    <th scope="col" className="py-3 px-6">Status</th>
                                    <th scope="col" className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                             <tbody>
                                {judges.map(judge => (
                                    <tr key={judge.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-4 px-6"><p className="font-medium text-gray-900 dark:text-white">{judge.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{judge.email}</p></td>
                                        <td className="py-4 px-6">{renderAssignments(judge.assignments)}</td>
                                        <td className="py-4 px-6"><span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${statusColorMap[judge.status]}`}>{judge.status}</span></td>
                                        <td className="py-4 px-6 text-right"><div className="flex items-center justify-end space-x-2"><button onClick={() => setEditingUser(judge)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Manage</button><button onClick={() => handleToggleStatus(judge)} className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline">{judge.status === 'Active' ? 'Deactivate' : 'Activate'}</button><button onClick={() => setRemovingUser(judge)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Remove</button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {judges.length === 0 && <p className="text-center py-8 text-gray-500">No judges found for this level.</p>}
                    </div>
                ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="py-3 px-6">Name</th>
                                    <th scope="col" className="py-3 px-6">Assigned Category</th>
                                    <th scope="col" className="py-3 px-6">Status</th>
                                    <th scope="col" className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coordinators.map(coord => (
                                    <tr key={coord.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-4 px-6"><p className="font-medium text-gray-900 dark:text-white">{coord.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{coord.email}</p></td>
                                        <td className="py-4 px-6">{coord.coordinatorCategory}</td>
                                        <td className="py-4 px-6"><span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${statusColorMap[coord.status]}`}>{coord.status}</span></td>
                                        <td className="py-4 px-6 text-right"><div className="flex items-center justify-end space-x-2"><button onClick={() => setEditingUser(coord)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Manage</button><button onClick={() => handleToggleStatus(coord)} className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline">{coord.status === 'Active' ? 'Deactivate' : 'Activate'}</button><button onClick={() => setRemovingUser(coord)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Remove</button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {coordinators.length === 0 && <p className="text-center py-8 text-gray-500">No coordinators found for this level.</p>}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isAddModalOpen && (
                <AddUserModal 
                    onClose={() => setAddModalOpen(false)} 
                    onAddUser={handleAddUser} 
                    defaultRole={UserRole.JUDGE}
                    allowedRoles={[UserRole.JUDGE]}
                    predefinedData={{ 
                        assignedRegion: currentUser.assignedRegion, 
                        assignedCounty: currentUser.assignedCounty,
                        assignedSubCounty: currentUser.assignedSubCounty
                    }}
                    lockedFields={['assignedRegion', 'assignedCounty', 'assignedSubCounty'].filter(Boolean) as any}
                />
            )}
             {isBulkModalOpen && (
                <BulkRegisterModal
                    onClose={() => setBulkModalOpen(false)}
                    userContext={currentUser}
                    targetRole="judge"
                />
            )}
             {isAssignCoordinatorModalOpen && (
                <AssignCoordinatorModal
                    judges={judges}
                    onClose={() => setAssignCoordinatorModalOpen(false)}
                    onAssign={handleAssignCoordinator}
                />
            )}
            {editingUser && <EditUserModal user={editingUser} adminUser={currentUser} onClose={() => setEditingUser(null)} onSave={onUpdateUser} />}
            {removingUser && (
                <ConfirmationModal
                    title={`Remove ${removingUser.role}`}
                    message={`Are you sure you want to permanently remove ${removingUser.name}?`}
                    onConfirm={async () => {
                        await onRemoveUser(removingUser.id);
                        setRemovingUser(null);
                    }}
                    onCancel={() => setRemovingUser(null)}
                />
            )}
        </div>
    );
};

export default JudgesAndCoordinators;