import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './styles/Toggle.css';

function CreateToggle() {
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);

  return (
    <button
      className={`action-toggle create-toggle ${isCreating ? 'active' : ''}`}
      title={isEditing ? "Finish editing first" : "Create New Page (C)"}
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
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </span>
    </button>
  );
}

export default CreateToggle; 