import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import './styles/EditPageContent.css';
import { blogContentProcessor } from '../../processor/blogContentProcessor';
import { useDispatch, useSelector } from 'react-redux';
import { setEditing, setCreating } from '../../redux/slices/editingSlice';
import storageRegistry from '../../storage/storage_registry';

function EditPageContent() {
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const activeRoute = useSelector(state => state.routes.activeRoute);
  const routes = useSelector(state => state.routes.items);
  const blogPost = useSelector(state => state.blog.content);

  const [title, setTitle] = useState('');
  const [parent, setParent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    urlPath: false
  });

  // Initialize form with blog content from Redux
  useEffect(() => {
    if (blogPost && !isCreating) {
      setTitle(blogPost.title || '');
      
      // Find parent, previous, and next from routes
      const currentPath = activeRoute;
      
      // Find the current route
      const currentRoute = routes.find(route => route.path === currentPath);
      
      if (currentRoute) {
        // Set parent
        setParent(currentRoute.parent);
        
        // Find siblings (routes with same parent)
        const siblings = routes
          .filter(route => route.parent === currentRoute.parent)
          .sort((a, b) => a.sequence - b.sequence);
        
        // Find current index
        const currentIndex = siblings.findIndex(route => route.path === currentPath);
        
        // Set previous and next
        setPrevious(currentIndex > 0 ? siblings[currentIndex - 1].path : null);
        setNext(currentIndex < siblings.length - 1 ? siblings[currentIndex + 1].path : null);
      }
    } else {
      setTitle('');
      setParent(null);
      setPrevious(null);
      setNext(null);
    }
  }, [blogPost, isCreating, routes, activeRoute]);

  const routeOptions = useMemo(() => routes.map(route => ({
    value: route.path,
    label: route.title || route.path
  })), [routes]);

  if (!isEditing && !isCreating) return null;

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
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
      urlPath: !activeRoute.trim()
    };

    if (errors.title || errors.urlPath) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (storageRegistry.has('currentContent')) {
        const updatedContent = {
          content: storageRegistry.get('currentContent'),
          path: activeRoute,
          title: title,
          parent: parent,
          previous: previous,
          next: next
        };
        await blogContentProcessor.saveOrUpdateContent(updatedContent);
        if (isCreating) {
          dispatch(setEditing(false));
        } else if (isEditing) {
          dispatch(setCreating(false));
          window.location.pathname = activeRoute;
          window.location.reload();
        }
      }

    } catch (error) {
      console.error('Error saving content:', error);
      setError('Error saving content. Please try again later.');
    }
  };

  const handleCancel = () => {
    // Reset form state
    // Close the popup by dispatching the appropriate action
    if (isEditing) {
      dispatch(setEditing(false));
    } else if (isCreating) {
      dispatch(setCreating(false));
    }
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--bg-primary)',
      borderColor: state.isFocused ? 'var(--primary-500)' : 'var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      minHeight: '40px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'var(--primary-400)'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'var(--primary-500)'
        : state.isFocused 
          ? 'var(--bg-tertiary)'
          : 'var(--bg-primary)',
      color: state.isSelected 
        ? 'var(--color-white)'
        : 'var(--text-primary)',
      padding: 'var(--spacing-2)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--primary-600)'
      }
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-primary)'
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text-primary)'
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--text-tertiary)'
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: 'var(--border-primary)'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'var(--text-tertiary)',
      '&:hover': {
        color: 'var(--text-primary)'
      }
    })
  };

  return (
    <div className={`edit-page-content ${(isEditing || isCreating) ? 'visible' : ''}`}>
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
            <input
              type="text"
              value={activeRoute}
              readOnly
              placeholder="URL path"
              className="url-path-input"
            />
          </div>
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
              styles={selectStyles}
              placeholder="Select..."
            />
          </div>
          <div className="select-container">
            <label>Previous:</label>
            <Select
              options={routeOptions}
              value={routeOptions.find(option => option.value === previous)}
              onChange={handlePreviousChange}
              isClearable
              styles={selectStyles}
              placeholder="Select..."
            />
          </div>
          <div className="select-container">
            <label>Next:</label>
            <Select
              options={routeOptions}
              value={routeOptions.find(option => option.value === next)}
              onChange={handleNextChange}
              isClearable
              styles={selectStyles}
              placeholder="Select..."
            />
          </div>
        </div>
      </div>
      <div className="edit-actions">
        <button 
          onClick={handleSave} 
          className="save-button"
        >
          Save
        </button>
        <button 
          onClick={handleCancel} 
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditPageContent;
