import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './styles/page.css';
import { blogMenuProcessor } from '../../processor/blogMenuProcessor';
import { blogContentProcessor } from '../../processor/blogContentProcessor';
import HTMLComposer from './HTMLComposer';
import { useNotification } from '../../contexts/NotificationContext';
import { parseContent } from '../../utils/contentParser';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { ROUTES, isNewPageRoute } from '../../utils/routeConstants';
import { useMenuContext } from '../../contexts/MenuContext';
import { processRawContent } from '../../utils/contentUtils';
import ImageViewer from './ImageViewer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookReader } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setEditing, setCreating, setPublished } from '../../redux/slices/editingSlice';
import { loadBlogContent } from '../../utils/blogContentUtils';

async function updateBlogContent(rawContent, path, routeInfo, showNotification) {
    const processedContent = await processRawContent(rawContent, path, showNotification);

    const blogContentUpdate = {
        path: path,
        content: processedContent,
        title: routeInfo.title,
        parent: routeInfo.parent,
        previous: routeInfo.previous,
        next: routeInfo.next
    };
    if (processedContent){
        return await blogContentProcessor.saveOrUpdateContent(blogContentUpdate);
    } else {
        return null;
    }
}

function BlogContent({ updateMainContentEditableContent, onContentLoaded }) {
    const [content, setContent] = useState('');
    const [rawContent, setRawContent] = useState('');
    const [contentReadonly, setContentReadonly] = useState('');
    const [blogPost, setBlogPost] = useState('');
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState("Long Bui's Blog | VectorDI");
    const [pageDescription, setPageDescription] = useState("Explore our latest blog posts on various topics including technology, programming, and web development.");
    const canonicalUrl = `https://blog.longbui.net${location.href}`;
    const { showNotification } = useNotification();
    const { showConfirmation } = useConfirmation();
    const path = location.pathname.trimStart("/");
    const [author, setAuthor] = useState('Long Bui');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [totalViews, setTotalViews] = useState(0);
    const [originalContent, setOriginalContent] = useState(null);
    const [isLoading, setisLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

    // Redux
    const dispatch = useDispatch();
    const isEditing = useSelector((state) => state.editing.isEditing);
    const isCreating = useSelector((state) => state.editing.isCreating);
    const isRawEditor = useSelector((state) => state.editing.isRawEditor);
    const isLoggedIn = useSelector((state) => state.login.isLoggedIn);


    const addImageClickHandler = () => {
        setTimeout(() => {
            const images = document.querySelectorAll('.blog-content img:not(.resizable-image)');
            images.forEach(img => {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    setSelectedImage(img.src);
                    setIsImageViewerOpen(true);
                });
            });
        }, 0);
    }

    const updateContent = (blogData) => {
        if (blogData) {
            const { content: blogContent, title, description, author, last_updated, total_views } = blogData;
            const parsedContent = parseContent(blogContent);
            setContent(parsedContent);
            setRawContent(blogContent);
            setContentReadonly(blogContent);
            setOriginalContent(blogContent);
            setPageTitle(title ? `${title} | VectorDI` : "Long Bui's Blog | VectorDI");
            setPageDescription(description || "Explore our latest blog posts on various topics including technology, programming, and web development.");
            setAuthor(author || 'Long Bui');
            setLastUpdated(last_updated);
            setTotalViews(total_views);
            updateMainContentEditableContent(blogContent);
            addImageClickHandler()
        } else {
            setContent(<p>No content found for this path.</p>);
            updateMainContentEditableContent('');
        }
        dispatch(setPublished(blogData?.is_published || false));
        onContentLoaded();
    }

    useEffect(() => {
        if (isNewPageRoute(location.pathname) && isLoggedIn) {
            handleCreate();
        }
    }, [location.pathname]);
    
    useEffect(() => {
        const fetchBlogContent = async () => {
            try {
                setisLoading(true);
                const blogData = await loadBlogContent(path, dispatch);
                
                if (!isCreating && blogData) {
                    updateContent(blogData);
                }
                onContentLoaded?.();
            } catch (error) {
                console.error('Error fetching blog content:', error);
                setContent(<p>Error loading blog content. Please try again later.</p>);
                updateMainContentEditableContent('');
            } finally {
                setisLoading(false);
            }
        };

        fetchBlogContent();
    }, [path, dispatch, onContentLoaded, updateMainContentEditableContent, isCreating]);

    const handleEditToggle = async () => {
        if (isEditing) {
            if (isCreating) {
                navigate(-1);
                setBlogPost(originalContent.blogPost);
                setRawContent(originalContent.rawContent);
                setContentReadonly(originalContent.contentReadonly);
                setContent(originalContent.content);
                dispatch(setCreating(false));
                setOriginalContent(null);
            }
            dispatch(setEditing(false));
            updateContent();
        } else {
            dispatch(setEditing(true));
            updateContent();
        }
    };

    // Add useEffect for keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (!isLoggedIn) return;

            const isModifierKey = navigator.platform.toUpperCase().indexOf('MAC') >= 0 
                ? event.metaKey  // Command key for Mac
                : event.ctrlKey; // Control key for Windows/Linux
            if (!isModifierKey) return;

            if (!isEditing) {
                if (event.key === 'e') {
                    handleEditToggle();
                }
            } else {
                if (event.key === 'Escape') {
                    handleEditToggle();
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isEditing, isLoggedIn]);

    const handleSave = async (path, routeInfo) => {
        try {
            if (isNewPageRoute(path)) {
                showNotification({
                    type: 'error',
                    title: 'Invalid URL',
                    message: 'Cannot use /new-page as the URL. Please choose a different path.',
                    duration: 3
                });
                return;
            }

            var res = await updateBlogContent(rawContent, path, routeInfo, showNotification);
            if (res){
                showNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Content saved successfully!',
                    duration: 1
                });
                dispatch(setCreating(false));
                setOriginalContent(null);
                handleEditToggle();
                
                setTimeout(() => {
                    let location = window.location.href;
                    let index = location.indexOf('#');
                    if (index !== -1) {
                        location = location.substring(0, index);
                    }
                    window.location.href = location;
                }, 500);
            }

        } catch (error) {
            console.error('Error saving content:', error);
        }
    };

    const handleDelete = () => {
        showConfirmation({
            title: 'Delete Page',
            message: 'Are you sure you want to delete this page? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await blogContentProcessor.deleteBlogContentByPath(location.pathname);
                    showNotification({
                        type: 'success',
                        title: 'Success',
                        message: 'Page deleted successfully',
                        duration: 3
                    });
                    window.location.href = '/';
                } catch (error) {
                    console.error('Error deleting content:', error);
                    showNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to delete page',
                        duration: 3
                    });
                }
            }
        });
    };

    const handleContentChange = (newContent) => {
        setRawContent(newContent);
        updateMainContentEditableContent(newContent);
    };

    const setCreateData = () => {
        const { state } = location;
        const parentPath = state?.parentPath || '';
        // Set empty content with parent path if provided
        setBlogPost({
            content: '',
            title: 'New Page',
            path: '/new-page',
            parent: parentPath,
            previous: '',
            next: ''
        });
        setRawContent('');
        setContentReadonly('');
        setContent('');
        dispatch(setCreating(true));
    }

    const handleCreate = () => {
        // Only store original content if we're not already in creation mode
        setOriginalContent({
            blogPost,
            rawContent,
            contentReadonly,
            content
        });
        
        setCreateData();

        // Only navigate if we're not already at new-page route
        if (!isNewPageRoute(location.pathname)) {
            navigate(ROUTES.NEW_PAGE);
        }
    };

    if (!content && !isCreating) {
        return <div className="loading-panel">Loading...</div>;
    }

    return (
        <>{
            isLoading ? <div className="loading-panel">Loading...</div> :
            <article className="blog-content">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">
                    {`
                    {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": "${pageTitle}",
                        "description": "${pageDescription}",
                        "image": "https://longbui.net/assets/images/logo/low-avatar.jpg",
                        "author": {
                            "@type": "Personal",
                            "name": "Long Bui"
                        },
                        "publisher": {
                            "@type": "Personal",
                            "name": "Long Bui",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://longbui.net/assets/images/logo/low-avatar.jpg"
                            }
                        },
                        "datePublished": "2024-10-23T08:00:00+08:00",
                        "dateModified": "2024-10-23T08:00:00+08:00"
                    }
                    `}
                </script>
            </Helmet>

            <div className="blog-meta">
                <div className="author-info">
                    <div className="author-avatar">
                        <img 
                            src="https://longbui.net/assets/images/logo/low-avatar.jpg" 
                            alt={author}
                            className="avatar-image"
                        />
                    </div>
                    <div className="author-details">
                        <span className="author-name">{author}</span>
                        <span className="post-date">
                            Last updated: {
                                lastUpdated ? 
                                new Date(lastUpdated).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Asia/Saigon',
                                    timeZoneName: 'short',
                                }) : 
                                'Unknown date'
                            }
                        </span>
                        <span className="total-views">
                            <FontAwesomeIcon icon={faBookReader} /> {totalViews || 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="content-body">
                {isEditing ? (
                    isRawEditor ? (
                        <textarea 
                            className="raw-content-editor"
                            value={rawContent} 
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Enter raw HTML content..."
                        />
                    ) : (
                        <HTMLComposer
                            initialContent={contentReadonly}
                            onChange={handleContentChange}
                        />
                    )
                ) : content}
            </div>
            </article>
        }
        <ImageViewer 
            isOpen={isImageViewerOpen}
            onClose={() => setIsImageViewerOpen(false)}
            imageUrl={selectedImage}
        />
        </>
    );
}

export default BlogContent;
