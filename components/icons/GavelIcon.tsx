
import React from 'react';

const GavelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M14.75 17.5 10 22.25"></path>
        <path d="m16 16 6-6"></path>
        <path d="M11.5 7.5 2 17l5 5 9.5-9.5"></path>
        <path d="m16 2-6 6"></path>
    </svg>
);

export default GavelIcon;