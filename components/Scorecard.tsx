import React, { useState, useMemo, useCallback } from 'react';
import ScoreSheetA from './ScoreSheetA';
import ScoreSheetB from './ScoreSheetB';
import ScoreSheetC from './ScoreSheetC';
import { Scores } from '../types';
import { PART_A_CRITERIA, PART_B_CRITERIA, PART_C_CRITERIA } from '../constants';
import { getAIFeedbackSuggestion, AIFeedback } from '../services/geminiService';


interface FeedbackSectionProps {
  scores: Scores;
  judgeRole: 'A' | 'BC';
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ scores, judgeRole }) => {
    const [strengths, setStrengths] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const relevantScores = useMemo(() => {
        const criteriaIds = judgeRole === 'A'
            ? PART_A_CRITERIA.map(c => c.id)
            : [...PART_B_CRITERIA, ...PART_C_CRITERIA].map(c => c.id);

        return Object.fromEntries(
            Object.entries(scores).filter(([key]) => criteriaIds.includes(key))
        );
    }, [scores, judgeRole]);

    const handleGenerateFeedback = useCallback(async () => {
        setIsLoading(true);
        try {
            const feedback = await getAIFeedbackSuggestion(relevantScores, { strengths, recommendations });
            setStrengths(feedback.strengths);
            setRecommendations(feedback.recommendations);
        } catch (error) {
            console.error("Failed to get AI feedback:", error);
            // You can add a user-facing error message here
        } finally {
            setIsLoading(false);
        }
    }, [relevantScores, strengths, recommendations]);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">
                 {judgeRole === 'A' ? 'Feedback for Section A' : 'Feedback for the Presenters (Sections B & C)'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strengths</label>
                    <textarea
                        id="strengths"
                        rows={6}
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter project strengths..."
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recommendations</label>
                    <textarea
                        id="recommendations"
                        rows={6}
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter recommendations for improvement..."
                    ></textarea>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleGenerateFeedback}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                       '✨ Get AI Feedback Suggestions'
                    )}
                </button>
            </div>
        </div>
    );
};


interface ScorecardProps {
    onScoresUpdate: (scores: { a: number, b: number, c: number }) => void;
    judgeRole: 'A' | 'BC';
}

const Scorecard: React.FC<ScorecardProps> = ({ onScoresUpdate, judgeRole }) => {
  const [scores, setScores] = useState<Scores>({});

  const handleScoreChange = useCallback((criterionId: string, score: number | null) => {
    setScores(prevScores => ({
      ...prevScores,
      [criterionId]: score
    }));
  }, []);

  const calculateTotal = (criteria: typeof PART_A_CRITERIA) => {
    return useMemo(() => 
      criteria.reduce((total, criterion) => {
        const score = scores[criterion.id];
        return total + (typeof score === 'number' ? score : 0);
      }, 0),
    [scores, criteria]);
  };
  
  const scoreA = calculateTotal(PART_A_CRITERIA);
  const scoreB = calculateTotal(PART_B_CRITERIA);
  const scoreC = calculateTotal(PART_C_CRITERIA);

  React.useEffect(() => {
    onScoresUpdate({ a: scoreA, b: scoreB, c: scoreC });
  }, [scoreA, scoreB, scoreC, onScoresUpdate]);

  return (
    <div className="space-y-8">
        {judgeRole === 'A' && (
            <>
                <ScoreSheetA scores={scores} onScoreChange={handleScoreChange} />
                <FeedbackSection scores={scores} judgeRole="A" />
            </>
        )}
        {judgeRole === 'BC' && (
            <>
                <ScoreSheetB scores={scores} onScoreChange={handleScoreChange} />
                <ScoreSheetC scores={scores} onScoreChange={handleScoreChange} />
                <FeedbackSection scores={scores} judgeRole="BC" />
            </>
        )}
    </div>
  );
};

export default Scorecard;