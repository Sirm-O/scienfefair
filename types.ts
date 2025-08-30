

export interface Project {
  id: string;
  patronId: string; // <-- Added this crucial field
  title: string;
  category: string;
  regNo: string;
  presenters: string[];
  school: string;
  zone?: string; // <-- Added for new ranking report
  subCounty: string;
  county: string;
  region: string;
  status: 'Qualified' | 'Judging' | 'Completed' | 'Conflict';
  level: 'Sub-County' | 'County' | 'Regional' | 'National';
  conflict?: {
    type: 'School' | 'ScoreDiscrepancy';
    status: 'Pending' | 'Resolved';
    coordinatorId?: string;
    originalScores?: any; // Simplified for mock
  };
}

export type NewProject = Omit<Project, 'id' | 'regNo' | 'status' | 'level'>;


export interface Criterion {
  id: string;
  text: string;
  description?: string;
  maxScore: number;
  step?: number;
}

export type Scores = Record<string, number | null>;

export interface ScoreSheetProps {
  scores: Scores;
  onScoreChange: (criterionId: string, score: number | null) => void;
  isReadOnly?: boolean;
}

// --- GEOGRAPHY TYPES ---
export interface County {
  name: string;
  subCounties: string[];
}

export interface Region {
  name: string;
  counties: County[];
}


// --- AUTH TYPES ---
export enum UserRole {
  SUPERADMIN = 'Super Administrator',
  NATIONAL_ADMIN = 'National Admin',
  REGIONAL_ADMIN = 'Regional Admin',
  COUNTY_ADMIN = 'County Admin',
  SUB_COUNTY_ADMIN = 'Sub-County Admin',
  JUDGE = 'Judge',
  COORDINATOR = 'Coordinator',
  PATRON = 'Patron (Advisor)',
}

export interface JudgeAssignment {
  category: string;
  section: 'A' | 'BC';
}

// Judge-Project Assignment Types
export interface JudgeProjectAssignment {
  id: string;
  judgeId: string;
  projectId: string;
  section: 'A' | 'BC';
  assignedBy: string;
  status: 'Active' | 'Completed' | 'Reassigned';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  judge?: User;
  project?: Project;
  assignedByUser?: User;
}

export interface CreateJudgeAssignmentData {
  judgeId: string;
  projectId: string;
  section: 'A' | 'BC';
  notes?: string;
}

export interface AssignmentResult {
  success: boolean;
  message: string;
  assignmentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  forcePasswordChange?: boolean;
  // Patron/Judge/Coordinator specific fields
  idNumber?: string;
  tscNumber?: string;
  school?: string;
  teachingSubjects?: string[];
  phoneNumber?: string;
  // Judge-specific
  assignments?: JudgeAssignment[];
  // Coordinator-specific
  coordinatorCategory?: string;
  // Admin-specific
  assignedRegion?: string;
  assignedCounty?: string;
  assignedSubCounty?: string;
}

export type NewUser = Omit<User, 'id' | 'status'>;

// --- RANKING REPORT TYPES ---
export interface RankedItem {
    name: string;
    totalPoints: number;
    rank: number;
}

export interface SchoolRank extends RankedItem {}
export interface ZoneRank extends RankedItem {}
export interface SubCountyRank extends RankedItem {}
export interface CountyRank extends RankedItem {}
export interface RegionRank extends RankedItem {}

export type RankDataType = 'regions' | 'counties' | 'subCounties' | 'zones' | 'schools';

export interface HierarchicalRankings {
    regions: RegionRank[];
    counties: CountyRank[];
    subCounties: SubCountyRank[];
    zones: ZoneRank[];
    schools: SchoolRank[];
}