import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import TableOfContents from './TableOfContents';
import { generateTOC } from '../utils/contentUtils';
import '../styles/MainContent.css';
import BlogContent from '../pages/BlogContent';
import Header from './Header';

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

function MainContent({ 
  isSidebarOpen, 
  isTOCOpen, 
  isLoggedIn, 
  routes, 
}) {
  const [tocItems, setTocItems] = useState([]);
  const [editableContent, setEditableContent] = useState('');
  const location = useLocation();
  const contentRef = useRef(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

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
      // Wait for content to be fully rendered
      const timeoutId = setTimeout(() => {
        scrollToElement(hash);
      }, 300); // Increased timeout for better reliability

      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, isContentLoaded]);

  // Add content loaded handler
  const handleContentLoaded = useCallback(() => {
    setIsContentLoaded(true);
  }, []);

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
            onContentLoaded={handleContentLoaded}
          />
        </div>
        <TableOfContents items={tocItems} isOpen={isTOCOpen} />
      </main>
    </>
  );
}

export default MainContent;
