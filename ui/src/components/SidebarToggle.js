import React from 'react';
import { IoListOutline } from "react-icons/io5";

function SidebarToggle({ isOpen, toggleSidebar }) {
  return (
    <button 
      className={`sidebar-toggle ${isOpen ? 'open' : ''}`} 
      onClick={toggleSidebar} 
      title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
    >
      <IoListOutline />
    </button>
  );
}

export default SidebarToggle;
