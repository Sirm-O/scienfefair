import React from 'react';

const PatronsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="48" height="48" rx="12" fill="#10B981" fillOpacity="0.1"/>
    <svg x="12" y="12" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 21.75H6C5.17157 21.75 4.5 21.0784 4.5 20.25V3.75C4.5 2.92157 5.17157 2.25 6 2.25H18C18.8284 2.25 19.5 2.92157 19.5 3.75V20.25C19.5 21.0784 18.8284 21.75 18 21.75Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 6.75H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11.25H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 15.75H12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </svg>
);

export default PatronsIcon;