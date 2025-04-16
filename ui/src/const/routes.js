import { blogMenuProcessor } from '../processor/blogMenuProcessor';


// Function to fetch blog menus
export const fetchRouteMap = async () => {
  try {
    const menus = await blogMenuProcessor.getBlogMenus();
    return menus.map(route => ({
      ...route,
    }));
  } catch (error) {
    console.error('Error fetching blog menus:', error);
    return [];
  }
};

// In routes.js
const STORAGE_KEY = 'lbblog_viewed_routes';

// Function to mark a route as viewed in localStorage
export const markRouteAsViewed = (route) => {
  if (!route) return false;
  
  try {
    // Get currently stored viewed routes
    const viewedRoutesJson = localStorage.getItem(STORAGE_KEY) || '{}';
    const viewedRoutes = JSON.parse(viewedRoutesJson);
    
    // Mark this route as viewed
    viewedRoutes[route.path] = route.updated_at; // false means not new
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedRoutes));
    return true;
  } catch (error) {
    console.error('localStorage error:', error);
    return false;
  }
};

// Modify the existing checkNewRoute function instead of creating a new one
export const checkNewRoute = (routes) => {
  try {
    // Get viewed routes from localStorage
    const viewedRoutesJson = localStorage.getItem(STORAGE_KEY) || '{}';
    const viewedRoutes = JSON.parse(viewedRoutesJson);
    
    // If localStorage is empty, initialize it with all routes marked as not new
    if (Object.keys(viewedRoutes).length === 0) {
      const initialViewedRoutes = {};
      routes.forEach(route => {
        initialViewedRoutes[route.path] = route.updated_at;
        route.isNew = false;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialViewedRoutes));
    } else{
      for (const route of routes) {
        route.isNew = String(route.updated_at)?.slice(0, 16) !== String(viewedRoutes[route.path])?.slice(0, 16);
      }
    }
    
  } catch (error) {
    console.error('Error checking for new routes:', error);
  }
};
