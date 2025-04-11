import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from '../../../../utils/dateUtils';
import './styles/News.css';

const RecentUpdates = () => {
    const navigate = useNavigate();
    const routes = useSelector((state) => state.routes.items);
    
    const recentRoutes = useMemo(() => {
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        
        return routes
            .filter(route => {
                const updatedAt = new Date(route.updated_at);
                return updatedAt >= oneMonthAgo;
            })
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }, [routes]);
    
    // Group routes by date
    const groupedRoutes = useMemo(() => {
        const groups = {};
        
        recentRoutes.forEach(route => {
            const date = new Date(route.updated_at);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            
            groups[dateKey].push(route);
        });
        
        return groups;
    }, [recentRoutes]);
    
    // Format date for display
    const formatDisplayDate = (dateStr) => {
        const date = new Date(dateStr);
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };
    
    // Handle clicking on a route
    const handleRouteClick = (path) => {
        navigate(path);
    };
    
    // Check if a route is new
    const isNewRoute = (route) => {
        return route.isNew;
    };
    
    // Find children of a route
    const findChildRoutes = (parentPath) => {
        return routes
            .filter(route => route.parent === parentPath)
            .sort((a, b) => a.sequence - b.sequence);
    };
    
    // Handle child click
    const handleChildClick = (e, path) => {
        e.stopPropagation();
        navigate(path);
    };

    if (recentRoutes.length === 0) {
        return (
            <div className="recent-updates-container">
                <h3 className="recent-updates-header">Recent Updates</h3>
                <div className="recent-updates-empty">
                    No recent updates in the last five months.
                </div>
            </div>
        );
    }

    return (
        <div className="recent-updates-container">
            <h3 className="recent-updates-header">Recent Updates</h3>
            
            <div className="recent-updates-list">
                {Object.keys(groupedRoutes).map(dateKey => (
                    <div key={dateKey} className="recent-updates-group">
                        <div className="recent-updates-date">
                            {formatDisplayDate(dateKey)}
                        </div>
                        
                        <div className="recent-updates-items">
                            {groupedRoutes[dateKey].map(route => {
                                const childRoutes = findChildRoutes(route.path);
                                
                                return (
                                    <div 
                                        key={route.path} 
                                        className="recent-updates-item"
                                        onClick={() => handleRouteClick(route.path)}
                                    >
                                        <div className="recent-updates-content">
                                            <div className="recent-updates-title">
                                                {route.title}
                                                {isNewRoute(route) && (
                                                    <span className="card-new-indicator">NEW</span>
                                                )}
                                            </div>
                                            
                                            {childRoutes.length > 0 && (
                                                <div className="category-tags">
                                                    {childRoutes.map(child => (
                                                        <span 
                                                            key={child.path} 
                                                            className={`category-tag ${isNewRoute(child) ? 'position-relative' : ''}`}
                                                            onClick={(e) => handleChildClick(e, child.path)}
                                                        >
                                                            {isNewRoute(child) && (
                                                                <span className="child-new-indicator">NEW</span>
                                                            )}
                                                            {child.title}
                                                            <small className="category-views-count">
                                                                ({child.total_views})
                                                            </small>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="recent-updates-time">
                                                {format(new Date(route.updated_at), 'h:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentUpdates;
