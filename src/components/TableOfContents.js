import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/TableOfContents.css';

function TableOfContents({ items }) {
  const location = useLocation();

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="table-of-contents">
      <h2>Table of Contents</h2>
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
  );
}

export default TableOfContents;
