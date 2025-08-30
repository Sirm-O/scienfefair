import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScoreSummaryProps {
  scoreA: number;
  scoreB: number;
  scoreC: number;
  maxA: number;
  maxB: number;
  maxC: number;
  judgeRole: 'A' | 'BC';
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({ scoreA, scoreB, scoreC, maxA, maxB, maxC, judgeRole }) => {
  
  const isJudgeA = judgeRole === 'A';

  const data = isJudgeA
    ? [{ name: 'Part A', Score: scoreA, 'Max Score': maxA }]
    : [
        { name: 'Part B', Score: scoreB, 'Max Score': maxB },
        { name: 'Part C', Score: scoreC, 'Max Score': maxC },
      ];

  const title = isJudgeA ? "Section A: Written" : "Section B & C: Oral/Project";

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sticky top-20">
      <h2 className="text-2xl font-bold mb-2 text-center">Score Summary</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-6">{title}</p>
      
      <div className="h-64 w-full mb-8">
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

      <div className="space-y-4">
        {isJudgeA && (
            <div className="flex justify-between items-baseline p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="font-semibold">Part A: Written Communication</span>
                <span className="font-bold text-lg">{scoreA.toFixed(1)} / {maxA}</span>
            </div>
        )}
        {!isJudgeA && (
            <>
                <div className="flex justify-between items-baseline p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Part B: Oral Communication</span>
                    <span className="font-bold text-lg">{scoreB.toFixed(1)} / {maxB}</span>
                </div>
                <div className="flex justify-between items-baseline p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Part C: Scientific Thought</span>
                    <span className="font-bold text-lg">{scoreC.toFixed(1)} / {maxC}</span>
                </div>
            </>
        )}
      </div>
      <button className="w-full mt-8 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
        Submit Final Score
      </button>
    </div>
  );
};

export default ScoreSummary;