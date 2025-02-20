import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isDeviceMobile } from '../../utils/responsive';
import './styles/TableOfContents.css';

function TableOfContents({ items, isOpen, onToggle }) {
  const location = useLocation();

  const handleItemClick = useCallback(() => {
    // Auto-hide TOC on mobile after clicking an item
    console.log("isDeviceMobile", isDeviceMobile())
    console.log("onToggle", onToggle)
    if (isDeviceMobile() && onToggle) {
      console.log("PASSS")
      onToggle(false);
    }
  }, [onToggle]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={`table-of-contents ${isOpen ? 'open' : ''}`}>
      <h2>Table of Contents</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} className={`toc-level-${item.level}`}>
            <Link 
              to={`${location.pathname}#${item.id}`}
              className="toc-link"
              onClick={handleItemClick}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
