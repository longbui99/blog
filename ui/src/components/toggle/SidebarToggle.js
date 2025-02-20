import React from 'react';
import { IoListOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/sidebarSlice';

function SidebarToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    <button 
      className={`sidebar-toggle ${isOpen ? 'open' : ''}`} 
      onClick={() => dispatch(toggleSidebar())} 
      title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
    >
      <IoListOutline />
    </button>
  );
}

export default SidebarToggle;
