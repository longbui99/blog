import React from 'react';
import { IoReorderThreeOutline } from "react-icons/io5";

function TOCToggle({ isOpen, toggleTOC }) {
  return (
    <button 
      className={`toc-toggle ${isOpen ? 'open' : ''}`} 
      onClick={toggleTOC} 
      title={isOpen ? "Hide Table of Contents" : "Show Table of Contents"}
    >
      <IoReorderThreeOutline />
    </button>
  );
}

export default TOCToggle;
