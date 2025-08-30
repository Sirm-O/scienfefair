import React, { useMemo, useState } from 'react';
import { Project } from '../../types';
import { getMockScoresForProject } from '../../utils/mockScores';
import { PROJECT_CATEGORIES } from '../../constants';

interface LeadersBoardProps {
    projects: Project[];
    title: string;
}

interface RankedProject {
    id: string;
    rank: number;
    title: string;
    school: string;
    totalScore: number;
}

const LeadersBoard: React.FC<LeadersBoardProps> = ({ projects, title }) => {
    const [categoryFilter, setCategoryFilter] = useState('');

    const rankedProjects = useMemo((): RankedProject[] => {
        const scoredProjects = projects
            .map(p => {
                // Filter by category first
                if (categoryFilter && p.category !== categoryFilter) {
                    return null;
                }
                const scores = getMockScoresForProject(p);
                if (!scores) return null;
                return {
                    id: p.id,
                    title: p.title,
                    school: p.school,
                    totalScore: scores.finalTotalScore,
                };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .sort((a, b) => b.totalScore - a.totalScore);

        if (scoredProjects.length === 0) return [];

        const ranked: RankedProject[] = [];
        let rank = 1;
        for (let i = 0; i < scoredProjects.length; i++) {
            if (i > 0 && scoredProjects[i].totalScore < scoredProjects[i - 1].totalScore) {
                rank = i + 1;
            }
            ranked.push({ ...scoredProjects[i], rank });
        }
        return ranked;
    }, [projects, categoryFilter]);

    return (
        <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
                <div className="w-full sm:w-auto">
                    <label htmlFor="categoryFilterLeaderboard" className="sr-only">Filter by Category</label>
                    <select
                        id="categoryFilterLeaderboard"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {PROJECT_CATEGORIES.sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {rankedProjects.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="py-3 px-6 w-16 text-center">Rank</th>
                                <th scope="col" className="py-3 px-6">Project Title</th>
                                <th scope="col" className="py-3 px-6">School</th>
                                <th scope="col" className="py-3 px-6 w-32 text-right">Total Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankedProjects.map(p => (
                                <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-4 px-6 text-center">
                                        <span className="font-bold text-lg text-gray-900 dark:text-white">{p.rank}</span>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{p.title}</td>
                                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{p.school}</td>
                                    <td className="py-4 px-6 text-right font-bold font-mono text-lg text-blue-600 dark:text-blue-400">{p.totalScore.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No scored projects to display for the selected category.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Scores appear after projects are marked as 'Completed'.</p>
                </div>
            )}
        </div>
    );
};

export default LeadersBoard;
