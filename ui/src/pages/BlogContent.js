import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../styles/page.css';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import { blogContentProcessor } from '../processor/blogContentProcessor';
import EditPageContent from '../components/EditPageContent';
import HTMLComposer from '../components/HTMLComposer';
import { useNotification } from '../contexts/NotificationContext';
import { parseContent } from '../utils/contentParser';
import { useConfirmation } from '../contexts/ConfirmationContext';
import { ROUTES, isNewPageRoute } from '../utils/routeConstants';

function BlogContent({ updateMainContentEditableContent, isLoggedIn, routes, onContentLoaded }) {
    const [content, setContent] = useState('');
    const [rawContent, setRawContent] = useState('');
    const [contentReadonly, setContentReadonly] = useState('');
    const [blogPost, setBlogPost] = useState('');
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState("Long Bui's Blog | VectorDI");
    const [pageDescription, setPageDescription] = useState("Explore our latest blog posts on various topics including technology, programming, and web development.");
    const canonicalUrl = `https://blog.longbui.net${location.href}`;
    const { showNotification } = useNotification();
    const [isRawEditor, setIsRawEditor] = useState(false);
    const { showConfirmation } = useConfirmation();
    const [isEditing, setIsEditing] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const path = location.pathname.trimStart("/");
    const [author, setAuthor] = useState('Long Bui');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [originalContent, setOriginalContent] = useState(null);
    const [isPublished, setIsPublished] = useState(false); // State for published status
    const navigate = useNavigate();

    const updateContent = (blogData) => {
        if (!blogData) {
            blogData = blogPost;
        }
        const currentRoute = routes?.find(route => route.path === path);
        if (blogData && blogData.content) {
            let parsedContent = parseContent(blogData.content, path);
            setContent(parsedContent);
            setRawContent(blogData.content);
            setContentReadonly(blogData.content);
            setPageTitle(`${blogData.title} | VectorDI`);
            setPageDescription(blogData.title || blogData.title || '');
            setAuthor(blogData.author || 'Long Bui');
            setLastUpdated(blogData.updated_at || new Date().toISOString());
            // Update MainContent's editable content
            updateMainContentEditableContent(blogData.content);
        } else {
            setContent(<p>No content found for this path.</p>);
            updateMainContentEditableContent('');
        }
        setIsPublished(currentRoute.is_published || false); // Set published state
        onContentLoaded();
    }

    // Add this new useEffect to handle auto-creation mode
    useEffect(() => {
        if (isNewPageRoute(location.pathname) && isLoggedIn) {
            handleCreate();
        }
    }, [location.pathname]); // Add necessary dependencies if needed
    
    useEffect(() => {
        const loadBlogContent = async () => {
            if (!isNewPageRoute(location.pathname)) {
                const blogData = await blogMenuProcessor.createBlogMenuContentByPath(path);
                setBlogPost(blogData);
                return blogData;
            }
        };

        const fetchBlogContent = async () => {
            try {
                const blogData = await loadBlogContent();
                if (!isCreating) {
                    updateContent(blogData);
                }
                onContentLoaded?.();
            } catch (error) {
                console.error('Error fetching blog content:', error);
                setContent(<p>Error loading blog content. Please try again later.</p>);
                updateMainContentEditableContent('');
            }
        };

        fetchBlogContent();
    }, [path, onContentLoaded, updateMainContentEditableContent, isCreating]);
    
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

            const blogContentUpdate = {
                path: path,
                content: rawContent,
                title: routeInfo.title,
                parent: routeInfo.parent,
                previous: routeInfo.previous,
                next: routeInfo.next
            };

            await blogContentProcessor.saveOrUpdateContent(blogContentUpdate);
            
            showNotification({
                type: 'success',
                title: 'Success',
                message: 'Content saved successfully!',
                duration: 1
            });

            setIsCreating(false);
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
        // Update the raw content when HTMLComposer content changes
        if (rawContent !== newContent) {
            setRawContent(newContent);
        }
    };

    const handleEditToggle = async () => {
        if (isEditing) {
            if (isCreating) {
                // Restore original content
                navigate(-1); // This will go back to the previous page
                setBlogPost(originalContent.blogPost);
                setRawContent(originalContent.rawContent);
                setContentReadonly(originalContent.contentReadonly);
                setContent(originalContent.content);
                setIsCreating(false);
                setOriginalContent(null);
            }
            
            setIsExiting(true);
            setTimeout(async () => {
                await setIsEditing(false);
                await updateContent();
                setIsExiting(false);
            }, 0);
        } else {
            await setIsEditing(true);
            await updateContent();
        }
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
        setIsEditing(true);
        setIsCreating(true);
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

    // Add the handlePublish function
    const handlePublish = async () => {
        try {
            const newPublishStatus = !isPublished; // Toggle the publish status
            await blogMenuProcessor.publishBlogMenu(path, newPublishStatus); // Send the path and new publish status
            setIsPublished(newPublishStatus); // Update the local state
            if (newPublishStatus){
                showNotification({
                    type: 'success',
                    title: 'Success',
                    message: newPublishStatus ? 'Content published successfully!' : 'Content unpublished successfully!',
                    duration: 3
                });
            } else {
                showNotification({
                    type: 'warning',
                    title: 'Success',
                    message: newPublishStatus ? 'Content published successfully!' : 'Content unpublished successfully!',
                    duration: 3
                });
            }
        } catch (error) {
            console.error('Error publishing content:', error);
            showNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to update publish status.',
                duration: 3
            });
        }
    };

    // Add useEffect for keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Only handle shortcuts if logged in
            if (!isLoggedIn) return;

            const isModifierKey = navigator.platform.toUpperCase().indexOf('MAC') >= 0 
                ? event.metaKey  // Command key for Mac
                : event.ctrlKey; // Control key for Windows/Linux
            if (!isModifierKey) return;

            if (!isEditing) { // Only handle these shortcuts when not editing
                if (event.key === 'e') {
                    handleEditToggle();
                } else if (event.key === 'c' ) { // Updated to require modifier key
                    event.preventDefault(); // Prevent default copy behavior
                    handleCreate();
                }
            } else {
                if (event.key === 'Escape') {
                    handleEditToggle();
                } else if (event.key === 'r') {
                    setIsRawEditor(!isRawEditor);
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isEditing, isLoggedIn]);

    if (!content && !isCreating) {
        return <div>Loading...</div>;
    }

    return (
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
                        "image": "https://longbui.net/assets/images/logo.png",
                        "author": {
                            "@type": "Personal",
                            "name": "Long Bui"
                        },
                        "publisher": {
                            "@type": "Personal",
                            "name": "Long Bui",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://longbui.net/assets/images/logo.png"
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
                            src="https://longbui.net/assets/images/logo.png" 
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
                    </div>
                </div>
            </div>

            {isLoggedIn ? (
                <>
                    <div className="content-actions">
                        <div className="content-actions-controllers">
                            <button 
                                onClick={handleCreate}
                                className={`action-button create-button ${isCreating ? 'active' : ''}`}
                                title={isEditing ? "Finish editing first" : "Create New Page (C)"}
                                disabled={isEditing || isCreating}
                            >
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
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <button 
                                onClick={handleEditToggle} 
                                className={`action-button edit-button ${isEditing ? 'active' : ''}`}
                                title={isEditing ? "Exit Edit Mode (Esc)" : "Edit Page (E)"}
                            >
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
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={handleDelete} 
                                className="action-button delete-button"
                                title="Delete page"
                                disabled={isEditing || isCreating}
                            >
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
                            </button>

                            {/* Publish Button as a boolean toggle */}
                            <button 
                                onClick={handlePublish} 
                                className={`action-button publish-button ${isPublished ? 'active' : ''}`}
                                title={isPublished ? "Unpublish Page" : "Publish Page"}
                                disabled={isEditing || isCreating}
                            >
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
                            </button>

                            {isEditing && (
                                <button 
                                    onClick={() => setIsRawEditor(!isRawEditor)} 
                                    className={`editor-toggle-button visible ${isRawEditor ? 'raw' : 'rich'}`}
                                >
                                    {isRawEditor ? '📝 Editor' : '</>HTML'}
                                </button>
                            )}
                        </div>
                        {
                            isEditing && (
                                <EditPageContent 
                                    onSave={handleSave}
                                    onCancel={handleEditToggle}
                                    currentPath={location.pathname}
                                    routes={routes}
                                    blogPost={blogPost}
                                />
                            )
                        }
                    </div>
                    <div className={"content-body " + (isEditing ? 'editing' : '')}>
                        {
                            isEditing ? (
                                isRawEditor ? (
                                    <textarea 
                                        className="raw-content-editor"
                                        value={rawContent} 
                                        onChange={(e) => {
                                            setRawContent(e.target.value);
                                        }}
                                        placeholder="Enter raw HTML content..."
                                    />
                                ) : (
                                    <HTMLComposer
                                        initialContent={contentReadonly}
                                        onChange={handleContentChange}
                                        isEditing={isEditing}
                                    />
                                )
                            ) : content
                        }
                    </div>
                    
                </>
            ) : content}
        </article>
    );
}

export default BlogContent;
