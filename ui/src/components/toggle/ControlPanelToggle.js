import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import './styles/ControlPanelToggle.css';
import { useDispatch, useSelector } from 'react-redux';
import { toggleControlPanel } from '../../redux/slices/controlPanelSlice';

function ControlPanelToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.controlPanel.isOpen);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling to document
    dispatch(toggleControlPanel());
  };

  return (
    <button 
      className={`control-panel-toggle ${isOpen ? 'active' : ''}`}
      onClick={handleClick}
      title="Control Panel"
      aria-expanded={isOpen}
    >
      <span className="text">
        <FontAwesomeIcon icon={faGear} className={isOpen ? 'rotating' : ''} />
      </span>
    </button>
  );
}

export default ControlPanelToggle;
