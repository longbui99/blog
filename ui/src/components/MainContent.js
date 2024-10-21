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
  isEditing, 
  setIsEditing,
  currentPath,
  setCurrentPath
}) {
  const [tocItems, setTocItems] = useState([]);
  const [editableContent, setEditableContent] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async (path, updatedContent, routeInfo) => {
    try {
      // Convert the parameters to fit BlogContentUpdate format
      const blogContentUpdate = {
        path: path,
        content: updatedContent,
        title: routeInfo.title,
        author: routeInfo.author || '', // You might want to get this from the current user's info
        parent: routeInfo.parent,
        previous: routeInfo.previous,
        next: routeInfo.next
      };

      await blogContentProcessor.saveOrUpdateContent(blogContentUpdate);
      setEditableContent(updatedContent);
      setIsEditing(false);

      // Reload the routes
      const updatedRoutes = await fetchRouteMap();
      onRoutesUpdate(updatedRoutes);

      // Update TOC
      updateTOC();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this page and all its content?')) {
      try {
        await blogContentProcessor.deleteBlogContentByPath(location.pathname);
        const updatedRoutes = await fetchRouteMap();
        onRoutesUpdate(updatedRoutes);
        navigate('/'); // Navigate to home page after deletion
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Failed to delete the page. Please try again.');
      }
    }
  };

  return (
    <>
      <Header 
        isLoggedIn={isLoggedIn}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />
      <main 
        className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''} ${isTOCOpen ? 'toc-open' : ''}`}
      >
        <div className="content-wrapper" ref={contentRef}>
          {isEditing ? (
            <EditPageContent 
              routes={routes} 
              onSave={handleSave} 
              onCancel={handleCancel}
              initialContent={editableContent}
              currentPath={currentPath}
            />
          ) : (
            <BlogContent 
              content={editableContent}
              updateMainContentEditableContent={setEditableContent} 
            />
          )}
        </div>
        <TableOfContents items={tocItems} isOpen={isTOCOpen} />
      </main>
    </>
  );
}

export default MainContent;
