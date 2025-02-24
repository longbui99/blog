import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles/TableOfContents.css';
import TOCToggle from '../toggle/TOCToggle';

function TableOfContents({ items, isOpen }) {
  const location = useLocation();

  return (
    <div className={`toc-container ${isOpen ? 'open' : ''}`}>
      <nav className={`table-of-contents`}>
          <ul>
            {items.map((item, index) => (
            <li key={index} className={`toc-level-${item.level}`}>
              <Link 
                to={`${location.pathname}#${item.id}`}
                className="toc-link"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <TOCToggle/>
    </div>
  );
}

export default TableOfContents;
