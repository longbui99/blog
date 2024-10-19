import React from 'react';

function SidebarToggle({ isOpen, toggleSidebar }) {
  return (
    <button className="sidebar-toggle" onClick={toggleSidebar} title={isOpen ? "Hide Sidebar" : "Show Sidebar"}>
      <i className="fas fa-list"></i>
    </button>
  );
}

export default SidebarToggle;
