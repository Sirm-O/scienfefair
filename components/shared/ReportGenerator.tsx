

import React, { useMemo, useState } from 'react';
import { Project, UserRole } from '../../types';
import DownloadIcon from '../icons/DownloadIcon';
import { getMockScoresForProject, DetailedProjectScores } from '../../utils/mockScores';
import { PROJECT_CATEGORIES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { KSEF_LOGO_BASE64 } from '../../assets/ksef-logo';

interface ReportGeneratorProps {
    title: string;
    projects: Project[];
    reportType: 'summary' | 'judging';
    showMarksheetButton?: boolean;
}

interface ScoredProjectData extends Project {
    scores: DetailedProjectScores;
}

interface JudgingData extends Project {
    scoreA: number;
    scoreB: number;
    scoreC: number;
    totalScore: number;
}

interface RankedJudgingData extends JudgingData {
    rank: number;
}


const ReportGenerator: React.FC<ReportGeneratorProps> = ({ title, projects, reportType, showMarksheetButton = false }) => {
    const { currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === UserRole.SUPERADMIN;
    
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const categoryMatch = !categoryFilter || project.category === categoryFilter;
            const statusMatch = !statusFilter || project.status === statusFilter;
            return categoryMatch && statusMatch;
        });
    }, [projects, categoryFilter, statusFilter]);

    const scoredProjectData = useMemo((): ScoredProjectData[] => {
        if (reportType !== 'judging' && !showMarksheetButton) return [];
        return filteredProjects
            .map(p => {
                const scores = getMockScoresForProject(p);
                if (!scores) return null;
                return { ...p, scores };
            })
            .filter((p): p is ScoredProjectData => p !== null);
    }, [filteredProjects, reportType, showMarksheetButton]);

    const judgingData = useMemo((): JudgingData[] => {
        return scoredProjectData
            .map(p => ({
                ...p,
                scoreA: p.scores.averageScoreA,
                scoreB: p.scores.averageScoreB,
                scoreC: p.scores.averageScoreC,
                totalScore: p.scores.finalTotalScore,
            }))
            .sort((a, b) => b.totalScore - a.totalScore);
    }, [scoredProjectData]);

    const rankedJudgingData = useMemo((): RankedJudgingData[] => {
        if (judgingData.length === 0) return [];

        const ranked: RankedJudgingData[] = [];
        let rank = 1;
        for (let i = 0; i < judgingData.length; i++) {
            if (i > 0 && judgingData[i].totalScore < judgingData[i - 1].totalScore) {
                rank = i + 1;
            }
            ranked.push({ ...judgingData[i], rank });
        }
        return ranked;
    }, [judgingData]);

    const handleDownloadPdf = () => {
        const jspdfGlobal = (window as any).jspdf;
        if (typeof jspdfGlobal?.jsPDF !== 'function') {
            alert("Error: The PDF generation library (jsPDF) could not be found.");
            return;
        }
        const { jsPDF } = jspdfGlobal;
        const doc = new jsPDF();
        if (typeof (doc as any).autoTable !== 'function') {
            alert("Error: The PDF table plugin (jsPDF-AutoTable) is not loaded correctly.");
            return;
        }
        
        doc.addImage(KSEF_LOGO_BASE64, 'PNG', 14, 15, 20, 20);

        doc.setFontSize(18);
        doc.text(title, 40, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 30);

        let head: string[][] = [];
        let body: (string|number)[][] = [];

        if (reportType === 'summary') {
            head = [['Reg No', 'Title', 'Category', 'School', 'Level', 'Status']];
            body = filteredProjects.map(p => [ p.regNo, p.title, p.category, p.school, p.level, p.status ]);
        } else { // judging
             if (!isSuperAdmin) {
                head = [['Rank', 'Reg No', 'Title', 'School', 'Score A', 'Score B', 'Score C', 'Total']];
                body = rankedJudgingData.map(p => [ p.rank, p.regNo, p.title, p.school, p.scoreA.toFixed(2), p.scoreB.toFixed(2), p.scoreC.toFixed(2), p.totalScore.toFixed(2) ]);
            } else { // Superadmin doesn't see rank
                head = [['Reg No', 'Title', 'School', 'Score A', 'Score B', 'Score C', 'Total']];
                body = judgingData.map(p => [ p.regNo, p.title, p.school, p.scoreA.toFixed(2), p.scoreB.toFixed(2), p.scoreC.toFixed(2), p.totalScore.toFixed(2) ]);
            }
        }

        (doc as any).autoTable({ head, body, startY: 45, theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
        doc.save(`${title.replace(/ /g, '_')}.pdf`);
    };

    const handleDownloadMarksheet = () => {
        const jspdfGlobal = (window as any).jspdf;
        if (typeof jspdfGlobal?.jsPDF !== 'function') {
             alert("Error: The PDF generation library (jsPDF) could not be found.");
             return;
        }
        const { jsPDF } = jspdfGlobal;
        const doc = new jsPDF({ orientation: 'landscape' });
         if (typeof (doc as any).autoTable !== 'function') {
            alert("Error: The PDF table plugin (jsPDF-AutoTable) is not loaded correctly.");
            return;
        }

        const projectsByCategory = scoredProjectData.reduce((acc, data) => {
            const category = data.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(data);
            return acc;
        }, {} as Record<string, ScoredProjectData[]>);
        
        const formatScore = (score?: number) => score?.toFixed(2) ?? '-';

        Object.keys(projectsByCategory).sort().forEach((category, index) => {
            if (index > 0) doc.addPage();
            
            doc.addImage(KSEF_LOGO_BASE64, 'PNG', 14, 8, 20, 20);
            
            const rankedCategoryProjects = [...projectsByCategory[category]].sort((a, b) => b.scores.finalTotalScore - a.scores.finalTotalScore);

            if (rankedCategoryProjects.length === 0 || !rankedCategoryProjects[0].scores) {
                return; 
            }
            
            // Determine dynamic geography column based on the competition level
            const level = rankedCategoryProjects[0].level;
            let geoColumnHeader = 'Location';
            let getGeoValue = (p: Project): string => 'N/A';
            
            switch (level) {
                case 'National':
                    geoColumnHeader = 'Region';
                    getGeoValue = (p) => p.region;
                    break;
                case 'Regional':
                    geoColumnHeader = 'County';
                    getGeoValue = (p) => p.county;
                    break;
                case 'County':
                    geoColumnHeader = 'Sub-County';
                    getGeoValue = (p) => p.subCounty;
                    break;
                case 'Sub-County':
                    geoColumnHeader = 'Zone';
                    getGeoValue = (p) => p.zone || 'N/A';
                    break;
            }

            const firstProjectScores = rankedCategoryProjects[0].scores;
            const judgesA = firstProjectScores.individualScores.filter(s => s.judgeSection === 'A');
            const judgesBC = firstProjectScores.individualScores.filter(s => s.judgeSection === 'BC');

            const judgeA1 = judgesA[0];
            const judgeA2 = judgesA[1];
            const judgeBC1 = judgesBC[0];
            const judgeBC2 = judgesBC[1];
            
            doc.setFontSize(18);
            doc.text(`KSEF Marksheet: ${category}`, 40, 15);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 22);

            const head = [
                [
                    { content: 'Rank', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Reg. No', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: geoColumnHeader, rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'School', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Project Title', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Students', rowSpan: 2, styles: { valign: 'middle' } },
                    { content: 'Section A (30)', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Section B (15)', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Section C (35)', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Average', colSpan: 3, styles: { halign: 'center' } },
                    { content: 'Total', rowSpan: 2, styles: { valign: 'middle' } },
                ],
                [
                    { content: judgeA1?.judgeName ?? 'Judge 1', styles: { halign: 'center' } },
                    { content: judgeA2?.judgeName ?? 'Judge 2', styles: { halign: 'center' } },
                    { content: judgeBC1?.judgeName ?? 'Judge 3', styles: { halign: 'center' } },
                    { content: judgeBC2?.judgeName ?? 'Judge 4', styles: { halign: 'center' } },
                    { content: judgeBC1?.judgeName ?? 'Judge 3', styles: { halign: 'center' } },
                    { content: judgeBC2?.judgeName ?? 'Judge 4', styles: { halign: 'center' } },
                    { content: 'Sec A', styles: { halign: 'center' } },
                    { content: 'Sec B', styles: { halign: 'center' } },
                    { content: 'Sec C', styles: { halign: 'center' } }
                ]
            ];
            
            let lastScore = -1;
            let currentRank = 0;
            const body = rankedCategoryProjects.map((p, i) => {
                if (p.scores.finalTotalScore !== lastScore) {
                    currentRank = i + 1;
                    lastScore = p.scores.finalTotalScore;
                }
                const getJudgeScores = (judgeName: string | undefined) => p.scores.individualScores.find(s => s.judgeName === judgeName);
                
                const judgeA1Scores = getJudgeScores(judgeA1?.judgeName);
                const judgeA2Scores = getJudgeScores(judgeA2?.judgeName);
                const judgeBC1Scores = getJudgeScores(judgeBC1?.judgeName);
                const judgeBC2Scores = getJudgeScores(judgeBC2?.judgeName);

                return [
                    currentRank,
                    p.regNo,
                    getGeoValue(p),
                    p.school, 
                    p.title, 
                    p.presenters.join(', '),
                    formatScore(judgeA1Scores?.totalScoreA), 
                    formatScore(judgeA2Scores?.totalScoreA),
                    formatScore(judgeBC1Scores?.totalScoreB), 
                    formatScore(judgeBC2Scores?.totalScoreB),
                    formatScore(judgeBC1Scores?.totalScoreC), 
                    formatScore(judgeBC2Scores?.totalScoreC),
                    formatScore(p.scores.averageScoreA), 
                    formatScore(p.scores.averageScoreB), 
                    formatScore(p.scores.averageScoreC),
                    { content: p.scores.finalTotalScore.toFixed(2), styles: { fontStyle: 'bold' } },
                ];
            });

            (doc as any).autoTable({
                head, body, startY: 30, theme: 'grid',
                headStyles: { fillColor: [44, 62, 80], textColor: 255 },
                styles: { fontSize: 7, cellPadding: 1.5 },
                columnStyles: { 
                    0: { cellWidth: 8, halign: 'center' }, // Rank
                    1: { cellWidth: 18 }, // Reg No
                    2: { cellWidth: 20 }, // Geo
                    3: { cellWidth: 25 }, // School
                    4: { cellWidth: 35 }, // Title
                    5: { cellWidth: 25 }, // Students
                }
            });
        });
        
        doc.save(`KSEF_Marksheets_by_Category.pdf`);
    };

    const renderSummaryTable = () => (
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="py-3 px-6">Reg No</th>
                    <th scope="col" className="py-3 px-6">Title</th>
                    <th scope="col" className="py-3 px-6">Category</th>
                    <th scope="col" className="py-3 px-6">School</th>
                    <th scope="col" className="py-3 px-6">Level</th>
                    <th scope="col" className="py-3 px-6">Status</th>
                </tr>
            </thead>
            <tbody>
                {filteredProjects.map(p => (
                    <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-6 font-mono text-xs">{p.regNo}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{p.title}</td>
                        <td className="py-4 px-6">{p.category}</td>
                        <td className="py-4 px-6">{p.school}</td>
                        <td className="py-4 px-6">{p.level}</td>
                        <td className="py-4 px-6">{p.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderJudgingTable = () => (
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    {!isSuperAdmin && <th scope="col" className="py-3 px-6">Rank</th>}
                    <th scope="col" className="py-3 px-6">Reg No</th>
                    <th scope="col" className="py-3 px-6">Title</th>
                    <th scope="col" className="py-3 px-6">School</th>
                    <th scope="col" className="py-3 px-6 text-center">Score A</th>
                    <th scope="col" className="py-3 px-6 text-center">Score B</th>
                    <th scope="col" className="py-3 px-6 text-center">Score C</th>
                    <th scope="col" className="py-3 px-6 text-center">Total</th>
                </tr>
            </thead>
            <tbody>
                {(isSuperAdmin ? judgingData : rankedJudgingData).map(p => (
                    <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {!isSuperAdmin && <td className="py-4 px-6 font-bold text-lg text-center">{(p as RankedJudgingData).rank}</td>}
                        <td className="py-4 px-6 font-mono text-xs">{p.regNo}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{p.title}</td>
                        <td className="py-4 px-6">{p.school}</td>
                        <td className="py-4 px-6 text-center font-mono">{p.scoreA.toFixed(2)}</td>
                        <td className="py-4 px-6 text-center font-mono">{p.scoreB.toFixed(2)}</td>
                        <td className="py-4 px-6 text-center font-mono">{p.scoreC.toFixed(2)}</td>
                        <td className="py-4 px-6 text-center font-bold font-mono text-lg">{p.totalScore.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {reportType === 'summary' ? `Total Projects: ${filteredProjects.length}` : `Scored Projects: ${judgingData.length}`}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {showMarksheetButton && (
                         <button onClick={handleDownloadMarksheet} disabled={judgingData.length === 0} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed">
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Download Marksheet
                        </button>
                    )}
                    <button onClick={handleDownloadPdf} disabled={(reportType === 'summary' ? filteredProjects : judgingData).length === 0} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download PDF Report
                    </button>
                </div>
            </div>

            {reportType === 'summary' && (
                 <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category</label>
                        <select
                            id="categoryFilter"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {PROJECT_CATEGORIES.sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Judging">Judging</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            )}
            
            <div className="overflow-x-auto">
                {reportType === 'summary' ? renderSummaryTable() : renderJudgingTable()}
                {reportType === 'summary' && filteredProjects.length === 0 && <p className="text-center py-8 text-gray-500">No projects match the current filters.</p>}
                {reportType === 'judging' && judgingData.length === 0 && <p className="text-center py-8 text-gray-500">No scored projects found.</p>}
            </div>
        </div>
    );
};

export default ReportGenerator;