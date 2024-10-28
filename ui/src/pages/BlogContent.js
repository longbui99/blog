import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../styles/page.css';
import { parseContent } from '../utils/contentParser';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';
import { blogContentProcessor } from '../processor/blogContentProcessor';
import EditIcon from '../icons/EditIcon';
import EditPageContent from '../components/EditPageContent';
import HTMLComposer from '../components/HTMLComposer';

function BlogContent({ updateMainContentEditableContent, isLoggedIn, routes }) {
    const [content, setContent] = useState(null);
    const [rawContent, setRawContent] = useState(''); // Add this state for raw HTML
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState("Long Bui's Blog | VectorDI");
    const [pageDescription, setPageDescription] = useState("Explore our latest blog posts on various topics including technology, programming, and web development.");
    const canonicalUrl = `https://blog.longbui.net${location.href}`;

    useEffect(() => {
        const fetchBlogContent = async () => {
            try {
                const path = location.pathname.trimStart("/");
                const blogPost = await blogMenuProcessor.createBlogMenuContentByPath(path);
                
                if (blogPost && blogPost.content) {
                    const parsedContent = parseContent(blogPost.content, path);
                    setContent(parsedContent);
                    setRawContent(blogPost.content); // Store the raw content
                    setPageTitle(`${blogPost.title} | VectorDI`);
                    setPageDescription(blogPost.description || blogPost.excerpt || '');
                    
                    // Update MainContent's editable content
                    updateMainContentEditableContent(blogPost.content);
                } else {
                    setContent(<p>No content found for this path.</p>);
                    setRawContent('');
                    updateMainContentEditableContent('');
                }
            } catch (error) {
                console.error('Error fetching blog content:', error);
                setContent(<p>Error loading blog content. Please try again later.</p>);
                setRawContent('');
                updateMainContentEditableContent('');
            }
        };

        fetchBlogContent();
    }, [location.pathname, updateMainContentEditableContent]);


    const handleSave = async (path, updatedContent, routeInfo) => {
        try {
            const blogContentUpdate = {
                path: path,
                content: updatedContent,
                title: routeInfo.title,
                parent: routeInfo.parent,
                previous: routeInfo.previous,
                next: routeInfo.next
            };

            await blogContentProcessor.saveOrUpdateContent(blogContentUpdate);
            // Refresh the content
            window.location.reload();
        } catch (error) {
            console.error('Error saving content:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                await blogContentProcessor.deleteBlogContentByPath(location.pathname);
                window.location.href = '/';
            } catch (error) {
                console.error('Error deleting content:', error);
            }
        }
    };


    const handleCancel = () => {
    };
    const handleContentChange = (newContent) => {
    };

    if (!content) {
        return <div>Loading...</div>;
    }
    console.log(isLoggedIn)

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

            {isLoggedIn && (
                <div className="content-actions">
                    <button onClick={handleDelete} className="icon-button">
                        🗑️
                    </button>
                </div>
            )}

            {isLoggedIn ? (
                <EditPageContent 
                    onSave={handleSave}
                    onCancel={handleCancel}
                    currentPath={location.pathname}
                    routes={routes}
                />
            ) : null}

            <HTMLComposer
                initialContent={rawContent} // Pass the raw HTML content instead of parsed content
                onChange={handleContentChange}
                isEditing={isLoggedIn}
            />
        </article>
    );
}

export default BlogContent;
