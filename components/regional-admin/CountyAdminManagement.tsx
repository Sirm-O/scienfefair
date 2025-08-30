

import React, { useMemo, useState } from 'react';
import { User, UserRole, NewUser } from '../../types';
import AddUserModal from '../shared/AddUserModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import EditUserModal from '../superadmin/EditUserModal';
import UploadIcon from '../icons/UploadIcon';
import BulkRegisterModal from '../shared/BulkRegisterModal';

interface CountyAdminManagementProps {
    users: User[];
    onAddUser: (userData: NewUser) => Promise<User>;
    onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    currentUser: User;
}

const statusColorMap = {
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const CountyAdminManagement: React.FC<CountyAdminManagementProps> = ({ users, onAddUser, onUpdateUser, onRemoveUser, currentUser }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [removingAdmin, setRemovingAdmin] = useState<User | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

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

    const countyAdmins = useMemo(() => 
        users.filter(user => user.role === UserRole.COUNTY_ADMIN || user.role === UserRole.SUB_COUNTY_ADMIN), 
        [users]
    );

    const handleToggleStatus = async (admin: User) => {
        await onUpdateUser(admin.id, { status: admin.status === 'Active' ? 'Inactive' : 'Active' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">County Admin Management</h2>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setBulkModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Bulk Register Admins
                    </button>
                    <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        + Add Admin
                    </button>
                </div>
            </div>
            {notification && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
                    {notification}
                </div>
            )}
            <p className="mb-6 text-gray-500 dark:text-gray-400">
                Manage County & Sub-County Admins within the {currentUser.assignedRegion} region.
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Name</th>
                            <th scope="col" className="py-3 px-6">Assignment</th>
                            <th scope="col" className="py-3 px-6">Role</th>
                            <th scope="col" className="py-3 px-6">Status</th>
                            <th scope="col" className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {countyAdmins.map(admin => (
                            <tr key={admin.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="py-4 px-6">
                                    <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                                </td>
                                 <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                                    {admin.assignedSubCounty ? `${admin.assignedSubCounty}, ` : ''}
                                    {admin.assignedCounty}
                                </td>
                                <td className="py-4 px-6">{admin.role}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${statusColorMap[admin.status]}`}>
                                        {admin.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                     <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => setEditingUser(admin)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Manage</button>
                                        <button onClick={() => handleToggleStatus(admin)} className="font-medium text-yellow-600 dark:text-yellow-400 hover:underline">
                                           {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => setRemovingAdmin(admin)} className="font-medium text-red-600 dark:text-red-400 hover:underline">
                                            Remove
                                        </button>
                                     </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {countyAdmins.length === 0 && <p className="text-center py-8 text-gray-500">No county administrators found.</p>}
            </div>

            {isAddModalOpen && (
                <AddUserModal 
                    onClose={() => setAddModalOpen(false)} 
                    onAddUser={handleAddUser} 
                    defaultRole={UserRole.COUNTY_ADMIN}
                    allowedRoles={[UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN]}
                    predefinedData={{ assignedRegion: currentUser.assignedRegion }}
                    lockedFields={['assignedRegion']}
                />
            )}
             {isBulkModalOpen && (
                <BulkRegisterModal
                    onClose={() => setBulkModalOpen(false)}
                    userContext={currentUser}
                    targetRole="admin"
                />
            )}
            {editingUser && <EditUserModal user={editingUser} adminUser={currentUser} onClose={() => setEditingUser(null)} onSave={onUpdateUser} />}
            {removingAdmin && (
                <ConfirmationModal
                    title="Remove Admin"
                    message={`Are you sure you want to permanently remove ${removingAdmin.name}?`}
                    onConfirm={async () => {
                        await onRemoveUser(removingAdmin.id);
                        setRemovingAdmin(null);
                    }}
                    onCancel={() => setRemovingAdmin(null)}
                />
            )}
        </div>
    );
};

export default CountyAdminManagement;