import React from 'react';

const TotalUsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="48" height="48" rx="12" fill="#8B5CF6" fillOpacity="0.1"/>
    <svg x="12" y="12" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.75 21.75V19.5C18.75 17.9812 17.5188 16.75 16 16.75H8C6.48122 16.75 5.25 17.9812 5.25 19.5V21.75" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="9.75" r="4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </svg>
);

export default TotalUsersIcon;