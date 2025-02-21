import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import { isNewPageRoute } from './routeConstants';
import { setBlogContent, setPublished } from '../redux/slices/blogSlice';

export const loadBlogContent = async (path, dispatch) => {
    try {
        if (isNewPageRoute(path)) {
            dispatch(setBlogContent(null));
            dispatch(setPublished(false));
            return null;
        }

        const blogData = await blogMenuProcessor.getBlogMenuContentByPath(path);
        
        // Update Redux state with the blog content
        dispatch(setBlogContent(blogData));
        dispatch(setPublished(blogData?.is_published || false));
        
        return blogData;
    } catch (error) {
        console.error('Error loading blog content:', error);
        throw error;
    }
}; 