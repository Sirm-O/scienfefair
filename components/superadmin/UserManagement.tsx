

import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, NewUser } from '../../types';
import EditUserModal from './EditUserModal';
import { RoleFilter } from './SuperAdminDashboard';
import CloseIcon from '../icons/CloseIcon';
import { KENYA_GEOGRAPHY } from '../../data/geography';
import AddUserModal from '../shared/AddUserModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import UploadIcon from '../icons/UploadIcon';
import BulkRegisterModal from '../shared/BulkRegisterModal';

interface UserManagementProps {
    users: User[];
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onAddUser: (userData: NewUser) => Promise<User>;
    onRemoveUser: (userId: string) => Promise<void>;
    roleFilter: RoleFilter;
    onClearFilter: () => void;
}

const roleColorMap: Record<UserRole, string> = {
    [UserRole.SUPERADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [UserRole.NATIONAL_ADMIN]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [UserRole.REGIONAL_ADMIN]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [UserRole.COUNTY_ADMIN]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    [UserRole.SUB_COUNTY_ADMIN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [UserRole.JUDGE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [UserRole.COORDINATOR]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    [UserRole.PATRON]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const statusColorMap = {
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const UserActions: React.FC<{ user: User, onEdit: () => void, onToggleStatus: () => void, onRemove: () => void, onResetPassword: () => void }> = ({ user, onEdit, onToggleStatus, onRemove, onResetPassword }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSuperAdmin = user.role === UserRole.SUPERADMIN;

    return (
        <div className="relative" onMouseLeave={() => setIsOpen(false)}>
            <button onMouseEnter={() => setIsOpen(true)} className="px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                •••
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Manage Role</button>
                    {!isSuperAdmin && (
                        <>
                            <button onClick={() => { onResetPassword(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Reset Password</button>
                            <button onClick={() => { onToggleStatus(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => { onRemove(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">Remove</button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUser, onAddUser, onRemoveUser, roleFilter, onClearFilter }) => {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [removingUser, setRemovingUser] = useState<User | null>(null);
    const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const [regionFilter, setRegionFilter] = useState('');
    const [countyFilter, setCountyFilter] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => { setCountyFilter(''); }, [regionFilter]);
    
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 8000);
    };

    const handleAddUser = async (userData: NewUser) => {
        try {
            const newUser = await onAddUser(userData);
            if (newUser) {
                showNotification(`User ${newUser.name} created. An invitation email has been sent. Once confirmed, they can log in with the default password: ksef2026`);
            }
        } catch (error) {
            console.error("Failed to add user:", error);
            throw error;
        }
    };

    const filteredUsers = useMemo(() => {
        let processedUsers = users;
        
        if (roleFilter) {
            processedUsers = processedUsers.filter(user => {
                if (roleFilter === 'ADMIN') return user.role.toLowerCase().includes('admin');
                if (roleFilter === 'JUDGE') return user.role === UserRole.JUDGE;
                if (roleFilter === 'PATRON') return user.role === UserRole.PATRON;
                return true;
            });
        }

        if (searchTerm) {
            processedUsers = processedUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (regionFilter) {
            processedUsers = processedUsers.filter(user => user.assignedRegion === regionFilter);
        }

        if (countyFilter) {
            processedUsers = processedUsers.filter(user => user.assignedCounty === countyFilter);
        }

        return processedUsers;
    }, [users, searchTerm, roleFilter, regionFilter, countyFilter]);

    const handleConfirmResetPassword = () => {
        if (!resettingPasswordUser) return;
        // In a real app, this would trigger a backend API call.
        console.log(`Password reset link sent to ${resettingPasswordUser.email}`);
        showNotification(`A password reset link has been sent to ${resettingPasswordUser.name}.`);
        setResettingPasswordUser(null);
    };

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        await onUpdateUser(user.id, { status: newStatus });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setBulkModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Bulk Register
                    </button>
                    <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        + Add User
                    </button>
                </div>
            </div>
            
            {/* Notification Toast */}
            {notification && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md transition-opacity duration-300">
                    {notification}
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:col-span-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                />
                 <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500">
                    <option value="">Filter by Region</option>
                    {KENYA_GEOGRAPHY.map(region => <option key={region.name} value={region.name}>{region.name}</option>)}
                 </select>
                 <select value={countyFilter} onChange={e => setCountyFilter(e.target.value)} disabled={!regionFilter} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-blue-500">
                    <option value="">Filter by County</option>
                    {(KENYA_GEOGRAPHY.find(r => r.name === regionFilter)?.counties || []).map(county => <option key={county.name} value={county.name}>{county.name}</option>)}
                 </select>
            </div>

            {roleFilter && (
                <div className="flex items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filtering by: <span className="font-bold">{roleFilter}S</span>
                    </span>
                    <button onClick={onClearFilter} className="ml-2 text-red-500 hover:text-red-700">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Name</th>
                            <th scope="col" className="py-3 px-6">Role</th>
                            <th scope="col" className="py-3 px-6">Assignment</th>
                            <th scope="col" className="py-3 px-6">Status</th>
                            <th scope="col" className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-4 px-6">
                                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${roleColorMap[user.role]}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                                    {user.assignedRegion || user.assignedCounty || user.assignedSubCounty ? (
                                        <>
                                            {user.assignedSubCounty && <div>{user.assignedSubCounty}</div>}
                                            {user.assignedCounty && <div>{user.assignedCounty}</div>}
                                            {user.assignedRegion && <div>{user.assignedRegion}</div>}
                                        </>
                                    ) : 'N/A'}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${statusColorMap[user.status]}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <UserActions
                                        user={user}
                                        onEdit={() => setEditingUser(user)}
                                        onToggleStatus={() => handleToggleStatus(user)}
                                        onRemove={() => setRemovingUser(user)}
                                        onResetPassword={() => setResettingPasswordUser(user)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && <p className="text-center py-8 text-gray-500">No users match the current filters.</p>}
            </div>
            
            {/* Modals */}
            {isAddModalOpen && <AddUserModal onClose={() => setAddModalOpen(false)} onAddUser={handleAddUser} />}
            {isBulkModalOpen && currentUser && (
                <BulkRegisterModal
                    onClose={() => setBulkModalOpen(false)}
                    userContext={currentUser}
                    targetRole="admin"
                />
            )}
            {editingUser && currentUser && <EditUserModal user={editingUser} adminUser={currentUser} onClose={() => setEditingUser(null)} onSave={onUpdateUser} />}
            {removingUser && (
                <ConfirmationModal
                    title="Remove User"
                    message={`Are you sure you want to permanently remove ${removingUser.name}? This action cannot be undone.`}
                    onConfirm={async () => {
                        await onRemoveUser(removingUser.id);
                        setRemovingUser(null);
                    }}
                    onCancel={() => setRemovingUser(null)}
                />
            )}
            {resettingPasswordUser && (
                <ConfirmationModal
                    title="Reset Password"
                    message={`Are you sure you want to send a password reset link to ${resettingPasswordUser.name}?`}
                    onConfirm={handleConfirmResetPassword}
                    onCancel={() => setResettingPasswordUser(null)}
                    confirmText="Send Link"
                    isDestructive={false}
                />
            )}
        </div>
    );
};

export default UserManagement;