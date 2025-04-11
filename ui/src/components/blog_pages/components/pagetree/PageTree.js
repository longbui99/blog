import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles/PageTree.css';

const PageTree = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const routes = useSelector((state) => state.routes.items);
    const currentPath = location.pathname;
    
    // Find the current route and all its ancestors
    const currentRoute = routes.find(route => route.path === currentPath);
    const ancestorPaths = [];
    let parentPath = currentRoute?.parent;
    
    // Build array of ancestor paths
    while (parentPath) {
        ancestorPaths.push(parentPath);
        const parentRoute = routes.find(route => route.path === parentPath);
        parentPath = parentRoute?.parent;
    }
    
    // Find the root node (top-most ancestor or current if it's a root)
    const rootPath = ancestorPaths.length > 0 
        ? ancestorPaths[ancestorPaths.length - 1] 
        : (currentRoute?.parent || currentPath);
    
    // Recursive function to build the page tree
    const buildPageTree = (path) => {
        // Find the route for the current path
        const route = routes.find(r => r.path === path);
        if (!route) return null;
        
        // Find all children of this path
        const children = routes
            .filter(r => r.parent === path)
            .sort((a, b) => a.sequence - b.sequence);
        
        const isActive = path === currentPath;
        const isAncestor = ancestorPaths.includes(path);
        
        return (
            <div key={path} className={`pagetree-item ${isActive ? 'active' : ''} ${isAncestor ? 'ancestor' : ''}`}>
                <div 
                    className="pagetree-item-title"
                    onClick={() => navigate(path)}
                >
                    {route.title}
                    {route.isNew && (
                        <span className="pagetree-new-indicator">NEW</span>
                    )}
                </div>
                
                {children.length > 0 && (
                    <div className="pagetree-children">
                        {children.map(child => buildPageTree(child.path))}
                    </div>
                )}
            </div>
        );
    };
    
    // Start building from the root node
    const rootNode = routes.find(r => r.path === rootPath);
    
    return (
        <div className="pagetree-container">
            <h3 className="pagetree-header">Page Tree</h3>
            <div className="pagetree">
                {rootNode && buildPageTree(rootPath)}
            </div>
        </div>
    );
};

export default PageTree;
