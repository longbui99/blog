import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SidebarSearch from './SidebarSearch';
import { isDeviceMobile } from '../utils/responsive';
import { ROUTES } from '../utils/routeConstants';
import { useMenuContext } from '../contexts/MenuContext';
import Navigator from './Navigator'; // Import the Navigator component

const ItemTypes = {
    MENU_ITEM: 'menuItem'
};

const MenuItem = ({ id, title, path, index, is_published, children, searchTerm, onItemClick, isLoggedIn }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [originalCollapsed, setOriginalCollapsed] = useState(false);
    const [isPublished, setIsPublished] = useState(is_published);
    const navigate = useNavigate();
    const { subscribeToEvent } = useMenuContext();

    // Check if this item or its children are currently active
    const isActive = location.pathname === path; // Changed to exact match
    const hasActiveChild = children?.some(child => location.pathname === child.path); // Changed to exact match
    subscribeToEvent(path, setIsPublished);

    // Update collapse state based on search
    useEffect(() => {
        if (searchTerm) {
            // Store original state and expand for search
            if (isCollapsed) {
                setOriginalCollapsed(true);
            }
            setIsCollapsed(false);
        } else {
            // When search is cleared
            if (!isActive && !hasActiveChild) {
                // If not the active path, restore to original collapsed state
                setIsCollapsed(originalCollapsed);
            }
        }
    }, [searchTerm, isActive, hasActiveChild]);

    const handleExpandCollapse = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (!searchTerm) {
            setOriginalCollapsed(newState);
        }
    };

    // Check if this item matches search
    const matchesSearch = searchTerm && title.toLowerCase().includes(searchTerm.toLowerCase());

    // Determine if children should be visible
    const showChildren = (
        searchTerm || // Show during search
        !isCollapsed || // Show if not collapsed
        isActive || // Show if this is active
        hasActiveChild // Show if contains active child
    );

    const handleClick = () => {
        if (isDeviceMobile()) {
            onItemClick?.();
        }
    };

    const handleAddChild = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(ROUTES.NEW_PAGE, { state: { parentPath: path } });
    };

    return (
        <li className={`${isActive ? "active" : ""} ${isCollapsed ? "collapsed" : ""} ${matchesSearch ? "search-match" : ""}`}>
            <div className="menu-item" title={title}>
                {isLoggedIn && <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`status-icon ${isPublished ? 'published' : 'unpublished'}`}
                >
                    <path d={isPublished ? "M12 2L2 12h3v8h8v-3h3L12 2z" : "M12 2L2 12h3v8h8v-3h3L12 2z"} />
                </svg>}
                {isLoggedIn &&
                    <span 
                        className="add-child-icon" 
                        onClick={handleAddChild}
                        title="Add new page here"
                    >
                        <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </span>
                }
                <NavLink to={path} title={title} onClick={handleClick}>{title}</NavLink>
                <div className="menu-item-controls">
                    {children?.length > 0 && (
                        <span 
                            className={`expand-icon ${!isCollapsed ? 'expanded' : ''}`} 
                            onClick={handleExpandCollapse}
                        >
                            ❯
                        </span>
                    )}
                </div>
            </div>
            {children && showChildren && (
                <ul>
                    {children.map((child, index) => (
                        <MenuItem 
                            key={child.path} 
                            {...child} 
                            index={index} 
                            searchTerm={searchTerm}
                            onItemClick={onItemClick}
                            isLoggedIn={isLoggedIn}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

function Sidebar({ isOpen, toggleSidebar, className, routes, onItemClick, isLoggedIn }) {
    const [menuItems, setMenuItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState(() => {
        return localStorage.getItem('sidebarSearchTerm') || '';
    });
    const [isContentLoaded, setIsContentLoaded] = useState(false); // State to track content loading
    const sidebarRef = useRef(null); // Create a ref for the sidebar
    const location = useLocation(); // Import location here
    const [parentPath, setParentPath] = useState(null);
    const [previousPath, setPreviousPath] = useState(null);
    const [nextPath, setNextPath] = useState(null);

    const handleContentLoaded = useCallback(() => {
        setIsContentLoaded(true); // Set content loaded state to true
    }, []);

    useEffect(() => {
        const buildTree = (items, parent = null) => {
            return items
                .filter(item => item.parent === parent)
                .sort((a, b) => a.sequence - b.sequence)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.path)
                }));
        };
        const items = buildTree(routes);
        setMenuItems(items);
        handleContentLoaded(); // Call the handler when content is loaded
    }, [routes, handleContentLoaded]);

    const filteredMenuItems = useMemo(() => {
        if (!searchTerm) return menuItems;

        const filterItems = (items) => {
            return items.filter(item => {
                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
                const hasMatchingChildren = item.children && filterItems(item.children).length > 0;
                return matchesSearch || hasMatchingChildren;
            }).map(item => ({
                ...item,
                children: item.children ? filterItems(item.children) : undefined
            }));
        };

        return filterItems(menuItems);
    }, [menuItems, searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        localStorage.setItem('sidebarSearchTerm', term);
    };

    useEffect(() => {
        localStorage.setItem('sidebarSearchTerm', searchTerm);
    }, [searchTerm]);

    // Scroll to the active menu item only after menu items are loaded
    useEffect(() => {
        if (isContentLoaded) { // Ensure content is loaded
            const activeItem = sidebarRef.current.querySelector('.active');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.pathname, isContentLoaded]); // Run this effect when the pathname or content loading state changes


    const findItemRelationships = (items, currentPath) => {
        let currentItem = null;
        let parentItem = null;
        let previousItem = null;
        let nextItem = null;

        const traverse = (items, parent = null) => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                // Check if the current item matches the path
                if (item.path === currentPath) {
                    currentItem = item;
                    parentItem = parent; // Set the parent of the current item

                    // Set previous item if it exists
                    if (i > 0) {
                        previousItem = items[i - 1];
                    }
                    // Set next item if it exists
                    if (i < items.length - 1) {
                        nextItem = items[i + 1];
                    }
                }

                // If the current item has children, check them recursively
                if (item.children) {
                    traverse(item.children, item);
                }
            }
        };

        traverse(items); // Start the traversal
        return { currentItem, parentItem, previousItem, nextItem };
    };

    useEffect(() => {
        const { currentItem, parentItem, previousItem, nextItem } = findItemRelationships(menuItems, location.pathname);
        setParentPath(parentItem ? parentItem : null);
        setPreviousPath(previousItem ? previousItem : null);
        setNextPath(nextItem ? nextItem : null);
    }, [location.pathname, menuItems]);

    return (
      <>
        <aside ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''} ${className}`}>
            <SidebarSearch onSearch={handleSearch} initialSearchTerm={searchTerm} />
            <DndProvider backend={HTML5Backend}>
                <nav className="sidebar-nav">
                    <ul>
                        {filteredMenuItems.map((item, index) => (
                            <MenuItem 
                                key={item.path} 
                                {...item} 
                                index={index} 
                                searchTerm={searchTerm}
                                onItemClick={onItemClick}
                                isLoggedIn={isLoggedIn}
                            />
                        ))}
                    </ul>
                </nav>
            </DndProvider>
        </aside>
        <Navigator 
        parentPath={parentPath} 
        previousPath={previousPath} 
        nextPath={nextPath} 
        />
      </>
    );
}

export default Sidebar;
