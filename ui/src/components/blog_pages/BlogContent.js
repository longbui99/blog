import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './styles/page.css';
import HTMLComposer from './HTMLComposer';
import { parseContent } from '../../utils/contentParser';
import { useDispatch, useSelector } from 'react-redux';
import { setPublished } from '../../redux/slices/editingSlice';
import { loadBlogContent } from '../../utils/blogContentUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookReader } from '@fortawesome/free-solid-svg-icons';
import RawEditor from './RawEditor';

function BlogContent({ onContentLoaded }) {
    const [content, setContent] = useState('');
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState("Long Bui's Blog | VectorDI");
    const [pageDescription, setPageDescription] = useState("Explore our latest blog posts on various topics including technology, programming, and web development.");
    const canonicalUrl = `https://blog.longbui.net${location.href}`;
    const path = location.pathname.trimStart("/");
    const [author, setAuthor] = useState('Long Bui');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [totalViews, setTotalViews] = useState(0);
    const [isLoading, setisLoading] = useState(true);

    // Redux
    const dispatch = useDispatch();
    const isEditing = useSelector((state) => state.editing.isEditing);
    const isCreating = useSelector((state) => state.editing.isCreating);
    const isRawEditor = useSelector((state) => state.editing.isRawEditor);

    useEffect(() => {
        const fetchBlogContent = async () => {
            try {
                setisLoading(true);
                const blogData = await loadBlogContent(path, dispatch);
                
                if (!isCreating && blogData) {
                    if (blogData) {
                        const { content: blogContent, title, description, author, updated_at, total_views } = blogData;
                        const parsedContent = parseContent(blogContent);
                        setContent(parsedContent);
                        setPageTitle(title ? `${title} | VectorDI` : "Long Bui's Blog | VectorDI");
                        setPageDescription(description || "Explore our latest blog posts on various topics including technology, programming, and web development.");
                        setAuthor(author || 'Long Bui');
                        setLastUpdated(updated_at);
                        setTotalViews(total_views);
                    } else {
                        setContent('');
                    }
                    dispatch(setPublished(blogData?.is_published || false));
                }
                onContentLoaded?.();
            } catch (error) {
                setContent('');
                console.error('Error fetching blog content:', error);
            } finally {
                setisLoading(false);
            }
        };

        fetchBlogContent();
    }, [path, dispatch, onContentLoaded, isCreating, isEditing]);


    const renderEditor = () => {
        if (!isEditing && !isCreating) {
            return <div className="content-body">{content}</div>;
        }

        return isRawEditor ? <RawEditor /> : <HTMLComposer />;
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
                {renderEditor()}
            </div>
            </article>
        }
        </>
    );
}

export default BlogContent;
