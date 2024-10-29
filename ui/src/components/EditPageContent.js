import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import '../styles/EditPageContent.css';
import debounce from 'lodash/debounce';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';

function EditPageContent({ onSave, onCancel, currentPath, routes}) {
  const [title, setTitle] = useState('');
  const [urlPath, setUrlPath] = useState(currentPath);
  const [parent, setParent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pathExists, setPathExists] = useState(false);
  const [isCheckingPath, setIsCheckingPath] = useState(false);

  useEffect(() => {
    const fetchBlogContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        
        if (routes) {
          const currentRoute = routes.find(route => route.path === currentPath);
          if (currentRoute) {
            setUrlPath(currentPath);
            setTitle(currentRoute.title || 'page');
            setParent(currentRoute?.parent || null);
            setPrevious(currentRoute?.previous || null);
            setNext(currentRoute?.next || null);
          }
        } else {
          setTitle('page');
          setUrlPath(currentPath);
          setParent(null);
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
  }, [currentPath, routes]);

  const handleTitleChange = (e) => setTitle(e.target.value);

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
    onSave(urlPath, { title, parent, previous, next });
  };

  return (
    <div className="edit-page-content">
      {isLoading && <p>Loading content...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="edit-header">
        <div className="edit-title-group">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter page title"
            className="title-input"
          />
          <div className="url-input-container">
            {pathExists && (
              <span className="path-exists-warning">
                This path already exists
              </span>
            )}
            <input
              type="text"
              value={urlPath}
              onChange={handleUrlPathChange}
              placeholder="Enter URL path"
              className={`url-path-input ${pathExists ? 'path-exists' : ''}`}
            />
            {isCheckingPath && (
              <span className="checking-path">
                Checking...
              </span>
            )}
          </div>
        </div>
        <div className="edit-actions">
          <button onClick={handleSave} className="save-button">Save</button>
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
