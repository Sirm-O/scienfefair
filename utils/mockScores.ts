


import { Project, User, UserRole, Criterion } from '../types';
import { MOCK_USERS } from '../data/users';
// FIX: `Criterion` is not exported from `constants`. It is imported from `types` above.
import { PART_A_CRITERIA, PART_B_CRITERIA, PART_C_CRITERIA } from '../constants';

export interface IndividualJudgeScore {
    judgeName: string;
    judgeSection: 'A' | 'BC';
    scores: Record<string, number>; // Criterion ID -> Score
    feedback: {
        strengths: string;
        recommendations: string;
    };
    totalScoreA: number;
    totalScoreB: number;
    totalScoreC: number;
    total: number;
}

export interface DetailedProjectScores {
    individualScores: IndividualJudgeScore[];
    averageScoreA: number;
    averageScoreB: number;
    averageScoreC: number;
    finalTotalScore: number;
}


// Simple hash function to get a number from a string for deterministic "randomness"
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// Helper to deterministically pick two unique judges, returns null if not enough are available
const pickTwoUniqueJudges = (judgeList: User[], project: Project, section: 'A' | 'BC'): [User, User] | null => {
    if (judgeList.length < 2) return null;
    
    // Deterministic selection
    const index1 = simpleHash(project.id + section + '1') % judgeList.length;
    const judge1 = judgeList[index1];

    // Get the rest of the judges and pick from them to ensure uniqueness
    const remainingJudges = judgeList.filter(j => j.id !== judge1.id);
    const index2 = simpleHash(project.id + section + '2') % remainingJudges.length;
    const judge2 = remainingJudges[index2];

    return [judge1, judge2];
};

const generateScoresForCriteria = (criteria: Criterion[], seed: number): { scores: Record<string, number>, total: number } => {
    const scores: Record<string, number> = {};
    let total = 0;
    criteria.forEach((c, i) => {
        // More variability: base score + random element, respecting step.
        const baseScoreRatio = (simpleHash(c.id + seed + i) % 70) / 100; // 0 to 0.7
        const randomFactor = (simpleHash(seed + c.id) % 30) / 100; // 0 to 0.3
        const finalRatio = Math.min(1, baseScoreRatio + randomFactor + 0.1); // Add a base to avoid too many low scores
        const rawScore = c.maxScore * finalRatio;
        const step = c.step || 0.5;
        const score = Math.min(c.maxScore, Math.round(rawScore / step) * step);
        scores[c.id] = score;
        total += score;
    });
    return { scores, total };
}

const generateMockFeedback = (seed: number): { strengths: string, recommendations: string } => {
    const strengthsOptions = [
        "Excellent background research and a well-structured write-up. The scientific language used was appropriate and clear.",
        "The oral presentation was highly engaging and demonstrated a deep, confident understanding of the research topic.",
        "A very creative and innovative approach to solving a relevant, real-world problem. The authenticity of the work is commendable.",
        "The project's methodology was sound, logical, and well-documented, showing a clear thought process.",
        "Strong data collection and analysis, leading to valid and well-supported conclusions. The use of graphs was effective."
    ];
    const recommendationsOptions = [
        "Consider expanding the sample size or conducting more trials to provide more robust and statistically significant data.",
        "The display board could be reorganized for a more logical flow to better guide the viewer through the project story.",
        "While knowledgeable, practicing the oral presentation more could enhance self-confidence and reduce reliance on notes.",
        "A more extensive literature review could further strengthen the introduction and provide more context for the discussion section.",
        "Explore the practical, real-world applications and potential future extensions of the project's findings in greater detail."
    ];

    return {
        strengths: strengthsOptions[seed % strengthsOptions.length],
        recommendations: recommendationsOptions[(seed + 1) % recommendationsOptions.length]
    };
};


export const getMockScoresForProject = (project: Project): DetailedProjectScores | null => {
    const hasBeenJudged = project.status === 'Completed';
    
    if (!hasBeenJudged) {
        return null;
    }

    const activeJudges = MOCK_USERS.filter(
        (u): u is User & { role: UserRole.JUDGE } => u.role === UserRole.JUDGE && u.status === 'Active'
    );
    
    // FIX: Corrected judge filtering logic to use the 'assignments' array instead of non-existent 'assignedSection'.
    const eligibleJudges = activeJudges.filter(judge => {
        if (!judge.assignments || judge.assignments.length === 0) return false; // Must have an assignment
        if (judge.assignedRegion === 'National') return true;
        if (judge.assignedRegion && judge.assignedRegion !== project.region) return false;
        if (judge.assignedCounty && judge.assignedCounty !== project.county) return false;
        if (judge.assignedSubCounty && judge.assignedSubCounty !== project.subCounty) return false;
        return true;
    });

    let judgesA = eligibleJudges.filter(j => j.assignments?.some(a => a.section === 'A'));
    let judgesBC = eligibleJudges.filter(j => j.assignments?.some(a => a.section === 'BC'));

    if (judgesA.length < 2) {
        const nationalJudgesA = activeJudges.filter(j => j.assignments?.some(a => a.section === 'A') && j.assignedRegion === 'National');
        judgesA = [...new Set([...judgesA, ...nationalJudgesA])];
    }
     if (judgesBC.length < 2) {
        const nationalJudgesBC = activeJudges.filter(j => j.assignments?.some(a => a.section === 'BC') && j.assignedRegion === 'National');
        judgesBC = [...new Set([...judgesBC, ...nationalJudgesBC])];
    }
    
    const judgePairA = pickTwoUniqueJudges(judgesA, project, 'A');
    const judgePairBC = pickTwoUniqueJudges(judgesBC, project, 'BC');

    // If we can't find enough mock judges, we can't generate a mock score.
    if (!judgePairA || !judgePairBC) {
        return null;
    }

    const [judgeA1, judgeA2] = judgePairA;
    const [judgeBC1, judgeBC2] = judgePairBC;

    const timeSeed = new Date().getMinutes();

    // Judge A1
    const seedA1 = simpleHash(project.id + judgeA1.id) + timeSeed;
    const scoresA1Data = generateScoresForCriteria(PART_A_CRITERIA, seedA1);
    const individualScoreA1: IndividualJudgeScore = {
        judgeName: judgeA1.name,
        judgeSection: 'A',
        scores: scoresA1Data.scores,
        feedback: generateMockFeedback(seedA1),
        totalScoreA: scoresA1Data.total,
        totalScoreB: 0,
        totalScoreC: 0,
        total: scoresA1Data.total,
    };

    // Judge A2
    const seedA2 = simpleHash(project.id + judgeA2.id) + timeSeed;
    const scoresA2Data = generateScoresForCriteria(PART_A_CRITERIA, seedA2);
    const individualScoreA2: IndividualJudgeScore = {
        judgeName: judgeA2.name,
        judgeSection: 'A',
        scores: scoresA2Data.scores,
        feedback: generateMockFeedback(seedA2),
        totalScoreA: scoresA2Data.total,
        totalScoreB: 0,
        totalScoreC: 0,
        total: scoresA2Data.total,
    };
    
    // Judge BC1
    const seedBC1 = simpleHash(project.id + judgeBC1.id) + timeSeed;
    const scoresB1Data = generateScoresForCriteria(PART_B_CRITERIA, seedBC1);
    const scoresC1Data = generateScoresForCriteria(PART_C_CRITERIA, seedBC1 + 1);
    const individualScoreBC1: IndividualJudgeScore = {
        judgeName: judgeBC1.name,
        judgeSection: 'BC',
        scores: { ...scoresB1Data.scores, ...scoresC1Data.scores },
        feedback: generateMockFeedback(seedBC1),
        totalScoreA: 0,
        totalScoreB: scoresB1Data.total,
        totalScoreC: scoresC1Data.total,
        total: scoresB1Data.total + scoresC1Data.total,
    };

    // Judge BC2
    const seedBC2 = simpleHash(project.id + judgeBC2.id) + timeSeed;
    const scoresB2Data = generateScoresForCriteria(PART_B_CRITERIA, seedBC2);
    const scoresC2Data = generateScoresForCriteria(PART_C_CRITERIA, seedBC2 + 1);
    const individualScoreBC2: IndividualJudgeScore = {
        judgeName: judgeBC2.name,
        judgeSection: 'BC',
        scores: { ...scoresB2Data.scores, ...scoresC2Data.scores },
        feedback: generateMockFeedback(seedBC2),
        totalScoreA: 0,
        totalScoreB: scoresB2Data.total,
        totalScoreC: scoresC2Data.total,
        total: scoresB2Data.total + scoresC2Data.total,
    };

    const individualScores = [individualScoreA1, individualScoreA2, individualScoreBC1, individualScoreBC2];

    const averageScoreA = (individualScoreA1.totalScoreA + individualScoreA2.totalScoreA) / 2;
    const averageScoreB = (individualScoreBC1.totalScoreB + individualScoreBC2.totalScoreB) / 2;
    const averageScoreC = (individualScoreBC1.totalScoreC + individualScoreBC2.totalScoreC) / 2;
    const finalTotalScore = averageScoreA + averageScoreB + averageScoreC;

    return {
        individualScores,
        averageScoreA,
        averageScoreB,
        averageScoreC,
        finalTotalScore,
    };
};

export type JudgingProgress = {
    judgesScored: number;
    totalJudges: number;
};

export type PromotionStatus = 'Promoted' | 'Not Promoted' | 'Pending Ranking';


export const getJudgingProgressForAllProjects = (projects: Project[]): Record<string, JudgingProgress> => {
    const progressMap: Record<string, JudgingProgress> = {};

    projects.forEach(project => {
        const totalJudges = 4; // 2 for A, 2 for BC
        let judgesScored = 0;

        switch (project.status) {
            case 'Qualified':
                judgesScored = 0;
                break;
            case 'Judging':
                // Deterministically choose 1, 2, or 3 based on project ID
                judgesScored = (simpleHash(project.id) % 3) + 1;
                break;
            case 'Completed':
                judgesScored = 4;
                break;
        }
        progressMap[project.id] = { judgesScored, totalJudges };
    });
    return progressMap;
};

export const getRankingForAllProjects = (projects: Project[]): Record<string, PromotionStatus> => {
    const promotionStatusMap: Record<string, PromotionStatus> = {};
    const projectsByLevelAndCategory: Record<string, Project[]> = {};

    // Group projects by level and category
    projects.forEach(p => {
        const key = `${p.level}-${p.category}`;
        if (!projectsByLevelAndCategory[key]) {
            projectsByLevelAndCategory[key] = [];
        }
        projectsByLevelAndCategory[key].push(p);
    });

    // Process each group
    Object.values(projectsByLevelAndCategory).forEach(group => {
        const allCompleted = group.every(p => p.status === 'Completed');

        if (allCompleted && group.length > 0) {
            const scoredAndRanked = group
                .map(p => ({ project: p, score: getMockScoresForProject(p)?.finalTotalScore ?? -1 }))
                .filter(item => item.score !== -1) // Ensure we only rank projects with scores
                .sort((a, b) => b.score - a.score);

            scoredAndRanked.forEach((item, index) => {
                // Top 4 are promoted
                promotionStatusMap[item.project.id] = (index < 4) ? 'Promoted' : 'Not Promoted';
            });
        } else {
            group.forEach(p => {
                if (p.status === 'Completed') {
                    promotionStatusMap[p.id] = 'Pending Ranking';
                }
            });
        }
    });

    return promotionStatusMap;
};

const LEVEL_HIERARCHY: Project['level'][] = ['Sub-County', 'County', 'Regional', 'National'];

// New function to process projects and determine their effective level and status
export const processProjects = (projects: Project[]) => {
    const promotionStatusMap = getRankingForAllProjects(projects);

    return projects.map(project => {
        let effectiveLevel = project.level;
        let effectiveStatus = project.status;

        // Check for promotion
        if (project.status === 'Completed' && promotionStatusMap[project.id] === 'Promoted') {
            const currentLevelIndex = LEVEL_HIERARCHY.indexOf(project.level);
            // Ensure we are not at the final level
            if (currentLevelIndex < LEVEL_HIERARCHY.length - 1) {
                effectiveLevel = LEVEL_HIERARCHY[currentLevelIndex + 1];
                effectiveStatus = 'Qualified'; // Reset status for the new level
            }
        }

        return {
            ...project,
            effectiveLevel,
            effectiveStatus,
        };
    });
};

// --- NEW DETAILED JUDGING STATUS LOGIC ---
export interface JudgeStatus {
  name: string;
  hasJudged: boolean;
}

export interface ProjectStatusInfo {
  id: string;
  title: string;
  status: Project['status'];
  judgesA: JudgeStatus[];
  judgesBC: JudgeStatus[];
  judgedCount: number;
}

export interface CategoryStatus {
  totalProjects: number;
  completedProjects: number;
  projects: ProjectStatusInfo[];
}

export const getAggregatedJudgingStatus = (projectsForLevel: Project[], allUsers: User[]): Record<string, CategoryStatus> => {
    const statusByCategory: Record<string, CategoryStatus> = {};

    const activeJudges = allUsers.filter(u => u.role === UserRole.JUDGE && u.status === 'Active');

    for (const project of projectsForLevel) {
        if (!statusByCategory[project.category]) {
            statusByCategory[project.category] = {
                totalProjects: 0,
                completedProjects: 0,
                projects: [],
            };
        }

        const categoryData = statusByCategory[project.category];
        categoryData.totalProjects++;
        if (project.status === 'Completed') {
            categoryData.completedProjects++;
        }
        
        const eligibleJudges = activeJudges.filter(judge => {
            if (!judge.assignments || judge.assignments.length === 0) return false;
            if (judge.school === project.school) return false; // Conflict of interest
            if (judge.assignedRegion === 'National') return true;
            if (judge.assignedRegion && judge.assignedRegion !== project.region) return false;
            if (judge.assignedCounty && judge.assignedCounty !== project.county) return false;
            if (judge.assignedSubCounty && judge.assignedSubCounty !== project.subCounty) return false;
            return true;
        });

        let judgesA = eligibleJudges.filter(j => j.assignments?.some(a => a.section === 'A' && a.category === project.category));
        let judgesBC = eligibleJudges.filter(j => j.assignments?.some(a => a.section === 'BC' && a.category === project.category));
        
        const judgePairA = pickTwoUniqueJudges(judgesA, project, 'A');
        const judgePairBC = pickTwoUniqueJudges(judgesBC, project, 'BC');

        const [judgeA1, judgeA2] = judgePairA || [{name: 'Judge A1 (N/A)', id: 'N/A'}, {name: 'Judge A2 (N/A)', id: 'N/A'}];
        const [judgeBC1, judgeBC2] = judgePairBC || [{name: 'Judge BC1 (N/A)', id: 'N/A'}, {name: 'Judge BC2 (N/A)', id: 'N/A'}];

        let judgedCount = 0;

        if (project.status === 'Completed') {
            judgedCount = 4;
        } else if (project.status === 'Judging') {
            judgedCount = (simpleHash(project.id) % 3) + 1; // 1, 2, or 3
        }

        const judgedIndices = new Set<number>();
        for (let i = 0; i < judgedCount; i++) {
            const index = simpleHash(project.id + 'judge' + i) % 4;
            judgedIndices.add(index);
        }
        // Ensure the count is correct even with hash collisions
        while(judgedIndices.size < judgedCount){
             judgedIndices.add(Math.floor(Math.random() * 4));
        }

        categoryData.projects.push({
            id: project.id,
            title: project.title,
            status: project.status,
            judgedCount,
            judgesA: [
                { name: judgeA1.name, hasJudged: judgedIndices.has(0) },
                { name: judgeA2.name, hasJudged: judgedIndices.has(1) },
            ],
            judgesBC: [
                { name: judgeBC1.name, hasJudged: judgedIndices.has(2) },
                { name: judgeBC2.name, hasJudged: judgedIndices.has(3) },
            ],
        });
    }

    return statusByCategory;
};