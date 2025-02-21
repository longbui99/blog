import React from 'react';
import { useSelector } from 'react-redux';
import './styles/Toggle.css';

function PublishToggle() {
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const isPublished = useSelector(state => state.editing.isPublished);

  return (
    <button
      className={`action-toggle publish-toggle ${isPublished ? 'active' : ''}`}
      title={isPublished ? "Unpublish Page" : "Publish Page"}
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
          <path d={isPublished ? "M12 2L2 12h3v8h8v-3h3L12 2z" : "M12 2L2 12h3v8h8v-3h3L12 2z"} />
        </svg>
      </span>
    </button>
  );
}

export default PublishToggle; 