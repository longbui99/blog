import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/sidebarSlice';
import './styles/SidebarToggle.css';

function SidebarToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    <button 
        className="sidebar-toggle-right"
        onClick={() => dispatch(toggleSidebar())}
        title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
    >
        <span className="text">Menu</span>
    </button>
  );
}

export default SidebarToggle;
