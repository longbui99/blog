import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import './styles/EditPageContent.css';
import debounce from 'lodash/debounce';
import { blogMenuProcessor } from '../../processor/blogMenuProcessor';
import { isNewPageRoute } from '../../utils/routeConstants';
import { useDispatch, useSelector } from 'react-redux';
import { setBlogContent } from '../../redux/slices/blogSlice';

function EditPageContent() {
  // Redux state
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const currentPath = useSelector(state => state.routes.activePath);
  const routes = useSelector(state => state.routes.items);
  const blogPost = useSelector(state => state.blog.content);

  const [title, setTitle] = useState('');
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

  // Initialize form with blog content from Redux
  useEffect(() => {
    if (blogPost && !isCreating) {
      setTitle(blogPost.title || '');
      setParent(blogPost.parent || null);
      setPrevious(blogPost.previous || null);
      setNext(blogPost.next || null);
    } else {
      setTitle('');
      setParent(null);
      setPrevious(null);
      setNext(null);
    }
  }, [blogPost, isCreating]);

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

  const routeOptions = useMemo(() => routes.map(route => ({
    value: route.path,
    label: route.title || route.path
  })), [routes]);

  if (!isEditing && !isCreating) return null;

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

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

  const handleSave = async () => {
    setValidationErrors({
      title: false,
      urlPath: false
    });

    const errors = {
      title: !title.trim(),
      urlPath: !currentPath.trim()
    };

    if (errors.title || errors.urlPath) {
      setValidationErrors(errors);
      return;
    }

    try {
      const updatedContent = {
        ...blogPost,
        path: currentPath,
        title,
        parent,
        previous,
        next
      };

      await blogMenuProcessor.saveOrUpdateContent(updatedContent);
      dispatch(setBlogContent(updatedContent));
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Error saving content. Please try again later.');
    }
  };

  return (
    <div className={`edit-page-content ${(isEditing || isCreating) ? 'visible' : ''}`}>
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
              value={currentPath}
              readOnly
              placeholder="URL path"
              className="url-path-input"
            />
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
