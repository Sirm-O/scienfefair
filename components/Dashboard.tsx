
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './Header';
import ProjectDetails from './ProjectDetails';
import Scorecard from './Scorecard';
import ScoreSummary from './ScoreSummary';
import { Project, User, UserRole, JudgeAssignment, JudgeProjectAssignment } from '../types';
import { PART_A_CRITERIA, PART_B_CRITERIA, PART_C_CRITERIA } from '../constants';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import NationalAdminDashboard from './national-admin/NationalAdminDashboard';
import RegionalAdminDashboard from './regional-admin/RegionalAdminDashboard';
import CountyAdminDashboard from './county-admin/CountyAdminDashboard';
import SubCountyAdminDashboard from './subcounty-admin/SubCountyAdminDashboard';
import PatronDashboard from './patron/PatronDashboard';
import CoordinatorDashboard from './coordinator/CoordinatorDashboard';
import { useProjects } from '../hooks/useProjects';
import ProfileModal from './shared/ProfileModal';
import AboutModal from './shared/AboutModal';
import ForcePasswordChangeModal from './shared/ForcePasswordChangeModal';
import JudgeAssignmentService from '../services/judgeAssignmentService';


const getMaxScore = (criteria: typeof PART_A_CRITERIA) => {
    return criteria.reduce((sum, item) => sum + item.maxScore, 0);
};


interface DashboardProps {
  user: User;
}

const JudgeDashboard: React.FC<{ user: User }> = ({ user }) => {
    const { projects } = useProjects();
    const [activeAssignment, setActiveAssignment] = useState<JudgeAssignment | null>(user.assignments?.[0] || null);
    const [assignedProjects, setAssignedProjects] = useState<JudgeProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [projectScores, setProjectScores] = useState({ a: 0, b: 0, c: 0 });

    const judgeRole = activeAssignment?.section || 'A';

    const judgeLevel = useMemo(() => {
        if (user.assignedSubCounty) return 'Sub-County';
        if (user.assignedCounty) return 'County';
        if (user.assignedRegion && user.assignedRegion !== 'National') return 'Regional';
        return 'National';
    }, [user]);

    // Fetch assigned projects for this judge
    useEffect(() => {
        const fetchAssignedProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const assignments = await JudgeAssignmentService.getJudgeAssignments(user.id);
                setAssignedProjects(assignments);
            } catch (err) {
                console.error('Error fetching judge assignments:', err);
                setError('Failed to load your project assignments. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedProjects();
    }, [user.id]);

    // Get the current project for the active assignment
    const assignedProject = useMemo(() => {
        if (!activeAssignment || !assignedProjects.length) {
            return null;
        }

        // Find the assignment that matches the active assignment section and category
        const matchingAssignment = assignedProjects.find(assignment => 
            assignment.section === activeAssignment.section &&
            assignment.project?.category === activeAssignment.category &&
            assignment.status === 'Active'
        );

        return matchingAssignment?.project || null;
    }, [activeAssignment, assignedProjects]);

    const handleScoresUpdate = useCallback((scores: { a: number, b: number, c: number }) => {
        if (judgeRole === 'A') {
            setProjectScores(prev => ({ ...prev, a: scores.a }));
        } else {
            setProjectScores(prev => ({ ...prev, b: scores.b, c: scores.c }));
        }
    }, [judgeRole]);

    const maxA = getMaxScore(PART_A_CRITERIA);
    const maxB = getMaxScore(PART_B_CRITERIA);
    const maxC = getMaxScore(PART_C_CRITERIA);

    // Show loading state while fetching assignments
    if (loading) {
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading Assignments</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Fetching your project assignments...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // Show error state if fetching failed
    if (error) {
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">Error Loading Assignments</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            {error}
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // Show message if judge has no assignments
    if (!user.assignments || user.assignments.length === 0) {
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">No Category Assignments</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            You have not been assigned to any judging categories.
                        </p>
                        <p className="mt-4 text-sm text-gray-500">Please contact your administrator to be assigned to judging categories and sections.</p>
                    </div>
                </div>
            </main>
        );
    }

    // Show message if judge has no project assignments
    if (assignedProjects.length === 0) {
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">No Project Assignments</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            You have not been assigned to any projects yet.
                        </p>
                        <p className="mt-4 text-sm text-gray-500">
                            Administrators will assign projects to you when they are ready for judging. Please check back later.
                        </p>
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Your Category Assignments:</h3>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {user.assignments.map(assignment => (
                                    <span 
                                        key={`${assignment.category}-${assignment.section}`}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                    >
                                        {assignment.category} (Section {assignment.section})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
    
    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg shadow-inner border border-blue-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <p className="font-semibold text-blue-800 dark:text-blue-300">
                        My Assignments:
                    </p>
                    {user.assignments.map(assignment => {
                        // Count how many projects are assigned for this category/section combination
                        const projectCount = assignedProjects.filter(ap => 
                            ap.section === assignment.section && 
                            ap.project?.category === assignment.category
                        ).length;
                        
                        return (
                            <button 
                                key={`${assignment.category}-${assignment.section}`}
                                onClick={() => setActiveAssignment(assignment)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full ${activeAssignment === assignment ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600'}`}
                            >
                                {assignment.category} (Section {assignment.section})
                                {projectCount > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                        {projectCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {!assignedProject && activeAssignment && (
                <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Projects Assigned</h2>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                           You have no projects assigned for <span className="font-semibold">{activeAssignment.category}</span> (Section {activeAssignment.section}).
                        </p>
                        <p className="mt-4 text-sm text-gray-400">Administrators will assign projects when they are ready for judging.</p>
                    </div>
                </div>
            )}

            {assignedProject && (
                <>
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            📋 Currently judging: <span className="font-bold">{assignedProject.title}</span>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Section {judgeRole} • {activeAssignment?.category}
                        </p>
                    </div>
                    <div className="mb-8">
                        <ProjectDetails project={assignedProject} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2">
                            <Scorecard onScoresUpdate={handleScoresUpdate} judgeRole={judgeRole} />
                        </div>
                        <div className="lg:col-span-1">
                            <ScoreSummary
                                judgeRole={judgeRole}
                                scoreA={projectScores.a}
                                scoreB={projectScores.b}
                                scoreC={projectScores.c}
                                maxA={maxA}
                                maxB={maxB}
                                maxC={maxC}
                            />
                        </div>
                    </div>
                </>
            )}

        </main>
    );
};

const PlaceholderDashboard: React.FC<{user: User}> = ({ user }) => (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {user.name}!</h2>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Your {user.role} dashboard is under construction.</p>
                <p className="mt-4 text-sm text-gray-400">More features coming soon!</p>
            </div>
        </div>
    </main>
);

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isCompletingProfile, setIsCompletingProfile] = useState(false);
    const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

    useEffect(() => {
        // This effect determines if the mandatory profile completion modal should be shown.
        // It runs when the user object changes (e.g., after login).
        if (user && !hasCheckedProfile) {
            // All users except Super Administrator must complete their profile.
            const needsProfileCompletion = user.role !== UserRole.SUPERADMIN;
            const isProfileIncomplete = !user.idNumber || !user.tscNumber || !user.phoneNumber || !user.school;
            
            if (needsProfileCompletion && isProfileIncomplete) {
                setIsCompletingProfile(true);
            }
            // We mark as checked to prevent the modal from re-appearing on subsequent re-renders.
            setHasCheckedProfile(true);
        }
    }, [user, hasCheckedProfile]);


    const renderDashboardByRole = () => {
        switch(user.role) {
            case UserRole.SUPERADMIN:
                return <SuperAdminDashboard />;
            case UserRole.NATIONAL_ADMIN:
                return <NationalAdminDashboard />;
            case UserRole.REGIONAL_ADMIN:
                return <RegionalAdminDashboard user={user} />;
            case UserRole.COUNTY_ADMIN:
                return <CountyAdminDashboard user={user} />;
            case UserRole.SUB_COUNTY_ADMIN:
                return <SubCountyAdminDashboard user={user} />;
            case UserRole.JUDGE:
                return <JudgeDashboard user={user} />;
            case UserRole.COORDINATOR:
                return <CoordinatorDashboard user={user} />;
            case UserRole.PATRON:
                return <PatronDashboard user={user} />;
            default:
                return <PlaceholderDashboard user={user} />;
        }
    }
    
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
            <Header 
                user={user} 
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenAbout={() => setIsAboutModalOpen(true)}
            />

            {/* Optional profile modal */}
            {isProfileModalOpen && (
                <ProfileModal 
                    user={user} 
                    onClose={() => setIsProfileModalOpen(false)} 
                />
            )}
            {isAboutModalOpen && (
                <AboutModal onClose={() => setIsAboutModalOpen(false)} />
            )}

            {/* Mandatory profile completion modal */}
            {isCompletingProfile ? (
                 <ProfileModal
                    user={user}
                    onClose={() => {}} // No-op, cannot be closed
                    isMandatory={true}
                    onCompletion={() => {
                        // The user state update in useAuth will trigger a re-render
                        // and cause this component to disappear automatically.
                        // Setting state here provides a faster visual feedback.
                        setIsCompletingProfile(false);
                    }}
                />
            ) : (
                renderDashboardByRole()
            )}
        </div>
    );
};

export default Dashboard;
