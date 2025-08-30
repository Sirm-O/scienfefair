
import React, { useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { User, Project } from '../../types';
import JudgingProgressDashboard from '../shared/JudgingProgressDashboard';
import { useAuth } from '../../hooks/useAuth';
import { getMockScoresForProject } from '../../utils/mockScores';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import PieChartIcon from '../icons/PieChartIcon';

interface DashboardOverviewProps {
    user: User;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);


const DashboardOverview: React.FC<DashboardOverviewProps> = ({ user }) => {
    const { projects: allProjects } = useProjects();
    const { users: allUsers } = useAuth();
    
    const patronProjects = useMemo(() => {
        return allProjects.filter(p => p.patronId === user.id);
    }, [allProjects, user.id]);

    const stats = useMemo(() => {
        const total = patronProjects.length;
        const judging = patronProjects.filter(p => p.status === 'Judging').length;
        const completed = patronProjects.filter(p => p.status === 'Completed').length;
        return { total, judging, completed };
    }, [patronProjects]);

    const statusChartData = useMemo(() => {
        const statuses = patronProjects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<Project['status'], number>);
        return Object.entries(statuses).map(([name, value]) => ({ name, value }));
    }, [patronProjects]);

    const performanceChartData = useMemo(() => {
        const completedProjects = patronProjects.filter(p => p.status === 'Completed');
        const scoresByCategory = completedProjects.reduce((acc, p) => {
            const scores = getMockScoresForProject(p);
            if (scores) {
                if (!acc[p.category]) {
                    acc[p.category] = { totalScore: 0, count: 0 };
                }
                acc[p.category].totalScore += scores.finalTotalScore;
                acc[p.category].count++;
            }
            return acc;
        }, {} as Record<string, { totalScore: number, count: number }>);
        
        return Object.entries(scoresByCategory).map(([category, data]) => ({
            category,
            averageScore: data.totalScore / data.count,
        }));
    }, [patronProjects]);
    
    const projectsForProgressView = useMemo(() => {
        const relevantContexts = new Set(
            patronProjects
                .filter(p => p.status === 'Judging' || p.status === 'Completed')
                .map(p => `${p.level}|${p.category}`)
        );

        if (relevantContexts.size === 0) return [];

        return allProjects.filter(p => relevantContexts.has(`${p.level}|${p.category}`));
    }, [patronProjects, allProjects]);

    const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Projects" value={stats.total} icon={<PieChartIcon className="w-6 h-6" />} />
                <StatCard title="In Judging" value={stats.judging} icon={<PieChartIcon className="w-6 h-6" />} />
                <StatCard title="Completed" value={stats.completed} icon={<PieChartIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Performance by Category</h3>
                     {performanceChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                                <XAxis dataKey="category" angle={-15} textAnchor="end" height={50} interval={0} />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Bar dataKey="averageScore" fill="#3b82f6" name="Average Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px]">
                            <p className="text-gray-500">No completed projects with scores to display.</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Project Status</h3>
                    {statusChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-[300px]">
                            <p className="text-gray-500">No projects registered yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {projectsForProgressView.length > 0 && (
                <JudgingProgressDashboard 
                    projects={projectsForProgressView} 
                    users={allUsers} 
                />
            )}
        </div>
    );
};

export default DashboardOverview;
