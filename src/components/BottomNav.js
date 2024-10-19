import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLevelUpAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { routeStructure } from '../const/routes';

function BottomNav() {
  const location = useLocation();

  const getNavLinks = () => {
    const currentRoute = routeStructure.find(route => route.path === location.pathname);
    
    if (!currentRoute) return { parent: null, prev: null, next: null };

    const parent = routeStructure.find(route => route.path === currentRoute.parent);
    
    const siblings = routeStructure.filter(route => route.parent === currentRoute.parent);
    const currentIndex = siblings.findIndex(route => route.path === currentRoute.path);
    
    const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const next = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    return { parent, prev, next };
  };

  const { parent, prev, next } = getNavLinks();

  return (
    <nav className="bottom-nav">
      <Link 
        to={parent ? parent.path : '#'} 
        id="parent-link" 
        className="nav-button"
        style={{ visibility: parent ? 'visible' : 'hidden' }}
      >
        <FontAwesomeIcon icon={faLevelUpAlt} /> <span className="page-title">{parent ? parent.title : ''}</span>
      </Link>
      <Link 
        to={prev ? prev.path : '#'} 
        id="prev-link" 
        className="nav-button"
        style={{ visibility: prev ? 'visible' : 'hidden' }}
      >
        <FontAwesomeIcon icon={faChevronLeft} /> <span className="page-title">{prev ? prev.title : ''}</span>
      </Link>
      <Link 
        to={next ? next.path : '#'} 
        id="next-link" 
        className="nav-button"
        style={{ visibility: next ? 'visible' : 'hidden' }}
      >
        <span className="page-title">{next ? next.title : ''}</span> <FontAwesomeIcon icon={faChevronRight} />
      </Link>
    </nav>
  );
}

export default BottomNav;
