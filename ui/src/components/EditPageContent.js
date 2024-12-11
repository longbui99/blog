import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import '../styles/EditPageContent.css';
import debounce from 'lodash/debounce';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import { isNewPageRoute } from '../utils/routeConstants';

function EditPageContent({isCreating,onSave, onCancel, currentPath, routes, blogPost }) {
  const [title, setTitle] = useState('');
  const [urlPath, setUrlPath] = useState(currentPath);
  const [parent, setParent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pathExists, setPathExists] = useState(false);
  const [isCheckingPath, setIsCheckingPath] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    urlPath: false,
    newPageUrl: false
  });

  useEffect(() => {
    const fetchBlogContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentRoute = routes?.find(route => route.path === currentPath);
        if (routes && currentRoute) {
            setUrlPath(currentPath);
            setTitle(currentRoute.title || 'page');
            setParent(blogPost?.parent || currentRoute?.parent || null);
            setPrevious(currentRoute?.previous || null);
            setNext(currentRoute?.next || null);
        } else {
          setTitle('');
          setUrlPath(currentPath);
          setParent(blogPost?.parent || null);
          setPrevious(null);
          setNext(null);
        }
      } catch (error) {
        console.error('Error fetching blog content:', error);
        setError('Error loading blog content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogContent();
  }, [currentPath, routes, blogPost]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if(isCreating){
        // Generate URL-friendly path from title
        const urlPath = "/" +newTitle
        .toLowerCase()                     // Convert to lowercase
        .trim()                           // Remove leading/trailing spaces
        .replace(/[^a-z0-9\s-]/g, '')     // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-')             // Replace spaces with hyphens
        .replace(/-+/g, '-');             // Replace multiple hyphens with single hyphen
    
        // Only update path if it hasn't been manually edited
        setUrlPath(urlPath);
    }
  };

  const checkPathExists = useCallback(
    debounce(async (path) => {
      if (path === currentPath) {
        setPathExists(false);
        return;
      }

      setIsCheckingPath(true);
      try {
        const response = await blogMenuProcessor.checkPathExists(path);
        setPathExists(response.exists);
      } catch (error) {
        console.error('Error checking path:', error);
      } finally {
        setIsCheckingPath(false);
      }
    }, 300),
    [currentPath]
  );

  const handleUrlPathChange = (e) => {
    const newPath = e.target.value;
    setUrlPath(newPath);
    
    setValidationErrors(prev => ({
      ...prev,
      urlPath: false,
      newPageUrl: false
    }));
    
    if (isNewPageRoute(newPath)) {
      setValidationErrors(prev => ({
        ...prev,
        newPageUrl: true
      }));
      return;
    }
    
    checkPathExists(newPath);
  };

  const routeOptions = useMemo(() => routes.map(route => ({
    value: route.path,
    label: route.title || route.path
  })), [routes]);

  const handleParentChange = (selectedOption) => {
    setParent(selectedOption ? selectedOption.value : null);
    setPrevious(null);
    setNext(null);
  };

  const handlePreviousChange = (selectedOption) => {
    setPrevious(selectedOption ? selectedOption.value : null);
  };

  const handleNextChange = (selectedOption) => {
    setNext(selectedOption ? selectedOption.value : null);
  };

  const handleSave = () => {
    setValidationErrors({
      title: false,
      urlPath: false
    });

    const errors = {
      title: !title.trim(),
      urlPath: !urlPath.trim()
    };

    if (errors.title || errors.urlPath) {
      setValidationErrors(errors);
      return;
    }

    onSave(urlPath, { title, parent, previous, next });
  };

  const handlePathChange = (e) => {
    setUrlPath(e.target.value);
  };

  return (
    <div className="edit-page-content">
      {isLoading && <p>Loading content...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="edit-header">
        <div className="edit-title-group">
          <div className="title-input-container">
            {validationErrors.title && (
              <span className="validation-error">Title is required</span>
            )}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter page title *"
              className={`title-input ${validationErrors.title ? 'input-error' : ''}`}
            />
          </div>

          <div className="url-input-container">
            {validationErrors.urlPath && (
              <span className="validation-error">URL path is required</span>
            )}
            {validationErrors.newPageUrl && (
              <span className="validation-error">Cannot use /new-page as the URL.</span>
            )}
            {pathExists && !validationErrors.newPageUrl && (
              <span className="path-exists-warning">This path already exists</span>
            )}
            <input
              type="text"
              value={urlPath}
              onChange={handlePathChange}
              placeholder="Enter URL path *"
              className={`url-path-input ${
                pathExists || validationErrors.urlPath || validationErrors.newPageUrl ? 'input-error' : ''
              }`}
            />
            {isCheckingPath && (
              <span className="checking-path">Checking...</span>
            )}
          </div>
        </div>
        <div className="edit-actions">
          <button 
            onClick={handleSave} 
            className="save-button"
            disabled={pathExists}
          >
            Save
          </button>
        </div>
      </div>

      <div className="edit-navigation">
        <div className="navigation-row">
          <div className="select-container">
            <label>Parent:</label>
            <Select
              options={routeOptions}
              value={routeOptions.find(option => option.value === parent)}
              onChange={handleParentChange}
              isClearable
              className="route-select"
            />
          </div>
          <div className="select-container">
            <label>Previous:</label>
            <Select
              options={routeOptions}
              value={routeOptions.find(option => option.value === previous)}
              onChange={handlePreviousChange}
              isClearable
              className="route-select"
            />
          </div>
          <div className="select-container">
            <label>Next:</label>
            <Select
              options={routeOptions}
              value={routeOptions.find(option => option.value === next)}
              onChange={handleNextChange}
              isClearable
              className="route-select"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPageContent;
