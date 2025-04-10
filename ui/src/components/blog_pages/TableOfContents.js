import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './styles/TableOfContents.css';
import TOCToggle from '../toggle/TOCToggle';

function TableOfContents({ items, isOpen }) {
  const location = useLocation();
  const routes = useSelector((state) => state.routes.items);
  const currentPath = useSelector((state) => state.routes.activeRoute);
  
  // Find the current route object
  const currentRoute = routes.find(route => route.path === currentPath);
  
  // If hide_toc is true, don't render the TOC
  if (currentRoute && (currentRoute.hide_toc || currentRoute.path === "/")) {
    return null;
  }

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
