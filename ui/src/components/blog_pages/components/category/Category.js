import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/Category.css';

const Category = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const routes = useSelector((state) => state.routes.items);
    
    // Determine which categories to show based on current path
    const categories = currentPath === '/' 
        ? routes
            .filter(route => route.path !== "/" && (!route.parent || route.parent === "/"))
            .sort((a, b) => a.sequence - b.sequence)
        : routes
            .filter(route => route.parent === currentPath)
            .sort((a, b) => a.sequence - b.sequence);

    // Function to find children pages of a category
    const findChildPages = (categoryPath) => {
        return routes
            .filter(route => route.parent === categoryPath)
            .sort((a, b) => a.sequence - b.sequence);
    };

    const handleCardClick = (path) => {
        navigate(path);
    };

    const handleChildClick = (e, path) => {
        e.stopPropagation();
        navigate(path);
    };

    // If no categories found, show a message or return null
    if (categories.length === 0) {
        return (
            <div className="category-container">
                <div className="category-empty-message">
                    No subcategories found for this page.
                </div>
            </div>
        );
    }

    return (
        <div className="category-container">
            <div className="category-grid">
                {categories.map((category) => {
                    const childPages = findChildPages(category.path);
                    
                    return (
                        <a 
                            key={category.path} 
                            className="category-card"
                            onClick={() => handleCardClick(category.path)}
                        >
                            <div className="category-card-content">
                                <div className="category-card-body">
                                    <h3 className="category-card-title">{category.title}</h3>
                                    
                                    {childPages.length > 0 && (
                                        <div className="category-tags">
                                            {childPages.map(child => (
                                                <span 
                                                    key={child.path} 
                                                    className="category-tag"
                                                    onClick={(e) => handleChildClick(e, child.path)}
                                                >
                                                    {child.title}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default Category;
