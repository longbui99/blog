import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import BlogContent from '../pages/BlogContent';


// Function to resolve component from string key
export const resolveComponent = (key) => {
  return BlogContent;
};

// Function to fetch blog menus
export const fetchRouteMap = async () => {
  try {
    const menus = await blogMenuProcessor.getBlogMenus();
    return menus.map(route => ({
      ...route,
      component: resolveComponent(route.component)
    }));
  } catch (error) {
    console.error('Error fetching blog menus:', error);
    return [];
  }
};
