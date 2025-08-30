



import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CloseIcon from '../icons/CloseIcon';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  isMandatory?: boolean;
  onCompletion?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, isMandatory = false, onCompletion }) => {
  const { updateUser } = useAuth();

  const [name, setName] = useState(user.name);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [idNumber, setIdNumber] = useState(user.idNumber || '');
  const [tscNumber, setTscNumber] = useState(user.tscNumber || '');
  const [school, setSchool] = useState(user.school || '');
  const [subject1, setSubject1] = useState(user.teachingSubjects?.[0] || '');
  const [subject2, setSubject2] = useState(user.teachingSubjects?.[1] || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // All users except the Super Administrator need to provide detailed biodata.
  const needsBiodata = user.role !== UserRole.SUPERADMIN;
  
  const commonInputClass = "mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700";

  const handleSave = async () => {
    // Basic validation for mandatory fields if they are required for the role.
    if (isMandatory && needsBiodata && (!phoneNumber || !idNumber || !tscNumber || !school)) {
        setError("Please fill in all required fields: Phone Number, ID Number, TSC Number, and School.");
        return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    const updates: Partial<User> = { name, phoneNumber };
    if (needsBiodata) {
        updates.idNumber = idNumber;
        updates.tscNumber = tscNumber;
        updates.school = school;
        updates.teachingSubjects = [subject1, subject2].map(s => s.trim()).filter(Boolean);
    }
    
    try {
        await updateUser(user.id, updates);
        setSuccess('Profile updated successfully!');
        
        if (isMandatory) {
            onCompletion?.();
        } else {
            setTimeout(() => setSuccess(null), 3000);
        }

    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{isMandatory ? 'Complete Your Profile' : 'Edit My Profile'}</h3>
          {!isMandatory && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <CloseIcon className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {isMandatory && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                    <strong>Welcome!</strong> Please complete your profile information below to continue to your dashboard.
                </div>
            )}
            {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">{error}</div>}
            {success && !isMandatory && <div className="p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input id="email" type="email" value={user.email} disabled className={`${commonInputClass} bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed`} />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <input id="role" type="text" value={user.role} disabled className={`${commonInputClass} bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed`} />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={commonInputClass} />
                </div>
                 <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number {needsBiodata && <span className="text-red-500">*</span>}</label>
                    <input id="phoneNumber" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={commonInputClass} />
                </div>

                {needsBiodata && (
                    <>
                        <div className="md:col-span-2"><hr className="my-2 dark:border-gray-600"/></div>
                        <div>
                            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID Number <span className="text-red-500">*</span></label>
                            <input id="idNumber" type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} className={commonInputClass} />
                        </div>
                        <div>
                            <label htmlFor="tscNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">TSC Number <span className="text-red-500">*</span></label>
                            <input id="tscNumber" type="text" value={tscNumber} onChange={e => setTscNumber(e.target.value)} className={commonInputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School <span className="text-red-500">*</span></label>
                            <input id="school" type="text" value={school} onChange={e => setSchool(e.target.value)} className={commonInputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Subjects</label>
                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="Subject 1" value={subject1} onChange={e => setSubject1(e.target.value)} className={commonInputClass.replace("mt-1 ", "")} />
                                <input type="text" placeholder="Subject 2 (Optional)" value={subject2} onChange={e => setSubject2(e.target.value)} className={commonInputClass.replace("mt-1 ", "")} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
        <div className="flex items-center justify-end p-4 border-t dark:border-gray-700 space-x-2">
          {!isMandatory && (
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                Close
            </button>
          )}
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : (isMandatory ? 'Save & Continue' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;