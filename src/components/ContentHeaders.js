import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import '../styles/ContentHeaders.css';

// Import ThemeContext if it exists, otherwise create a dummy context
let ThemeContext;
try {
  ThemeContext = require('../contexts/ThemeContext').ThemeContext;
} catch (error) {
  ThemeContext = React.createContext({ isDarkMode: false });
}

function createHeaderComponent(level) {
  return function Header({ children, currentRoute }) {
    const [showCopy, setShowCopy] = useState(false);
    const location = useLocation();
    const theme = useContext(ThemeContext);
    const isDarkMode = theme ? theme.isDarkMode : false;
    const id = children.toLowerCase().replace(/\s+/g, '-');
    const link = `${location.pathname}#${id}`;

    const copyLink = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.origin + link);
      alert('Link copied to clipboard!');
    };

    const Tag = `h${level}`;

    return (
      <Tag
        id={id}
        className={`content-header ${isDarkMode ? 'dark-mode' : ''}`}
        onMouseEnter={() => setShowCopy(true)}
        onMouseLeave={() => setShowCopy(false)}
      >
        <div className="header-wrapper">
          <button 
            onClick={copyLink} 
            className="copy-link-button" 
            title="Copy link to this section"
            style={{ opacity: showCopy ? 1 : 0 }}
          >
            <FaLink />
          </button>
          <Link to={link} className="header-link">
            <span className="header-text">{children}</span>
          </Link>
        </div>
      </Tag>
    );
  };
}

export const H1 = createHeaderComponent(1);
export const H2 = createHeaderComponent(2);
export const H3 = createHeaderComponent(3);
export const H4 = createHeaderComponent(4);
export const H5 = createHeaderComponent(5);
export const H6 = createHeaderComponent(6);
export const H7 = createHeaderComponent(7);
