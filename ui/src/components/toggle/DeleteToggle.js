import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { blogContentProcessor } from '../../processor/blogContentProcessor';
import { fetchRouteMap } from '../../const/routes';
import { setRouteItems } from '../../redux/slices/routesSlice';
import './styles/Toggle.css';

function DeleteToggle() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const activeRoute = useSelector(state => state.routes.activeRoute);
  const routes = useSelector(state => state.routes.items);

  const findNavigationTarget = () => {
    const currentRoute = routes.find(route => route.path === activeRoute);
    if (!currentRoute) return '/';

    // Find siblings with same parent
    const siblings = routes.filter(route => route.parent === currentRoute.parent);
    const currentIndex = siblings.findIndex(route => route.path === activeRoute);

    // Try to find previous sibling
    if (currentIndex > 0) {
      return siblings[currentIndex - 1].path;
    }
    // Try to find next sibling
    if (currentIndex < siblings.length - 1) {
      return siblings[currentIndex + 1].path;
    }
    // If no siblings, return parent or root
    return currentRoute.parent || '/';
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      try {
        const targetPath = findNavigationTarget();
        await blogContentProcessor.deleteBlogContentByPath(activeRoute);
        
        // Fetch updated routes and navigate
        const updatedRoutes = await fetchRouteMap();
        dispatch(setRouteItems(updatedRoutes));
        navigate(targetPath);
      } catch (error) {
        console.error('Error deleting page:', error);
        alert('Failed to delete page. Please try again later.');
      }
    }
  };

  return (
    <button
      className="action-toggle delete-toggle"
      title="Delete page"
      disabled={isEditing || isCreating}
      onClick={handleDelete}
    >
      <span className="text">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </span>
    </button>
  );
}

export default DeleteToggle; 