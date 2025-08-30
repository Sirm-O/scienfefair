
import React, { useState } from 'react';
import { Project, Criterion } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import { getMockScoresForProject, IndividualJudgeScore } from '../../utils/mockScores';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PART_A_CRITERIA, PART_B_CRITERIA, PART_C_CRITERIA } from '../../constants';
import PrintIcon from '../icons/PrintIcon';
import { KSEF_LOGO_BASE64 } from '../../assets/ksef-logo';

const JudgeFeedbackSection: React.FC<{ judgeScore: IndividualJudgeScore }> = ({ judgeScore }) => {
    const [isOpen, setIsOpen] = useState(true);

    const criteriaListA = judgeScore.judgeSection === 'A' ? PART_A_CRITERIA : [];
    const criteriaListB = judgeScore.judgeSection === 'BC' ? PART_B_CRITERIA : [];
    const criteriaListC = judgeScore.judgeSection === 'BC' ? PART_C_CRITERIA : [];

    const renderTable = (criteria: Criterion[], title: string, total: number, max: number) => (
        <div className="mb-4">
            <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{title} (Total: {total.toFixed(2)} / {max})</h5>
            <div className="overflow-x-auto border dark:border-gray-600 rounded-md">
                <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-2 text-left">Criteria</th>
                            <th className="p-2 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-600">
                    {criteria.map(c => (
                        <tr key={c.id}>
                            <td className="p-2 text-gray-600 dark:text-gray-400">{c.text}</td>
                            <td className="p-2 text-right font-mono">{judgeScore.scores[c.id]?.toFixed(1)} / {c.maxScore}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div className="mb-4 border dark:border-gray-700 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                    {judgeScore.judgeName} <span className="text-sm font-medium text-gray-500 dark:text-gray-400">- Section {judgeScore.judgeSection}</span>
                </h4>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                 <div className="p-4 space-y-6">
                    <div>
                        {judgeScore.judgeSection === 'A' && renderTable(criteriaListA, "Section A: Written Communication", judgeScore.totalScoreA, 30)}
                        {judgeScore.judgeSection === 'BC' && (
                            <>
                                {renderTable(criteriaListB, "Section B: Oral Communication", judgeScore.totalScoreB, 15)}
                                {renderTable(criteriaListC, "Section C: Scientific Thought", judgeScore.totalScoreC, 35)}
                            </>
                        )}
                    </div>
                    <div className="pt-4 border-t dark:border-gray-600">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Feedback & Remarks</h5>
                        <div className="space-y-4">
                            <div>
                                <h6 className="font-semibold text-green-600 dark:text-green-400">Strengths</h6>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/30 p-2 rounded-md">{judgeScore.feedback.strengths}</p>
                            </div>
                            <div>
                                <h6 className="font-semibold text-yellow-600 dark:text-yellow-400">Recommendations</h6>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md">{judgeScore.feedback.recommendations}</p>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
}


const DetailedProjectReportModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    const scoresData = getMockScoresForProject(project);

    const handleDownloadPdf = () => {
        if (!scoresData) return;

        const jspdfGlobal = (window as any).jspdf;
        const { jsPDF } = jspdfGlobal;
        const doc = new jsPDF();

        doc.addImage(KSEF_LOGO_BASE64, 'PNG', 14, 10, 20, 20);
        
        let yPos = 15;

        // Title
        doc.setFontSize(18);
        doc.text(project.title, 40, yPos);
        yPos += 8;
        doc.setFontSize(12);
        doc.text(`${project.school} - ${project.regNo}`, 40, yPos);
        yPos += 12;
        
        // Summary
        doc.setFontSize(14);
        doc.text("Final Score Summary", 14, yPos);
        yPos += 6;
        (doc as any).autoTable({
            startY: yPos,
            theme: 'grid',
            head: [['Section', 'Average Score', 'Max Score']],
            body: [
                ['A: Written', scoresData.averageScoreA.toFixed(2), 30],
                ['B: Oral', scoresData.averageScoreB.toFixed(2), 15],
                ['C: Project', scoresData.averageScoreC.toFixed(2), 35],
            ],
            foot: [['Total', scoresData.finalTotalScore.toFixed(2), 80]],
            footStyles: { fontStyle: 'bold', fillColor: [230, 230, 230] }
        });
        yPos = (doc as any).autoTable.previous.finalY + 15;
        
        // Individual Feedback
        doc.setFontSize(14);
        doc.text("Individual Judge Feedback & Scores", 14, yPos);
        yPos += 4;
        
        scoresData.individualScores.forEach(judgeScore => {
            const criteriaListA = judgeScore.judgeSection === 'A' ? PART_A_CRITERIA : [];
            const criteriaListB = judgeScore.judgeSection === 'BC' ? PART_B_CRITERIA : [];
            const criteriaListC = judgeScore.judgeSection === 'BC' ? PART_C_CRITERIA : [];
            
            const tableACount = criteriaListA.length;
            const tableBCount = criteriaListB.length;
            const tableCCount = criteriaListC.length;
            const tableAHeight = tableACount > 0 ? (tableACount * 7) + 15 : 0;
            const tableBCHeight = (tableBCount + tableCCount > 0) ? ((tableBCount + tableCCount) * 7) + 25 : 0;
            const feedbackStrengthsHeight = doc.getTextDimensions(doc.splitTextToSize(judgeScore.feedback.strengths, 180)).h;
            const feedbackRecsHeight = doc.getTextDimensions(doc.splitTextToSize(judgeScore.feedback.recommendations, 180)).h;

            const requiredSpace = (tableAHeight || tableBCHeight) + feedbackStrengthsHeight + feedbackRecsHeight + 30;

            if (yPos + requiredSpace > 280) { // Check if new page is needed
                doc.addPage();
                yPos = 15;
            }
            
            yPos += 6;
            doc.setFontSize(12);
            doc.text(`${judgeScore.judgeName} - Section ${judgeScore.judgeSection}`, 14, yPos);
            yPos += 6;

            // Scores Tables
            if(judgeScore.judgeSection === 'A') {
                (doc as any).autoTable({
                    startY: yPos,
                    head: [['Section A Criteria', 'Score']],
                    body: criteriaListA.map(c => [c.text, `${judgeScore.scores[c.id]?.toFixed(1)} / ${c.maxScore}`]),
                    theme: 'striped',
                    columnStyles: { 1: { halign: 'right', cellWidth: 25 } },
                });
                yPos = (doc as any).autoTable.previous.finalY;
            } else {
                 (doc as any).autoTable({
                    startY: yPos,
                    head: [['Section B Criteria', 'Score']],
                    body: criteriaListB.map(c => [c.text, `${judgeScore.scores[c.id]?.toFixed(1)} / ${c.maxScore}`]),
                    theme: 'striped',
                    columnStyles: { 1: { halign: 'right', cellWidth: 25 } },
                });
                yPos = (doc as any).autoTable.previous.finalY + 5;
                 (doc as any).autoTable({
                    startY: yPos,
                    head: [['Section C Criteria', 'Score']],
                    body: criteriaListC.map(c => [c.text, `${judgeScore.scores[c.id]?.toFixed(1)} / ${c.maxScore}`]),
                    theme: 'striped',
                    columnStyles: { 1: { halign: 'right', cellWidth: 25 } },
                });
                yPos = (doc as any).autoTable.previous.finalY;
            }
            
            yPos += 8;
            
            // Feedback Text below table
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text("Strengths:", 14, yPos);
            yPos += 4;
            doc.setFont(undefined, 'normal');
            const strengthsLines = doc.splitTextToSize(judgeScore.feedback.strengths, 180);
            doc.text(strengthsLines, 14, yPos);
            yPos += doc.getTextDimensions(strengthsLines).h + 4;

            doc.setFont(undefined, 'bold');
            doc.text("Recommendations:", 14, yPos);
            yPos += 4;
            doc.setFont(undefined, 'normal');
            const recsLines = doc.splitTextToSize(judgeScore.feedback.recommendations, 180);
            doc.text(recsLines, 14, yPos);
            yPos += doc.getTextDimensions(recsLines).h;

            yPos += 10; // extra spacing before next judge
        });

        doc.save(`Report_${project.regNo.replace('/', '-')}.pdf`);
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Project Feedback Report</h3>
                    <div className="flex items-center space-x-4">
                        <button onClick={handleDownloadPdf} disabled={!scoresData} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            <PrintIcon className="w-4 h-4 mr-2" />
                            Download PDF
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{project.title}</h2>
                    <p className="font-semibold">{project.school} - {project.regNo}</p>
                    
                    {!scoresData ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">Detailed scoring data is not yet available for this project.</p>
                        </div>
                    ) : (
                        <>
                             {scoresData.individualScores.map(score => (
                                <JudgeFeedbackSection key={score.judgeName} judgeScore={score} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailedProjectReportModal;