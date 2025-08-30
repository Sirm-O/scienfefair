


import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, JudgeAssignment } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import { KENYA_GEOGRAPHY } from '../../data/geography';
import { PROJECT_CATEGORIES } from '../../constants';

interface EditUserModalProps {
  user: User;
  adminUser: User; // The logged-in administrator
  onClose: () => void;
  onSave: (userId: string, updates: Partial<User>) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, adminUser, onClose, onSave }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedRegion, setSelectedRegion] = useState(user.assignedRegion || '');
  const [selectedCounty, setSelectedCounty] = useState(user.assignedCounty || '');
  const [selectedSubCounty, setSelectedSubCounty] = useState(user.assignedSubCounty || '');
  
  // State for separate Section A and Section BC assignments
  const [assignmentA, setAssignmentA] = useState('');
  const [assignmentBC, setAssignmentBC] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  
  const isSuperAdminEditing = user.role === UserRole.SUPERADMIN;

  // Determine which location fields should be locked based on the admin's role.
  const isRegionLocked = [UserRole.REGIONAL_ADMIN, UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN].includes(adminUser.role);
  const isCountyLocked = [UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN].includes(adminUser.role);
  const isSubCountyLocked = [UserRole.SUB_COUNTY_ADMIN].includes(adminUser.role);

  useEffect(() => {
    // Initialize state from the user being edited.
    setSelectedRole(user.role);
    setSelectedRegion(user.assignedRegion || '');
    setSelectedCounty(user.assignedCounty || '');
    setSelectedSubCounty(user.assignedSubCounty || '');

    // Initialize judge assignments
    const currentAssignmentA = user.assignments?.find(a => a.section === 'A');
    const currentAssignmentBC = user.assignments?.find(a => a.section === 'BC');
    setAssignmentA(currentAssignmentA?.category || '');
    setAssignmentBC(currentAssignmentBC?.category || '');

    // Then, if the admin has jurisdictional limits, enforce them.
    // This overwrites the user's previous location if it's outside the admin's scope,
    // and pre-populates it if the user is unassigned.
    if (isRegionLocked) setSelectedRegion(adminUser.assignedRegion || '');
    if (isCountyLocked) setSelectedCounty(adminUser.assignedCounty || '');
    if (isSubCountyLocked) setSelectedSubCounty(adminUser.assignedSubCounty || '');

  }, [user, adminUser, isRegionLocked, isCountyLocked, isSubCountyLocked]);


  // This handles cascading dropdowns for high-level admins who can change the region.
  useEffect(() => {
    if (!isCountyLocked) setSelectedCounty('');
    if (!isSubCountyLocked) setSelectedSubCounty('');
  }, [selectedRegion, isCountyLocked, isSubCountyLocked]);
  
  // This handles cascading dropdowns for high-level admins who can change the county.
  useEffect(() => {
    if (!isSubCountyLocked) setSelectedSubCounty('');
  }, [selectedCounty, isSubCountyLocked]);

  const isSaveDisabled = useMemo(() => {
    if (isSaving || isSuperAdminEditing) return true;
    if (selectedRole === UserRole.REGIONAL_ADMIN && !selectedRegion) return true;
    if (selectedRole === UserRole.COUNTY_ADMIN && (!selectedRegion || !selectedCounty)) return true;
    if (selectedRole === UserRole.SUB_COUNTY_ADMIN && (!selectedRegion || !selectedCounty || !selectedSubCounty)) return true;
    return false;
  }, [isSaving, isSuperAdminEditing, selectedRole, selectedRegion, selectedCounty, selectedSubCounty]);

 const handleSave = async () => {
    if (isSaveDisabled) return;
    setIsSaving(true);

    const newAssignments: JudgeAssignment[] = [];
    if (assignmentA) {
        newAssignments.push({ category: assignmentA, section: 'A' });
    }
    if (assignmentBC) {
        newAssignments.push({ category: assignmentBC, section: 'BC' });
    }
    
    const updates: Partial<User> = {
        role: selectedRole,
        // Admin locations (also apply to judges)
        assignedRegion: [UserRole.REGIONAL_ADMIN, UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN, UserRole.JUDGE].includes(selectedRole) ? selectedRegion : undefined,
        assignedCounty: [UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN, UserRole.JUDGE].includes(selectedRole) ? selectedCounty : undefined,
        assignedSubCounty: [UserRole.SUB_COUNTY_ADMIN, UserRole.JUDGE].includes(selectedRole) ? selectedSubCounty : undefined,
        // Judge assignments are set here. If the role is changed from Judge, this sends an empty array to clear them.
        assignments: selectedRole === UserRole.JUDGE ? newAssignments : [],
    };

    // Clean up undefined values before saving
    Object.keys(updates).forEach(key => {
        const typedKey = key as keyof Partial<User>;
        if (updates[typedKey] === undefined || (typeof updates[typedKey] === 'string' && updates[typedKey] === '')) {
            delete updates[typedKey];
        }
    });

    await onSave(user.id, updates);
    setIsSaving(false);
    onClose();
  };


  const showRegion = [UserRole.REGIONAL_ADMIN, UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN, UserRole.JUDGE].includes(selectedRole);
  const showCounty = [UserRole.COUNTY_ADMIN, UserRole.SUB_COUNTY_ADMIN, UserRole.JUDGE].includes(selectedRole);
  const showSubCounty = [UserRole.SUB_COUNTY_ADMIN, UserRole.JUDGE].includes(selectedRole);

  const countiesForRegion = KENYA_GEOGRAPHY.find(r => r.name === selectedRegion)?.counties || [];
  const subCountiesForCounty = countiesForRegion.find(c => c.name === selectedCounty)?.subCounties || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage User: {user.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
           <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              disabled={isSuperAdminEditing}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role} disabled={role === UserRole.SUPERADMIN && !isSuperAdminEditing}>
                  {role}
                </option>
              ))}
            </select>
            {isSuperAdminEditing && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">The Super Administrator role cannot be changed.</p>}
          </div>
          
          {showRegion && (
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region Assignment</label>
              <select id="region" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} disabled={isRegionLocked} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">Select Region</option>
                {KENYA_GEOGRAPHY.map(region => <option key={region.name} value={region.name}>{region.name}</option>)}
              </select>
            </div>
          )}

          {showCounty && (
            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300">County Assignment</label>
              <select id="county" value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} disabled={!selectedRegion || isCountyLocked} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">Select County</option>
                {countiesForRegion.map(county => <option key={county.name} value={county.name}>{county.name}</option>)}
              </select>
            </div>
          )}

          {showSubCounty && (
             <div>
              <label htmlFor="subcounty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sub-County Assignment</label>
              <select id="subcounty" value={selectedSubCounty} onChange={e => setSelectedSubCounty(e.target.value)} disabled={!selectedCounty || isSubCountyLocked} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">Select Sub-County</option>
                {subCountiesForCounty.map(subCounty => <option key={subCounty} value={subCounty}>{subCounty}</option>)}
              </select>
            </div>
          )}

          {selectedRole === UserRole.JUDGE && (
            <div className="pt-4 mt-4 border-t dark:border-gray-600 space-y-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Judging Assignments</p>
                 <div>
                    <label htmlFor="assignmentA" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section A Assignment (Written)</label>
                    <select
                        id="assignmentA"
                        value={assignmentA}
                        onChange={e => setAssignmentA(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                    >
                        <option value="">Not Assigned</option>
                        {PROJECT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="assignmentBC" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section B & C Assignment (Oral/Project)</label>
                    <select
                        id="assignmentBC"
                        value={assignmentBC}
                        onChange={e => setAssignmentBC(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                    >
                        <option value="">Not Assigned</option>
                        {PROJECT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
         )}

        </div>
        <div className="flex items-center justify-end p-4 border-t dark:border-gray-700 space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;