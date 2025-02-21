import React from 'react';
import { useSelector } from 'react-redux';
import './styles/Toggle.css';

function DeleteToggle() {
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);

  return (
    <button
      className="action-toggle delete-toggle"
      title="Delete page"
      disabled={isEditing || isCreating}
    >
      <span className="text">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </span>
    </button>
  );
}

export default DeleteToggle; 