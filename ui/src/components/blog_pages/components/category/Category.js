import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveRoute } from '../../../../redux/slices/routesSlice';
import { useNavigate } from 'react-router-dom';
import './styles/Category.css';

const Category = () => {
    const navigate = useNavigate();
    const routes = useSelector((state) => state.routes.items);
    
    // Filter menus that have no parent or parent is "/" and sort by sequence
    const categories = routes
        .filter(route => route.path !== "/" && !route.parent)
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
