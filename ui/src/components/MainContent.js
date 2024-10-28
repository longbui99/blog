import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TableOfContents from './TableOfContents';
import { generateTOC } from '../utils/contentUtils';
import '../styles/MainContent.css';
import EditIcon from '../icons/EditIcon';
import BlogContent from '../pages/BlogContent';
import EditPageContent from './EditPageContent';
import { blogContentProcessor } from '../processor/blogContentProcessor';
import { fetchRouteMap } from '../const/routes';
import Header from './Header';

function MainContent({ 
  isSidebarOpen, 
  isTOCOpen, 
  isLoggedIn, 
  routes, 
  onRoutesUpdate, 
  currentPath,
  setCurrentPath
}) {
  const [tocItems, setTocItems] = useState([]);
  const [editableContent, setEditableContent] = useState('');
  const location = useLocation();
  const contentRef = useRef(null);

  const updateTOC = useCallback(() => {
    const items = generateTOC(contentRef);
    setTocItems(items);
  }, []);

  const updateEditableContent = useCallback((content) => {
    setEditableContent(content);
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
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <>
      <Header 
        isLoggedIn={isLoggedIn}
      />
      <main 
        className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''} ${isTOCOpen ? 'toc-open' : ''}`}
      >
        <div className="content-wrapper" ref={contentRef}>
          <BlogContent 
            content={editableContent}
            updateMainContentEditableContent={setEditableContent}
            isLoggedIn={isLoggedIn}
            routes={routes}
          />
        </div>
        <TableOfContents items={tocItems} isOpen={isTOCOpen} />
      </main>
    </>
  );
}

export default MainContent;
