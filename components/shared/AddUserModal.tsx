

import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import { KENYA_GEOGRAPHY } from '../../data/geography';

type NewUser = Omit<User, 'id' | 'status'>;

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (userData: NewUser) => Promise<User | void>;
  defaultRole?: UserRole;
  allowedRoles?: UserRole[];
  predefinedData?: Partial<NewUser>;
  lockedFields?: (keyof NewUser)[];
}

const AddUserModal: React.FC<AddUserModalProps> = ({ 
  onClose, 
  onAddUser, 
  defaultRole, 
  allowedRoles,
  predefinedData = {},
  lockedFields = [] 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole || predefinedData.role || UserRole.PATRON);
  const [assignedRegion, setAssignedRegion] = useState(predefinedData.assignedRegion || '');
  const [assignedCounty, setAssignedCounty] = useState(predefinedData.assignedCounty || '');
  const [assignedSubCounty, setAssignedSubCounty] = useState(predefinedData.assignedSubCounty || '');

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const availableRoles = allowedRoles || Object.values(UserRole).filter(r => r !== UserRole.SUPERADMIN);

  // Cascading dropdown logic
  useEffect(() => {
    if (!lockedFields.includes('assignedCounty')) setAssignedCounty('');
    if (!lockedFields.includes('assignedSubCounty')) setAssignedSubCounty('');
  }, [assignedRegion, lockedFields]);

  useEffect(() => {
    if (!lockedFields.includes('assignedSubCounty')) setAssignedSubCounty('');
  }, [assignedCounty, lockedFields]);

  useEffect(() => {
    if (role !== UserRole.REGIONAL_ADMIN && role !== UserRole.COUNTY_ADMIN && role !== UserRole.SUB_COUNTY_ADMIN) {
      if (!lockedFields.includes('assignedRegion')) setAssignedRegion('');
    }
    if (role !== UserRole.COUNTY_ADMIN && role !== UserRole.SUB_COUNTY_ADMIN) {
      if (!lockedFields.includes('assignedCounty')) setAssignedCounty('');
    }
    if (role !== UserRole.SUB_COUNTY_ADMIN) {
      if (!lockedFields.includes('assignedSubCounty')) setAssignedSubCounty('');
    }
  }, [role, lockedFields]);
  

  const isSaveDisabled = useMemo(() => {
    if (isSaving || !name || !email) return true;
    if (role === UserRole.REGIONAL_ADMIN && !assignedRegion) return true;
    if (role === UserRole.COUNTY_ADMIN && (!assignedRegion || !assignedCounty)) return true;
    if (role === UserRole.SUB_COUNTY_ADMIN && (!assignedRegion || !assignedCounty || !assignedSubCounty)) return true;
    return false;
  }, [isSaving, name, email, role, assignedRegion, assignedCounty, assignedSubCounty]);


  const handleSave = async () => {
    if (isSaveDisabled) return;
    setError(null);
    setIsSaving(true);
    try {
      console.log('AddUserModal: Saving user with data:', { name, email, role, assignedRegion, assignedCounty, assignedSubCounty });
      const userData: NewUser = { name, email, role };
      if (assignedRegion) userData.assignedRegion = assignedRegion;
      if (assignedCounty) userData.assignedCounty = assignedCounty;
      if (assignedSubCounty) userData.assignedSubCounty = assignedSubCounty;

      await onAddUser(userData);
      console.log('AddUserModal: User created successfully');
      onClose();
    } catch (err) {
      console.error('AddUserModal: Error saving user:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Error saving user: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const showRegion = [UserRole.REGIONAL_ADMIN, UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN].includes(role);
  const showCounty = [UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN].includes(role);
  const showSubCounty = [UserRole.SUB_COUNTY_ADMIN].includes(role);

  const countiesForRegion = KENYA_GEOGRAPHY.find(r => r.name === assignedRegion)?.counties || [];
  const subCountiesForCounty = countiesForRegion.find(c => c.name === assignedCounty)?.subCounties || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full py-2 px-3 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full py-2 px-3 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
              {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {showRegion && (
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
              <select id="region" value={assignedRegion} onChange={e => setAssignedRegion(e.target.value)} disabled={lockedFields.includes('assignedRegion')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">Select Region</option>
                {KENYA_GEOGRAPHY.map(region => <option key={region.name} value={region.name}>{region.name}</option>)}
              </select>
            </div>
          )}

          {showCounty && (
            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300">County</label>
              <select id="county" value={assignedCounty} onChange={e => setAssignedCounty(e.target.value)} disabled={!assignedRegion || lockedFields.includes('assignedCounty')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">Select County</option>
                {countiesForRegion.map(county => <option key={county.name} value={county.name}>{county.name}</option>)}
              </select>
            </div>
          )}

           {showSubCounty && (
             <div>
              <label htmlFor="subcounty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sub-County</label>
              <select id="subcounty" value={assignedSubCounty} onChange={e => setAssignedSubCounty(e.target.value)} disabled={!assignedCounty || lockedFields.includes('assignedSubCounty')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">Select Sub-County</option>
                {subCountiesForCounty.map(subCounty => <option key={subCounty} value={subCounty}>{subCounty}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end p-4 border-t dark:border-gray-700 space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaveDisabled} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
            {isSaving ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;