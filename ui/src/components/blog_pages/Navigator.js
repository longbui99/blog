// ui/src/components/Navigator.js
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import "./styles/navigator.css";

const Navigator = () => {
    const navigate = useNavigate();
    const routes = useSelector((state) => state.routes.items);
    const activeRoute = useSelector((state) => state.routes.activeRoute);

    // Find navigation paths based on Redux state
    const findNavigationPaths = useCallback(() => {
        let parentPath = null;
        let previousPath = null;
        let nextPath = null;
        let foundCurrent = false;

        const traverse = (items, parent = null) => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                if (foundCurrent) {
                    nextPath = item;
                    return true;
                }

                if (item.path === activeRoute) {
                    parentPath = parent;
                    foundCurrent = true;
                    if (i > 0) {
                        previousPath = items[i - 1];
                    }
                } else if (item.children) {
                    if (traverse(item.children, item)) {
                        return true;
                    }
                }
            }
            return false;
        };

        traverse(routes);
        return { parentPath, previousPath, nextPath };
    }, [routes, activeRoute]);

    const { parentPath, previousPath, nextPath } = findNavigationPaths();

    return (
        <div className="navigator">
            <div 
                className={`nav-item ${parentPath ? "visible": "invisible"}`} 
                onClick={() => parentPath && navigate(parentPath.path)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="nav-icon">
                    <path fill="currentColor" d="M576 128H336l-48-48c-6.3-6.3-14.3-10-22.6-10H0v384h576V128zM0 64h256l48 48h272v384H0V64z"/>
                </svg>
                <span className="nav-title">{parentPath?.title || ''}</span>
            </div>
            <div 
                className={`nav-item ${previousPath ? "visible": "invisible"}`} 
                onClick={() => previousPath && navigate(previousPath.path)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="nav-icon">
                    <path fill="currentColor" d="M31.3 256l194.6-194.6c9.4-9.4 9.4-24.6 0-34s-24.6-9.4-34 0L0 256c-9.4 9.4-9.4 24.6 0 34l192.9 194.6c9.4 9.4 24.6 9.4 34 0s9.4-24.6 0-34L31.3 256z"/>
                </svg>
                <span className="nav-title">{previousPath?.title || ''}</span>
            </div>
            <div 
                className={`nav-item ${nextPath ? "visible": "invisible"}`} 
                onClick={() => nextPath && navigate(nextPath.path)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="nav-icon">
                    <path fill="currentColor" d="M288.7 256L94.1 51.4c-9.4-9.4-24.6-9.4-34 0s-9.4 24.6 0 34L256 256l-194.6 194.6c-9.4 9.4-9.4 24.6 0 34s24.6 9.4 34 0L288.7 256z"/>
                </svg>
                <span className="nav-title">{nextPath?.title || ''}</span>
            </div>
        </div>
    );
};

export default Navigator;