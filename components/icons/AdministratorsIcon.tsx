import React from 'react';

const AdministratorsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="48" height="48" rx="12" fill="#3B82F6" fillOpacity="0.1"/>
    <svg x="12" y="12" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.25L4.5 5.25V12C4.5 17.1825 7.7625 21.93 12 23.25C16.2375 21.93 19.5 17.1825 19.5 12V5.25L12 2.25Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </svg>
);

export default AdministratorsIcon;