import React from 'react';

const TargetIcon = () => {
  // Define styles to prevent color changes on hover
  const svgStyle = {
    color: 'inherit',
    fill: 'none',
    stroke: 'currentColor',
    pointerEvents: 'none',
  };
  
  const elementStyle = {
    color: 'inherit',
    fill: 'none',
    stroke: 'inherit',
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={svgStyle}
      className="thinking-icon"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Nucleus (center) - smaller filled circle */}
      <circle cx="12" cy="12" r="2" style={{...elementStyle, fill: 'currentColor'}} />
      
      {/* Single electron orbit */}
      <circle cx="12" cy="12" r="9" style={elementStyle} />
      
      {/* Single electron at top of orbit */}
      <circle cx="12" cy="3" r="0.8" style={{...elementStyle, fill: 'currentColor'}} />
    </svg>
  );
};

export default TargetIcon; 