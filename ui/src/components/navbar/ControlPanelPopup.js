import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faUser } from '@fortawesome/free-solid-svg-icons';
import './styles/ControlPanelPopup.css';
import { useDispatch, useSelector } from 'react-redux';
import { setControlPanelOpen } from '../../redux/slices/controlPanelSlice';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { toggleLoginModal } from '../../redux/slices/loginSlice';

function ControlPanelPopup() {
  const dispatch = useDispatch();
  const { isOpen } = useSelector(state => state.controlPanel);
  const { isDarkMode } = useSelector(state => state.theme);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
        setTimeout(() => {
          dispatch(setControlPanelOpen(false));
        }, 100);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        dispatch(setControlPanelOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, dispatch]);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    dispatch(setControlPanelOpen(false));
  };

  const handleSignIn = () => {
    dispatch(toggleLoginModal());
    dispatch(setControlPanelOpen(false));
  };

  return (
    <div 
      ref={popupRef}
      className={`control-panel-popup ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-label="Control Panel"
    >
      <div className="control-panel-content">
        <button 
          className="menu-button"
          onClick={handleThemeToggle}
          role="menuitem"
        >
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button 
          className="menu-button"
          onClick={handleSignIn}
          role="menuitem"
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Sign In</span>
        </button>
      </div>
    </div>
  );
}

export default ControlPanelPopup;
