
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './Header';
import ProjectDetails from './ProjectDetails';
import Scorecard from './Scorecard';
import ScoreSummary from './ScoreSummary';
import { Project, User, UserRole, JudgeAssignment } from '../types';
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


const getMaxScore = (criteria: typeof PART_A_CRITERIA) => {
    return criteria.reduce((sum, item) => sum + item.maxScore, 0);
};

// Helper function for deterministic project selection
const simpleHash = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};


interface DashboardProps {
  user: User;
}

const JudgeDashboard: React.FC<{ user: User }> = ({ user }) => {
    const { projects } = useProjects();
    const [activeAssignment, setActiveAssignment] = useState<JudgeAssignment | null>(user.assignments?.[0] || null);
    
    const [projectScores, setProjectScores] = useState({ a: 0, b: 0, c: 0 });

    const judgeRole = activeAssignment?.section || 'A';

    const judgeLevel = useMemo(() => {
        if (user.assignedSubCounty) return 'Sub-County';
        if (user.assignedCounty) return 'County';
        if (user.assignedRegion && user.assignedRegion !== 'National') return 'Regional';
        return 'National';
    }, [user]);

    const assignedProject = useMemo(() => {
        if (!activeAssignment) {
            return 'unconfigured';
        }

        // Get all projects that are currently in the judging phase and match the judge's profile.
        const suitableProjects = projects.filter(project => {
            // Rule 1: Project must be in 'Judging' status.
            if (project.status !== 'Judging') {
                return false;
            }

            // Rule 2: Project category must match the judge's active assignment.
            if (project.category !== activeAssignment.category) {
                return false;
            }

            // Rule 3: Judge's school must not be the project's school (conflict of interest).
            if (project.school === user.school) {
                return false;
            }

            // Rule 4: Project's competition level must match the judge's assigned level.
            if (project.level !== judgeLevel) {
                return false;
            }

            // Rule 5: Project's location must be within the judge's geographical scope.
            switch (judgeLevel) {
                case 'Sub-County':
                    return project.subCounty === user.assignedSubCounty;
                case 'County':
                    return project.county === user.assignedCounty;
                case 'Regional':
                    return project.region === user.assignedRegion;
                case 'National':
                    return true; // National judges can judge any national-level project.
                default:
                    return false;
            }
        });
        
        // If no suitable projects are found, return null.
        if (suitableProjects.length === 0) {
            return null;
        }

        // Rule 6: Deterministically pick a project from the suitable pool to simulate assignment.
        // This distributes judges across available projects instead of all getting the first one.
        // The hash includes the judge's ID and their active section to ensure different assignments if a judge has multiple roles (e.g., Sec A for one category, Sec BC for another).
        const projectIndex = simpleHash(user.id + activeAssignment.section) % suitableProjects.length;
        return suitableProjects[projectIndex];
        
    }, [projects, user, judgeLevel, activeAssignment]);

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

     if (assignedProject === 'unconfigured' || !user.assignments || user.assignments.length === 0) {
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">Assignment Incomplete</h2>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Your account has not been fully configured for judging.
                        </p>
                        <p className="mt-4 text-sm text-gray-500">Please contact your administrator to be assigned a judging category and section.</p>
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
                    {user.assignments.map(assignment => (
                         <button 
                            key={`${assignment.category}-${assignment.section}`}
                            onClick={() => setActiveAssignment(assignment)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full ${activeAssignment === assignment ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600'}`}
                         >
                            {assignment.category} (Section {assignment.section})
                         </button>
                    ))}
                </div>
            </div>

            {!assignedProject && activeAssignment && (
                <div className="flex items-center justify-center h-[50vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Clear!</h2>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                           There are currently no projects awaiting your review in <span className="font-semibold">{activeAssignment.category}</span>.
                        </p>
                         <p className="mt-4 text-sm text-gray-400">Please check back later.</p>
                    </div>
                </div>
            )}

            {assignedProject && (
                <>
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
