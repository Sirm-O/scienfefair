
import { Project, HierarchicalRankings, User, UserRole } from '../types';
import { getMockScoresForProject } from './mockScores';
import { SCHOOL_MAPPINGS, getSchoolMapping } from '../data/schoolMappings';
import { KENYA_GEOGRAPHY } from '../data/geography';

// Step 1: Calculate points for each project
const calculateProjectPoints = (projects: Project[], levelFilter: Project['level']): (Project & { points: number })[] => {
    const pointedProjects: (Project & { points: number })[] = [];
    const projectsByLevelAndCategory: Record<string, Project[]> = {};

    // Group completed projects by their category at the specified competition level
    projects.forEach(p => {
        if (p.level === levelFilter && p.status === 'Completed') {
            const key = p.category;
            if (!projectsByLevelAndCategory[key]) {
                projectsByLevelAndCategory[key] = [];
            }
            projectsByLevelAndCategory[key].push(p);
        }
    });

    // Process each group to assign points
    Object.values(projectsByLevelAndCategory).forEach(group => {
        const totalProjectsInCategory = group.length;
        
        const scoredAndRanked = group
            .map(p => ({ project: p, score: getMockScoresForProject(p)?.finalTotalScore ?? -1 }))
            .filter(item => item.score !== -1)
            .sort((a, b) => b.score - a.score);

        scoredAndRanked.forEach((item, index) => {
            // Position 1 gets N points, Position 2 gets N-1, etc.
            const points = totalProjectsInCategory - index;
            pointedProjects.push({ ...item.project, points });
        });
    });

    return pointedProjects;
};

// Helper function to rank an array of items with points
const rankItems = <T extends { name: string; totalPoints: number }>(items: T[]): (T & { rank: number })[] => {
    const sorted = items.sort((a, b) => b.totalPoints - a.totalPoints);
    if (sorted.length === 0) return [];

    const ranked: (T & { rank: number })[] = [];
    let rank = 1;
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i].totalPoints < sorted[i - 1].totalPoints) {
            rank = i + 1;
        }
        ranked.push({ ...sorted[i], rank });
    }
    return ranked;
};


// Step 2: Aggregate points hierarchically
export const generateRankingReport = (projects: Project[], levelFilter: Project['level'], user: User): HierarchicalRankings => {
    const pointedProjects = calculateProjectPoints(projects, levelFilter);

    // Initialize maps for aggregation
    const schoolPoints: Record<string, number> = {};
    const zonePoints: Record<string, number> = {};
    const subCountyPoints: Record<string, number> = {};
    const countyPoints: Record<string, number> = {};
    const regionPoints: Record<string, number> = {};

    // Aggregate points for each school
    pointedProjects.forEach(p => {
        schoolPoints[p.school] = (schoolPoints[p.school] || 0) + p.points;
    });
    
    // Create maps of all possible entities to ensure even those with 0 points are included
    const allZones = new Set<string>();
    const allSubCounties = new Set<string>();
    const allCounties = new Set<string>();
    KENYA_GEOGRAPHY.forEach(r => {
        r.counties.forEach(c => {
            allCounties.add(c.name);
            c.subCounties.forEach(sc => allSubCounties.add(sc));
        });
    });
    SCHOOL_MAPPINGS.forEach(m => allZones.add(m.zone));

    // Aggregate from schools to zones, sub-counties, counties, regions
    Object.entries(schoolPoints).forEach(([schoolName, points]) => {
        const mapping = getSchoolMapping(schoolName);
        if (mapping) {
            zonePoints[mapping.zone] = (zonePoints[mapping.zone] || 0) + points;
            subCountyPoints[mapping.subCounty] = (subCountyPoints[mapping.subCounty] || 0) + points;
            countyPoints[mapping.county] = (countyPoints[mapping.county] || 0) + points;
            regionPoints[mapping.region] = (regionPoints[mapping.region] || 0) + points;
        }
    });

    // Filter data based on the admin's scope
    let finalRegions = KENYA_GEOGRAPHY.map(r => r.name);
    let finalCounties = Array.from(allCounties);
    let finalSubCounties = Array.from(allSubCounties);
    let finalZones = Array.from(allZones);
    let finalSchools = Object.keys(schoolPoints);

    if (user.role === UserRole.REGIONAL_ADMIN && user.assignedRegion) {
        finalRegions = [user.assignedRegion];
        finalCounties = KENYA_GEOGRAPHY.find(r => r.name === user.assignedRegion)?.counties.map(c => c.name) || [];
        finalSubCounties = finalCounties.flatMap(cName => KENYA_GEOGRAPHY.find(r => r.name === user.assignedRegion)?.counties.find(c => c.name === cName)?.subCounties || []);
        finalZones = SCHOOL_MAPPINGS.filter(m => m.region === user.assignedRegion).map(m => m.zone);
        finalSchools = SCHOOL_MAPPINGS.filter(m => m.region === user.assignedRegion).map(m => m.school);
    } else if (user.role === UserRole.COUNTY_ADMIN && user.assignedCounty) {
        finalCounties = [user.assignedCounty];
        finalSubCounties = KENYA_GEOGRAPHY.flatMap(r => r.counties).find(c => c.name === user.assignedCounty)?.subCounties || [];
        finalZones = SCHOOL_MAPPINGS.filter(m => m.county === user.assignedCounty).map(m => m.zone);
        finalSchools = SCHOOL_MAPPINGS.filter(m => m.county === user.assignedCounty).map(m => m.school);
    } else if (user.role === UserRole.SUB_COUNTY_ADMIN && user.assignedSubCounty) {
        finalSubCounties = [user.assignedSubCounty];
        finalZones = SCHOOL_MAPPINGS.filter(m => m.subCounty === user.assignedSubCounty).map(m => m.zone);
        finalSchools = SCHOOL_MAPPINGS.filter(m => m.subCounty === user.assignedSubCounty).map(m => m.school);
    }
    

    // Rank the final lists
    const rankedRegions = rankItems(finalRegions.map(name => ({ name, totalPoints: regionPoints[name] || 0 })));
    const rankedCounties = rankItems(finalCounties.map(name => ({ name, totalPoints: countyPoints[name] || 0 })));
    const rankedSubCounties = rankItems(finalSubCounties.map(name => ({ name, totalPoints: subCountyPoints[name] || 0 })));
    const rankedZones = rankItems(finalZones.map(name => ({ name, totalPoints: zonePoints[name] || 0 })));
    const rankedSchools = rankItems(finalSchools.map(name => ({ name, totalPoints: schoolPoints[name] || 0 })));

    return {
        regions: rankedRegions,
        counties: rankedCounties,
        subCounties: rankedSubCounties,
        zones: rankedZones,
        schools: rankedSchools,
    };
};
