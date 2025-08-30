
import React from 'react';

const ChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M3 3v18h18"/>
        <path d="M18.7 8a5 5 0 0 1-5 5-5 5 0 0 1-5-5-5 5 0 0 1 5-5-5 5 0 0 1 5 5z"/>
    </svg>
);

export default ChartIcon;