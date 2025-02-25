import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateActiveRouteFromPath } from '../../redux/slices/routesSlice';
import TableOfContents from './TableOfContents';
import { generateTOC } from '../../utils/contentUtils';
import './styles/MainContent.css';
import './styles/CodeBlock.css';
import BlogContent from './BlogContent';
import BreadCrumbs from './BreadCrumbs';
import EditPageContent from './EditPageContent';
import { isDeviceDesktop } from '../../utils/responsive';

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
  const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
  const isTOCOpen = useSelector((state) => state.toc.isOpen);
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const [tocItems, setTocItems] = useState([]);
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
      // Wait for content to be fully rendered
      const timeoutId = setTimeout(() => {
        scrollToElement(hash);
      }, 300); // Increased timeout for better reliability

      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, isContentLoaded]);

  const handleContentLoaded = useCallback(() => {
    setIsContentLoaded(true);
  }, []);

  const isSidebarTransform = isSidebarOpen && isDeviceDesktop();
  const isTOCTransform = isTOCOpen && isDeviceDesktop();
  const isEditorTransform = (isEditing || isCreating) && isDeviceDesktop();

  return (
    <>
      <main className={`main-content ${isSidebarTransform ? 'sidebar-open' : ''} ${isTOCTransform ? 'toc-open' : ''} ${isEditorTransform ? 'editor-open' : ''}`}>
        <div className="content-wrapper" ref={contentRef}>
          <BreadCrumbs />
          <BlogContent
            onContentLoaded={handleContentLoaded}
          />
        </div>
      </main>
      <TableOfContents
        items={tocItems}
        isOpen={isTOCOpen}
      />
      <EditPageContent
      />
    </>
  );
}

export default MainContent;
