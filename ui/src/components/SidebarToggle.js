import React from 'react';
import { FaBars, FaList } from 'react-icons/fa';

function SidebarToggle({ isOpen, toggleSidebar }) {
  return (
    <button 
      className={`sidebar-toggle ${isOpen ? 'open' : ''}`} 
      onClick={toggleSidebar} 
      title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
    >
      <FaList />
    </button>
  );
}

export default SidebarToggle;
