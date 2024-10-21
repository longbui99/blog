import React from 'react';
import { FaAlignJustify } from 'react-icons/fa';

function TOCToggle({ isOpen, toggleTOC }) {
  return (
    <button 
      className={`toc-toggle ${isOpen ? 'open' : ''}`} 
      onClick={toggleTOC} 
      title={isOpen ? "Hide Table of Contents" : "Show Table of Contents"}
    >
      <FaAlignJustify />
    </button>
  );
}

export default TOCToggle;
