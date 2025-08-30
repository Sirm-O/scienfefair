import React from 'react';
import ReportGenerator from '../shared/ReportGenerator';
import { Project } from '../../types';

interface ReportsProps {
    view: 'summaryReports' | 'judgingReports';
    projects: Project[];
}

const Reports: React.FC<ReportsProps> = ({ view, projects }) => {
    const reportType = view === 'summaryReports' ? 'summary' : 'judging';
    const title = view === 'summaryReports' ? 'National Summary Report' : 'National Judging Report';

    return (
        <ReportGenerator
            title={title}
            projects={projects}
            reportType={reportType}
            showMarksheetButton={true}
        />
    );
};

export default Reports;