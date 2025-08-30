import React from 'react';

const JudgesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="48" height="48" rx="12" fill="#F59E0B" fillOpacity="0.1"/>
    <svg x="12" y="12" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.75L3.75 7.5V12.75H20.25V7.5L12 3.75Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.75 12.75L4.5 20.25H19.5L20.25 12.75" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20.25V3.75" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.25 7.5L21.75 7.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </svg>
);

export default JudgesIcon;