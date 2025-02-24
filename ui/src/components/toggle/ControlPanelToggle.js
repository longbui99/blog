import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './styles/ControlPanelToggle.css';
import { useDispatch, useSelector } from 'react-redux';
import { setControlPanelOpen } from '../../redux/slices/controlPanelSlice';

function ControlPanelToggle() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.controlPanel.isOpen);

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(setControlPanelOpen(!isOpen));
  };

  return (
    <button 
      className={`control-panel-toggle ${isOpen ? 'active' : ''}`}
      onClick={handleClick}
      title="Control Panel"
      aria-expanded={isOpen}
    >
      <span className="text">
        <FontAwesomeIcon icon={faBars} className={isOpen ? 'rotating' : ''} />
      </span>
    </button>
  );
}

export default ControlPanelToggle;
