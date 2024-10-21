import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../styles/page.css';
import { parseContent } from '../utils/contentParser';
import { blogMenuProcessor } from '../processor/blogMenuProcessor';

function BlogContent({ updateMainContentEditableContent }) {
    const [content, setContent] = useState(null);
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
                    setPageTitle(`${blogPost.title} | VectorDI`);
                    setPageDescription(blogPost.description || blogPost.excerpt || '');
                    
                    // Update MainContent's editable content
                    updateMainContentEditableContent(blogPost.content);
                } else {
                    setContent(<p>No content found for this path.</p>);
                    updateMainContentEditableContent('');
                }
            } catch (error) {
                console.error('Error fetching blog content:', error);
                setContent(<p>Error loading blog content. Please try again later.</p>);
                updateMainContentEditableContent('');
            }
        };

        fetchBlogContent();
    }, [location.pathname, updateMainContentEditableContent]);

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

            {content}
        </article>
    );
}

export default BlogContent;
