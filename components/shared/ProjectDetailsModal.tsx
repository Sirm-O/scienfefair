

import React from 'react';
import { Project } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import { getMockScoresForProject, DetailedProjectScores } from '../../utils/mockScores';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const DetailItem: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</h4>
    <p className="mt-1 text-md text-gray-900 dark:text-gray-100">
      {Array.isArray(value) ? value.join(', ') : value}
    </p>
  </div>
);

const ScoresDisplay: React.FC<{ scores: DetailedProjectScores }> = ({ scores }) => {
    const data = [
        { name: 'Part A', Score: scores.averageScoreA, Max: 30 },
        { name: 'Part B', Score: scores.averageScoreB, Max: 15 },
        { name: 'Part C', Score: scores.averageScoreC, Max: 35 },
    ];

    return (
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Final Judging Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-baseline p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <span className="font-semibold">Avg. Written (Part A)</span>
                        <span className="font-bold text-lg">{scores.averageScoreA.toFixed(2)} / 30</span>
                    </div>
                    <div className="flex justify-between items-baseline p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <span className="font-semibold">Avg. Oral (Part B)</span>
                        <span className="font-bold text-lg">{scores.averageScoreB.toFixed(2)} / 15</span>
                    </div>
                     <div className="flex justify-between items-baseline p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <span className="font-semibold">Avg. Project (Part C)</span>
                        <span className="font-bold text-lg">{scores.averageScoreC.toFixed(2)} / 35</span>
                    </div>
                    <div className="flex justify-between items-baseline p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-800 dark:text-blue-200">
                        <span className="font-bold">Final Total Score</span>
                        <span className="font-extrabold text-xl">{scores.finalTotalScore.toFixed(2)} / 80</span>
                    </div>
                </div>
                <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: '#4b5563',
                                    borderRadius: '0.5rem',
                                }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                            <Legend />
                            <Bar dataKey="Score" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8">
                 <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3">Individual Judge Scores</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="py-3 px-4">Judge</th>
                                <th scope="col" className="py-3 px-4 text-center">Part A</th>
                                <th scope="col" className="py-3 px-4 text-center">Part B</th>
                                <th scope="col" className="py-3 px-4 text-center">Part C</th>
                                <th scope="col" className="py-3 px-4 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.individualScores.map(score => (
                                <tr key={score.judgeName} className="border-b dark:border-gray-700 last:border-b-0">
                                    <td className="py-3 px-4 font-medium">{score.judgeName}</td>
                                    <td className="py-3 px-4 text-center font-mono">{score.totalScoreA > 0 ? score.totalScoreA.toFixed(1) : '—'}</td>
                                    <td className="py-3 px-4 text-center font-mono">{score.totalScoreB > 0 ? score.totalScoreB.toFixed(1) : '—'}</td>
                                    <td className="py-3 px-4 text-center font-mono">{score.totalScoreC > 0 ? score.totalScoreC.toFixed(1) : '—'}</td>
                                    <td className="py-3 px-4 text-center font-bold font-mono">{score.total.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};


const ProjectDetailsModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
  
  const scores = getMockScoresForProject(project);
  const showScores = project.status === 'Completed' && scores;

  const statusColorMap: Record<Project['status'], string> = {
    'Qualified': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Judging': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Conflict': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  
  const levelColorMap: Record<Project['level'], string> = {
    'Sub-County': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'County': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Regional': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'National': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl m-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {showScores ? 'Project Report Summary' : 'Project Overview'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{project.title}</h2>
            
            <div className="flex flex-wrap gap-4 items-center">
                 <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColorMap[project.status]}`}>
                    Status: {project.status}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${levelColorMap[project.level]}`}>
                    Level: {project.level}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                <DetailItem label="Registration No" value={project.regNo} />
                <DetailItem label="Category" value={project.category} />
                <DetailItem label="Presenters" value={project.presenters} />
                <DetailItem label="School" value={project.school} />
                <DetailItem label="Sub-County" value={project.subCounty} />
                <DetailItem label="County" value={project.county} />
                <DetailItem label="Region" value={project.region} />
            </div>

            {showScores ? (
                <ScoresDisplay scores={scores} />
            ) : (
                <div className="mt-6 pt-4 border-t dark:border-gray-700 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        This project is currently at the '{project.status}' stage. Scores will be available once judging is complete for the {project.level} fair.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
