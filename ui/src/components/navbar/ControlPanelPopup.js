import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoon, 
  faSun, 
  faLanguage, 
  faUser, 
  faSignOut, 
  faGear,
  faPalette,
  faChevronRight,
  faDisplay
} from '@fortawesome/free-solid-svg-icons';
import './styles/ControlPanelPopup.css';
import { useDispatch, useSelector } from 'react-redux';
import { setControlPanelOpen, setTheme, setLanguage } from '../../redux/slices/controlPanelSlice';

function ControlPanelPopup() {
  const dispatch = useDispatch();
  const { isOpen, theme, language } = useSelector(state => state.controlPanel);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
        dispatch(setControlPanelOpen(false));
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

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
    // Add your theme change logic here
    dispatch(setControlPanelOpen(false));
  };

  const handleLanguageChange = (newLanguage) => {
    dispatch(setLanguage(newLanguage));
    // Add your language change logic here
    dispatch(setControlPanelOpen(false));
  };

  const handleAction = (action) => {
    action();
  };

  const menuItems = [
    {
      icon: faPalette,
      label: 'Theme',
      subItems: [
        { 
          label: 'Light', 
          icon: faSun,
          action: () => handleThemeChange('light'),
          active: theme === 'light'
        },
        { 
          label: 'Dark', 
          icon: faMoon,
          action: () => handleThemeChange('dark'),
          active: theme === 'dark'
        },
        { 
          label: 'System', 
          icon: faDisplay,
          action: () => handleThemeChange('system'),
          active: theme === 'system'
        }
      ]
    },
    {
      icon: faLanguage,
      label: 'Language',
      subItems: [
        { 
          label: 'English', 
          action: () => handleLanguageChange('en'),
          active: language === 'en'
        },
        { 
          label: 'Chinese', 
          action: () => handleLanguageChange('zh'),
          active: language === 'zh'
        }
      ]
    },
    {
      icon: faGear,
      label: 'Settings',
      action: () => {
        console.log('Settings clicked');
        dispatch(setControlPanelOpen(false));
      }
    },
    {
      icon: faUser,
      label: 'Profile',
      action: () => {
        console.log('Profile clicked');
        dispatch(setControlPanelOpen(false));
      }
    },
    {
      icon: faSignOut,
      label: 'Sign Out',
      action: () => {
        console.log('Sign out clicked');
        dispatch(setControlPanelOpen(false));
      },
      className: 'danger'
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className={`control-panel-popup ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-label="Control Panel"
    >
      <div className="control-panel-content">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item">
            <button 
              className={`menu-button ${item.className || ''}`}
              onClick={() => handleAction(item.action)}
              role="menuitem"
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
              {item.subItems && <FontAwesomeIcon icon={faChevronRight} className="submenu-indicator" />}
            </button>
            {item.subItems && (
              <div className="submenu" role="menu">
                {item.subItems.map((subItem, subIndex) => (
                  <button 
                    key={subIndex}
                    className={`submenu-button ${subItem.active ? 'active' : ''}`}
                    onClick={() => handleAction(subItem.action)}
                    role="menuitem"
                    aria-current={subItem.active}
                  >
                    {subItem.icon && <FontAwesomeIcon icon={subItem.icon} />}
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ControlPanelPopup;
