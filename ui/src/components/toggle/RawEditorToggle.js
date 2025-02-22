import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRawEditor } from '../../redux/slices/editingSlice';
import './styles/Toggle.css';

function RawEditorToggle() {
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const isRawEditor = useSelector(state => state.editing.isRawEditor);

  const handleRawEditorClick = () => {
    dispatch(setRawEditor(!isRawEditor));
  };

  return (
    <button
      className={`action-toggle raw-editor-toggle ${isRawEditor ? 'active' : ''} ${isEditing || isCreating ? 'visible' : ''}`}
      onClick={handleRawEditorClick}
      title={isRawEditor ? "Switch to Rich Editor" : "Switch to HTML Editor"}
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
          <path d="M16 18l6-6-6-6"></path>
          <path d="M8 6l-6 6 6 6"></path>
        </svg>
      </span>
    </button>
  );
}

export default RawEditorToggle; 