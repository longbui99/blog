import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import TableOfContents from './TableOfContents';
import { generateTOC } from '../utils/contentUtils';
import '../styles/MainContent.css';

function MainContent({ children, isSidebarOpen }) {
  const [tocItems, setTocItems] = useState([]);
  const contentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const updateTOC = () => {
      const items = generateTOC(contentRef);
      setTocItems(items);
    };

    updateTOC();

    const observer = new MutationObserver(updateTOC);
    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  });

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
    <main className={`main-content ${isSidebarOpen ? '' : 'sidebar-hidden'}`}>
      <div className="content" ref={contentRef}>
        {children}
      </div>
      <TableOfContents items={tocItems} />
    </main>
  );
}

export default MainContent;
