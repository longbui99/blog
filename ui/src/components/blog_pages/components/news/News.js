import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from '../../../../utils/dateUtils';
import './styles/News.css';

const RecentUpdates = () => {
    const navigate = useNavigate();
    const routes = useSelector((state) => state.routes.items);
    const [timeFilter, setTimeFilter] = useState('thisWeek'); // Default filter: this week
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const listRef = useRef(null);
    
    // Time filter options
    const timeFilters = [
        { id: 'thisWeek', label: 'This Week' },
        { id: 'lastWeek', label: 'Last Week' },
        { id: 'thisMonth', label: 'This Month' },
        { id: 'lastMonth', label: 'Last Month' },
        { id: 'thisYear', label: 'This Year' },
        { id: 'lastYear', label: 'Last Year' },
    ];
    
    // Check if content is scrollable
    useEffect(() => {
        const checkScrollable = () => {
            if (listRef.current) {
                const { scrollHeight, clientHeight } = listRef.current;
                setShowScrollIndicator(scrollHeight > clientHeight);
            }
        };
        
        checkScrollable();
        
        // Recheck when window resizes
        window.addEventListener('resize', checkScrollable);
        
        return () => {
            window.removeEventListener('resize', checkScrollable);
        };
    }, [timeFilter, routes]);
    
    // Handle scroll event to hide indicator when scrolled to bottom
    const handleScroll = () => {
        if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;
            const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20;
            setShowScrollIndicator(!isScrolledToBottom);
        }
    };
    
    // Get filtered routes based on selected time period
    const filteredRoutes = useMemo(() => {
        const now = new Date();
        
        // Filter functions for different time periods
        const filters = {
            lastWeek: () => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return routes.filter(route => new Date(route.updated_at) >= oneWeekAgo);
            },
            lastMonth: () => {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(now.getMonth() - 1);
                return routes.filter(route => new Date(route.updated_at) >= oneMonthAgo);
            },
            lastYear: () => {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                return routes.filter(route => new Date(route.updated_at) >= oneYearAgo);
            },
            thisWeek: () => {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
                startOfWeek.setHours(0, 0, 0, 0);
                return routes.filter(route => new Date(route.updated_at) >= startOfWeek);
            },
            thisMonth: () => {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return routes.filter(route => new Date(route.updated_at) >= startOfMonth);
            },
            thisYear: () => {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                return routes.filter(route => new Date(route.updated_at) >= startOfYear);
            }
        };
        
        // Apply the selected filter
        return filters[timeFilter]?.() || [];
    }, [routes, timeFilter]);
    
    // Sort filtered routes by date
    const recentRoutes = useMemo(() => {
        return filteredRoutes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }, [filteredRoutes]);
    
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
    
    // Handle time filter change
    const handleFilterChange = (filterId) => {
        setTimeFilter(filterId);
    };

    if (recentRoutes.length === 0) {
        return (
            <div className="recent-updates-container">
                <h3 className="recent-updates-header">Recent Updates</h3>
                <div className="recent-updates-filters">
                    {timeFilters.map(filter => (
                        <button 
                            key={filter.id}
                            className={`recent-updates-filter-btn ${timeFilter === filter.id ? 'active' : ''}`}
                            onClick={() => handleFilterChange(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <div className="recent-updates-empty">
                    No updates found for the selected time period.
                </div>
            </div>
        );
    }

    return (
        <div className="recent-updates-container">
            <h3 className="recent-updates-header">Recent Updates</h3>
            
            <div className="recent-updates-filters">
                {timeFilters.map(filter => (
                    <button 
                        key={filter.id}
                        className={`recent-updates-filter-btn ${timeFilter === filter.id ? 'active' : ''}`}
                        onClick={() => handleFilterChange(filter.id)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            
            <div className="recent-updates-list-container">
                <div 
                    className="recent-updates-list" 
                    ref={listRef}
                    onScroll={handleScroll}
                >
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
                {showScrollIndicator && (
                    <div className="scroll-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12l7 7 7-7"/>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentUpdates;
