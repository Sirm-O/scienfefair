import React from 'react';
import ReportGenerator from '../shared/ReportGenerator';
import { Project, User } from '../../types';

interface ReportsProps {
    view: 'summaryReports' | 'judgingReports';
    projects: Project[];
    currentUser: User;
}

const Reports: React.FC<ReportsProps> = ({ view, projects, currentUser }) => {
    const reportType = view === 'summaryReports' ? 'summary' : 'judging';
    const title = view === 'summaryReports' 
        ? `${currentUser.assignedSubCounty} Sub-County Summary Report` 
        : `${currentUser.assignedSubCounty} Sub-County Judging Report`;

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