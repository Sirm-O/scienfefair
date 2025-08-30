
import React from 'react';
import { Project } from '../types';

interface ProjectDetailsProps {
  project: Project;
}

const DetailItem: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
    <p className="mt-1 text-md text-gray-900 dark:text-gray-100 font-semibold">
      {Array.isArray(value) ? value.join(', ') : value}
    </p>
  </div>
);

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">{project.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <DetailItem label="Registration No" value={project.regNo} />
        <DetailItem label="Category" value={project.category} />
        <DetailItem label="Presenters" value={project.presenters} />
        <DetailItem label="School" value={project.school} />
        <DetailItem label="Sub-County" value={project.subCounty} />
        <DetailItem label="County" value={project.county} />
        <DetailItem label="Region" value={project.region} />
      </div>
    </div>
  );
};

export default ProjectDetails;
