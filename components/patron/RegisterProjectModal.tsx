
import React, { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { Project, NewProject, User } from '../../types';
import { KENYA_GEOGRAPHY } from '../../data/geography';
import { PROJECT_CATEGORIES_WITH_DESCRIPTIONS } from '../../constants';
import CloseIcon from '../icons/CloseIcon';

interface RegisterProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  patronUser: User;
  projectToEdit?: Project | null;
}

const RegisterProjectModal: React.FC<RegisterProjectModalProps> = ({
  isOpen,
  onClose,
  patronUser,
  projectToEdit,
}) => {
  const { addProject, updateProject } = useProjects();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [presenters, setPresenters] = useState('');
  const [school, setSchool] = useState('');
  const [region, setRegion] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setCategory(projectToEdit.category);
      const selectedCategoryObject = PROJECT_CATEGORIES_WITH_DESCRIPTIONS.find(c => c.name === projectToEdit.category);
      setCategoryDescription(selectedCategoryObject ? selectedCategoryObject.description : '');
      setPresenters(projectToEdit.presenters.join(', '));
      setSchool(projectToEdit.school);
      setRegion(projectToEdit.region);
      setCounty(projectToEdit.county);
      setSubCounty(projectToEdit.subCounty);
    } else {
        // Reset form
        setTitle('');
        setCategory('');
        setCategoryDescription('');
        setPresenters('');
        setSchool(patronUser.school || '');
        setRegion('');
        setCounty('');
        setSubCounty('');
    }
  }, [projectToEdit, isOpen, patronUser]);

  // Cascading location logic
  useEffect(() => { setCounty(''); setSubCounty(''); }, [region]);
  useEffect(() => { setSubCounty(''); }, [county]);
  
  const regNoPreview = useMemo(() => {
    if (projectToEdit) {
        return projectToEdit.regNo;
    }
    if (county) {
        const countyCode = county.replace(/\s/g, '').slice(0, 3).toUpperCase();
        return `KSEF/${new Date().getFullYear()}/${countyCode}/... (Auto-generated on save)`;
    }
    return 'Select a county to generate Reg. No.';
  }, [county, projectToEdit]);


  const isFormValid = useMemo(() => {
    return title && category && presenters && school && region && county && subCounty;
  }, [title, category, presenters, school, region, county, subCounty]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryName = e.target.value;
    setCategory(selectedCategoryName);
    const selectedCategoryObject = PROJECT_CATEGORIES_WITH_DESCRIPTIONS.find(c => c.name === selectedCategoryName);
    setCategoryDescription(selectedCategoryObject ? selectedCategoryObject.description : '');
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
        setError("Please fill out all fields.");
        return;
    }
    setError(null);
    setIsSaving(true);
    
    const projectData: NewProject = {
      patronId: patronUser.id,
      title,
      category,
      presenters: presenters.split(',').map(p => p.trim()).filter(Boolean),
      school,
      region,
      county,
      subCounty,
    };

    try {
        let result;
        if (projectToEdit) {
            await updateProject(projectToEdit.id, projectData);
            console.log('Project updated successfully');
        } else {
            result = await addProject(projectData);
            console.log('Project added successfully:', result);
        }
        
        // Close modal on success
        onClose();
        
        // Optional: Show success message
        setTimeout(() => {
            alert(projectToEdit ? 'Project updated successfully!' : 'Project registered successfully!');
        }, 100);
        
    } catch (err) {
        console.error('Error saving project:', err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while saving the project.");
    } finally {
        setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const countiesForRegion = KENYA_GEOGRAPHY.find(r => r.name === region)?.counties || [];
  const subCountiesForCounty = countiesForRegion.find(c => c.name === county)?.subCounties || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {projectToEdit ? 'Edit Project' : 'Register New Project'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">{error}</div>}
            
            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full py-2 px-3 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <select id="category" value={category} onChange={handleCategoryChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                        <option value="">Select a Category</option>
                        {PROJECT_CATEGORIES_WITH_DESCRIPTIONS.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                    </select>
                     {categoryDescription && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            {categoryDescription}
                        </p>
                    )}
                </div>
                 <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School Name</label>
                    <input type="text" id="school" value={school} disabled className="mt-1 block w-full py-2 px-3 border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="presenters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Presenters</label>
                    <input type="text" id="presenters" value={presenters} onChange={e => setPresenters(e.target.value)} placeholder="Enter names, separated by commas" className="mt-1 block w-full py-2 px-3 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum 2 presenters. Separate names with a comma.</p>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t dark:border-gray-700">
                <label htmlFor="regNoPreview" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
                <input type="text" id="regNoPreview" value={regNoPreview} readOnly className="mt-1 block w-full py-2 px-3 border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed" />
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                 <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                    <select id="region" value={region} onChange={e => setRegion(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                        <option value="">Select Region</option>
                        {KENYA_GEOGRAPHY.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="county" className="block text-sm font-medium text-gray-700 dark:text-gray-300">County</label>
                    <select id="county" value={county} onChange={e => setCounty(e.target.value)} disabled={!region} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                        <option value="">Select County</option>
                        {countiesForRegion.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="subcounty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sub-County</label>
                    <select id="subcounty" value={subCounty} onChange={e => setSubCounty(e.target.value)} disabled={!county} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                        <option value="">Select Sub-County</option>
                        {subCountiesForCounty.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                </div>
            </div>

        </div>
        <div className="flex items-center justify-end p-4 border-t dark:border-gray-700 space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!isFormValid || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : (projectToEdit ? 'Save Changes' : 'Register Project')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterProjectModal;
