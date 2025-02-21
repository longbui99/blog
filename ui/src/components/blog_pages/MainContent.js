import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateActiveRouteFromPath } from '../../redux/slices/routesSlice';
import TableOfContents from './TableOfContents';
import { generateTOC } from '../../utils/contentUtils';
import './styles/MainContent.css';
import BlogContent from './BlogContent';
import BreadCrumbs from './BreadCrumbs';

// Add scroll helper function
const scrollToElement = (elementId, offset = 80) => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Optional: Add highlight effect
        element.classList.add('highlight');
        setTimeout(() => element.classList.remove('highlight'), 2000);
    }
};

function MainContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const routes = useSelector((state) => state.routes.items);
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const isTOCOpen = useSelector((state) => state.toc.isOpen);
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const [tocItems, setTocItems] = useState([]);
  const [editableContent, setEditableContent] = useState('');
  const contentRef = useRef(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  // Update active route when location changes
  useEffect(() => {
    dispatch(updateActiveRouteFromPath(location.pathname));
  }, [location.pathname, dispatch]);

  const updateTOC = useCallback(() => {
    const items = generateTOC(contentRef);
    setTocItems(items);
  }, []);

  useEffect(() => {
    updateTOC();
    const observer = new MutationObserver(updateTOC);
    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [updateTOC]);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && isContentLoaded) {
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, isContentLoaded]);

  const handleContentLoaded = useCallback(() => {
    setIsContentLoaded(true);
  }, []);

  return (
    <>
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''} ${isTOCOpen ? 'toc-open' : ''}`}>
        <div className="content-wrapper" ref={contentRef}>
          <BreadCrumbs />
          <BlogContent 
            content={editableContent}
            updateMainContentEditableContent={setEditableContent}
            isLoggedIn={isLoggedIn}
            routes={routes}
            onContentLoaded={handleContentLoaded}
          />
        </div>
        <TableOfContents 
          items={tocItems} 
          isOpen={isTOCOpen}
        />
      </main>
    </>
  );
}

export default MainContent;
