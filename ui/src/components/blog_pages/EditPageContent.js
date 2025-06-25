import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import './styles/EditPageContent.css';
import { blogContentProcessor } from '../../processor/blogContentProcessor';
import { blogMenuProcessor } from '../../processor/blogMenuProcessor';
import { useDispatch, useSelector } from 'react-redux';
import { setEditing, setCreating } from '../../redux/slices/editingSlice';
import storageRegistry from '../../store/storage_registry';
import { useNavigate } from 'react-router-dom';
import { setActiveRoute, setRouteItems, updateRouteItem } from '../../redux/slices/routesSlice';
import { fetchRouteMap } from '../../const/routes';
import { DetermineAndSaveAttachments } from './utils/AttachmentManager';


function EditPageContent() {
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const activeRoute = useSelector(state => state.routes.activeRoute);
  const routes = useSelector(state => state.routes.items);
  const blogPost = useSelector(state => state.blog.content);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedPrevious, setSelectedPrevious] = useState(null);
  const [selectedNext, setSelectedNext] = useState(null);
  const [error, setError] = useState(null);
  const [urlPath, setUrlPath] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    urlPath: false
  });

  const routeOptions = useMemo(() => routes.map(route => ({
    value: route.path,
    label: route.title || route.path
  })), [routes]);
  
  // Initialize form with blog content from Redux
  useEffect(() => {
    if (isCreating) {
      setTitle('');
      // Set current route as parent when creating
      const currentRouteOption = routeOptions.find(option => option.value === activeRoute);
      setSelectedParent(currentRouteOption || null);
      setSelectedPrevious(null);
      setSelectedNext(null);
      setUrlPath('');
      setError(null);
      setValidationErrors({
        title: false,
        urlPath: false
      });
    } else if (blogPost && !isCreating) {
      setTitle(blogPost.title || '');
      
      // Find parent, previous, and next from routes
      const currentRoute = routes.find(route => route.path === activeRoute);
      
      if (currentRoute) {
        const parentRoute = routeOptions.find(option => option.value === currentRoute.parent);
        setSelectedParent(parentRoute || null);
        
        const siblings = routes
          .filter(route => route.parent === currentRoute.parent)
          .sort((a, b) => a.sequence - b.sequence);
        
        const currentIndex = siblings.findIndex(route => route.path === activeRoute);
        
        const prevRoute = currentIndex > 0 ? routeOptions.find(option => option.value === siblings[currentIndex - 1].path) : null;
        setSelectedPrevious(prevRoute);

        const nextRoute = currentIndex < siblings.length - 1 ? routeOptions.find(option => option.value === siblings[currentIndex + 1].path) : null;
        setSelectedNext(nextRoute);
        setUrlPath(currentRoute.path);
      }
    }
  }, [blogPost, isCreating, routes, activeRoute, routeOptions]);


  if (!isEditing && !isCreating) return null;

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (isCreating) {
      // Convert title to URL-friendly format
      const computedPath = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
        .trim();                      // Remove leading/trailing spaces
    
      setUrlPath("/" + computedPath);
    }
  };

  const handleParentChange = (selectedOption) => {
    setSelectedParent(selectedOption);
    setSelectedPrevious(null);
    setSelectedNext(null);
    setValidationErrors(prev => ({
      ...prev,
      urlPath: false
    }));
  };

  const handlePreviousChange = (selectedOption) => {
    setSelectedPrevious(selectedOption);
  };

  const handleNextChange = (selectedOption) => {
    setSelectedNext(selectedOption);
  };

  const handleUrlPathChange = async(e) => {
    setUrlPath(e.target.value);
    if (isCreating) {
      const isPathExists = await blogMenuProcessor.checkPathExists(e.target.value);
      if (isPathExists?.exists) {
        setError('Path already exists');
      } else {
        setError(null);
      }
    }
  };

  const handleSave = async () => {
    if (error){
      return;
    }
    if (isCreating) {
      const errors = {
        title: !title,
        urlPath: !urlPath
      };
      setValidationErrors(errors);

      if (errors.title || errors.urlPath) {
        setError('Please fill in all required fields');
        return;
      } else {
        setError(null);
      }
    }

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
          content: await DetermineAndSaveAttachments(storageRegistry.get('currentContent') || '', urlPath) || '',
          path: urlPath,
          title: title,
          parent: selectedParent ? selectedParent.value : null,
          previous: selectedPrevious ? selectedPrevious.value : null,
          next: selectedNext ? selectedNext.value : null
        };
        let response =await blogContentProcessor.saveOrUpdateContent(updatedContent);
        let currentRoute = routes.find(route => route.path === activeRoute);
        if (currentRoute) {
          let newRoute = {
            ...currentRoute,
            updated_at: response.updated_at
          };
          dispatch(updateRouteItem(newRoute));
          if (urlPath !== activeRoute) {
            dispatch(setActiveRoute(urlPath));
          }
        }
        if (isCreating) {
          dispatch(setCreating(false));
          navigate(urlPath);
          let routes = await fetchRouteMap();
          dispatch(setRouteItems(routes));
        } else if (isEditing) {
          dispatch(setEditing(false));
        }
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Error saving content. Please try again later.');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setSelectedParent(null);
    setSelectedPrevious(null);
    setSelectedNext(null);
    setError(null);
    setValidationErrors({
      title: false,
      urlPath: false
    });
    
    storageRegistry.remove('currentContent');
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
    <form 
      onSubmit={(e) => e.preventDefault()}
      className={`edit-page-content ${(isEditing || isCreating) ? 'visible' : ''}`}
    >
      
      <div className="edit-header">
        <div className="edit-title-group">
          <div className="title-input-container">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter page title *"
              className={`title-input ${validationErrors.title ? 'input-error' : ''}`}
              required
            />
          </div>

          <div className="url-input-container">
            <input
              type="text"
              value={urlPath}
              disabled={isEditing}
              onChange={handleUrlPathChange}
              placeholder="URL path"
              className="url-path-input"
              required
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
              value={selectedParent}
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
              value={selectedPrevious}
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
              value={selectedNext}
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
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default EditPageContent;
