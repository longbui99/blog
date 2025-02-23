import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { blogMenuProcessor } from '../../processor/blogMenuProcessor';
import { fetchRouteMap } from '../../const/routes';
import { setRouteItems } from '../../redux/slices/routesSlice';
import { useMenuContext } from '../../contexts/MenuContext';
import './styles/Toggle.css';

function PublishToggle() {
  const { publishToEvent } = useMenuContext();
  const dispatch = useDispatch();
  const isEditing = useSelector(state => state.editing.isEditing);
  const isCreating = useSelector(state => state.editing.isCreating);
  const activeRoute = useSelector(state => state.routes.activeRoute);
  const routes = useSelector(state => state.routes.items);
  let currentRoute = routes.find(route => route.path === activeRoute);
  let isPublished = currentRoute?.is_published || false;
  
  // Find current route to get published status
  const handlePublishToggle = async () => {
    try {
    
      await blogMenuProcessor.publishBlogMenu(activeRoute, !isPublished);
      // Refresh routes to get updated published status
      publishToEvent(activeRoute, !isPublished);
      let updatedRoutes = await fetchRouteMap();
      dispatch(setRouteItems(updatedRoutes));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status. Please try again later.');
    }
  };

  return (
    <button
      className={`action-toggle publish-toggle ${isPublished ? 'active' : ''}`}
      title={isPublished ? "Unpublish Page" : "Publish Page"}
      disabled={isEditing || isCreating}
      onClick={handlePublishToggle}
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
          <path d={isPublished ? "M12 2L2 12h3v8h8v-3h3L12 2z" : "M12 2L2 12h3v8h8v-3h3L12 2z"} />
        </svg>
      </span>
    </button>
  );
}

export default PublishToggle; 