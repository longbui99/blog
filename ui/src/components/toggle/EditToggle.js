import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEditing } from '../../redux/slices/editingSlice';
import './styles/Toggle.css';

function EditToggle() {
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);

  const handleEditClick = () => {
    dispatch(setEditing(!isEditing));
  };

  return (
    <button
      className={`action-toggle edit-toggle ${isEditing ? 'active' : ''}`}
      onClick={handleEditClick}
      title={isEditing ? "Exit Edit Mode (Esc)" : "Edit Page (E)"}
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
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </span>
    </button>
  );
}

export default EditToggle; 