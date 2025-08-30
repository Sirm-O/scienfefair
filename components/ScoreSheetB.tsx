import React from 'react';
import { PART_B_CRITERIA } from '../constants';
import { ScoreSheetProps, Criterion } from '../types';

const CriterionRow: React.FC<{
  criterion: Criterion;
  score: number | null;
  onScoreChange: (criterionId: string, score: number | null) => void;
  index: number;
}> = ({ criterion, score, onScoreChange, index }) => {
  
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        onScoreChange(criterion.id, null);
        return;
    }
    const numValue = parseFloat(value);
    const step = criterion.step || 0.5;
    
    // Check for valid number, within range, and correct step
    if (!isNaN(numValue) && numValue >= 0 && numValue <= criterion.maxScore) {
      // Using a small epsilon for floating point comparison
      const remainder = numValue % step;
      if (remainder < 1e-5 || Math.abs(remainder - step) < 1e-5) {
          onScoreChange(criterion.id, numValue);
      }
    }
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="py-3 px-4 text-center">{index + 1}</td>
      <td className="py-3 px-4">
        <p className="font-semibold">{criterion.text}</p>
        {criterion.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{criterion.description}</p>}
      </td>
      <td className="py-3 px-4 text-center font-bold text-lg">{criterion.maxScore}</td>
      <td className="py-3 px-4">
        <input
          type="number"
          step={criterion.step || 0.5}
          min="0"
          max={criterion.maxScore}
          value={score ?? ''}
          onChange={handleScoreChange}
          className="w-24 p-2 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </td>
    </tr>
  );
};

const ScoreSheetB: React.FC<ScoreSheetProps> = ({ scores, onScoreChange }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Part B: Oral Communication (15 Marks)</h3>
       <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-16 z-[1]">
            <tr>
              <th scope="col" className="py-3 px-4 w-16 text-center">NO</th>
              <th scope="col" className="py-3 px-4">Criteria</th>
              <th scope="col" className="py-3 px-4 w-32 text-center">Max Score</th>
              <th scope="col" className="py-3 px-4 w-32 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {PART_B_CRITERIA.map((criterion, index) => (
              <CriterionRow 
                key={criterion.id}
                criterion={criterion}
                score={scores[criterion.id] ?? null}
                onScoreChange={onScoreChange}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreSheetB;