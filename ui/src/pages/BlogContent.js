import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../styles/page.css';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import { blogContentProcessor } from '../processor/blogContentProcessor';
import EditPageContent from '../components/EditPageContent';
import HTMLComposer from '../components/HTMLComposer';
import { useNotification } from '../contexts/NotificationContext';
import { parseContent } from '../utils/contentParser';
import { useConfirmation } from '../contexts/ConfirmationContext';

function BlogContent({ updateMainContentEditableContent, isLoggedIn, routes, onContentLoaded}) {
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

    const updateContent = (blogData) => {
        if (!blogData){
            blogData = blogPost
        }
        if (blogData && blogData.content) {
            let parsedContent = parseContent(blogData.content, path);
            setContent(parsedContent);
            setRawContent(blogData.content);
            setContentReadonly(blogData.content);
            setPageTitle(`${blogData.title} | VectorDI`);
            setPageDescription(blogData.title || blogData.title || '');
            setAuthor(blogData.author || 'Long Bui');
            setLastUpdated(blogData.lastUpdated || new Date().toISOString());
            
            // Update MainContent's editable content
            updateMainContentEditableContent(blogData.content);
        } else {
            setContent(<p>No content found for this path.</p>);
            updateMainContentEditableContent('');
        }
        onContentLoaded()
    }

    useEffect(() => {
        const loadBlogContent = async () => {
            const blogData = await blogMenuProcessor.createBlogMenuContentByPath(path);
            setBlogPost(blogData);
            return blogData;
        };

        const fetchBlogContent = async () => {
            try {
                const blogData = await loadBlogContent();
                updateContent(blogData);
                onContentLoaded?.();
            } catch (error) {
                console.error('Error fetching blog content:', error);
                setContent(<p>Error loading blog content. Please try again later.</p>);
                updateMainContentEditableContent('');
            }
        };

        fetchBlogContent();
    }, [path, onContentLoaded, updateMainContentEditableContent]);
    
    const handleSave = async (path, routeInfo) => {
        try {
            const blogContentUpdate = {
                path: path,
                content: rawContent,
                title: routeInfo.title,
                parent: routeInfo.parent,
                previous: routeInfo.previous,
                next: routeInfo.next
            };

            await blogContentProcessor.saveOrUpdateContent(blogContentUpdate);
            
            // Debug log
            
            showNotification({
                type: 'success',
                title: 'Success',
                message: 'Content saved successfully!',
                duration: 1.5
            });

            handleEditToggle()
            setTimeout(() => {
                let location = window.location.href;
                let index = location.indexOf('#');
                if (index !== -1) {
                    location = location.substring(0, index);
                }
                window.location.href = location;
            }, 1500);


        } catch (error) {
            console.error('Error saving content:', error);
            
            // Debug log
            
            showNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to save content. Please try again.' + error,
                duration: 5
            });
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
            setIsExiting(true);
            // Wait for animation to complete before hiding
            setTimeout(async () => {
                await setIsEditing(false);
                await updateContent()
                setIsExiting(false);
            }, 0); // Match animation duration
        } else {
            await setIsEditing(true);
            await updateContent()
        }
    };

    if (!content) {
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
                                    onClick={handleEditToggle} 
                                    className={`action-button edit-button ${isEditing ? 'active' : ''}`}
                                    title={isEditing ? "Exit Edit Mode" : "Edit Page"}
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
                                    <span className="button-text">{isEditing ? 'Exit' : 'Edit'}</span>
                                    </button>
                                    
                            <button 
                                onClick={handleDelete} 
                                className="action-button delete-button"
                                title="Delete page"
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
                                <span className="button-text">Delete</span>
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
                            ): content
                        }
                    </div>
                    
                </>
            ) : content}
        </article>
    );
}

export default BlogContent;
