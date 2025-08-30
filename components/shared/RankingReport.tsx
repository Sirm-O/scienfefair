
import React, { useState, useMemo } from 'react';
import { Project, User, UserRole, RankedItem, RankDataType } from '../../types';
import { generateRankingReport } from '../../utils/rankingLogic';
import TrophyIcon from '../icons/TrophyIcon';
import DownloadIcon from '../icons/DownloadIcon';

interface RankingReportProps {
    user: User;
    projects: Project[];
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
            isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);

const RankingTable: React.FC<{ data: RankedItem[]; title: string; }> = ({ data, title }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="py-3 px-6 w-16 text-center">Rank</th>
                    <th scope="col" className="py-3 px-6">{title}</th>
                    <th scope="col" className="py-3 px-6 w-32 text-right">Total Points</th>
                </tr>
            </thead>
            <tbody>
                {data.map(item => (
                    <tr key={item.name} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-6 text-center">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{item.rank}</span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{item.name}</td>
                        <td className="py-4 px-6 text-right font-bold font-mono text-lg text-blue-600 dark:text-blue-400">{item.totalPoints}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {data.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No ranking data available for the selected level.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Points are awarded after projects are marked as 'Completed'.</p>
            </div>
        )}
    </div>
);

const RankingReport: React.FC<RankingReportProps> = ({ user, projects }) => {
    const availableTabs: RankDataType[] = useMemo(() => {
        switch(user.role) {
            case UserRole.NATIONAL_ADMIN:
            case UserRole.SUPERADMIN:
                return ['regions', 'counties', 'subCounties', 'zones', 'schools'];
            case UserRole.REGIONAL_ADMIN:
                return ['counties', 'subCounties', 'zones', 'schools'];
            case UserRole.COUNTY_ADMIN:
                return ['subCounties', 'zones', 'schools'];
            case UserRole.SUB_COUNTY_ADMIN:
                return ['zones', 'schools'];
            default:
                return [];
        }
    }, [user.role]);

    const [activeTab, setActiveTab] = useState<RankDataType>(availableTabs[0]);
    const [levelFilter, setLevelFilter] = useState<Project['level']>('National');

    const rankingData = useMemo(() => {
        return generateRankingReport(projects, levelFilter, user);
    }, [projects, levelFilter, user]);
    
    const handleDownloadPdf = () => {
        const data = rankingData[activeTab];
        if (data.length === 0) {
            alert("No data available to download.");
            return;
        }

        const jspdfGlobal = (window as any).jspdf;
        if (typeof jspdfGlobal?.jsPDF !== 'function') {
            alert("Error: The PDF generation library (jsPDF) could not be found.");
            return;
        }
        const { jsPDF } = jspdfGlobal;
        const doc = new jsPDF();

        const title = `Performance Ranking Report (${levelFilter} Level)`;
        const tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
        
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(12);
        doc.text(`Ranking by: ${tabTitle}`, 14, 30);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
        
        const head = [['Rank', tabTitle, 'Total Points']];
        const body = data.map(item => [item.rank, item.name, item.totalPoints]);
        
        (doc as any).autoTable({ head, body, startY: 40, theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
        doc.save(`Ranking_Report_${levelFilter}_by_${tabTitle}.pdf`);
    };

    const tabConfig: Record<RankDataType, string> = {
        regions: 'Region',
        counties: 'County',
        subCounties: 'Sub-County',
        zones: 'Zone',
        schools: 'School',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                        <TrophyIcon className="w-7 h-7 mr-3 text-yellow-500" />
                        Performance Ranking Report
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        View hierarchical performance based on project points.
                    </p>
                </div>
                 <div className="flex items-center space-x-2">
                    <div className="w-full sm:w-auto">
                        <label htmlFor="levelFilter" className="sr-only">Filter by Competition Level</label>
                        <select
                            id="levelFilter"
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value as Project['level'])}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Sub-County">Sub-County Level</option>
                            <option value="County">County Level</option>
                            <option value="Regional">Regional Level</option>
                            <option value="National">National Level</option>
                        </select>
                    </div>
                     <button onClick={handleDownloadPdf} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="mb-6 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-wrap gap-2">
                {availableTabs.map(tab => (
                    <TabButton 
                        key={tab} 
                        label={tabConfig[tab] + 's'}
                        isActive={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                    />
                ))}
            </div>

            <RankingTable data={rankingData[activeTab]} title={tabConfig[activeTab]} />
        </div>
    );
};

export default RankingReport;
