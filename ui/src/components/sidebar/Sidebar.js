import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isDeviceMobile } from '../../utils/responsive';
import { useMenuContext } from '../../contexts/MenuContext';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveRoute } from '../../redux/slices/routesSlice';
import SidebarToggle from '../toggle/SidebarToggle';
import "./styles/Sidebar.css";

// Create a context to manage menu expansion state
const MenuExpandContext = createContext({
    expandedPaths: {},
    setExpandedPath: () => {},
    collapseAllExcept: () => {},
    parentsMap: {}
});

const MenuItem = ({ item, isLoggedIn, activeRoute, searchTerm, onItemClick, level = 0, parentPath = null }) => {
    const { id, title, path, index, is_published, children, isNew } = item;
    const [isPublished, setIsPublished] = useState(is_published);
    const [isNew_, setIsNew] = useState(isNew);
    const { subscribeToEvent } = useMenuContext();
    const dispatch = useDispatch();
    
    // Access the menu expand context
    const { expandedPaths, setExpandedPath, collapseAllExcept, parentsMap } = useContext(MenuExpandContext);
    
    // Get the expanded state from context
    const isExpanded = expandedPaths[path] || false;
    
    // Check if this item is currently active
    const isActive = path === activeRoute;

    subscribeToEvent(path, setIsPublished);
    
    const handleClick = () => {
        dispatch(setActiveRoute(path));
        if (isDeviceMobile()) {
            onItemClick?.();
        }
        setIsNew(false);
    };

    const toggleExpand = (e) => {
        e.stopPropagation();
        const newState = !isExpanded;
        
        if (newState) {
            // First collapse all menus
            collapseAllExcept([]);
            
            // Then expand this path and all its parents
            setExpandedPath(path, true);
        } else {
            // Just collapse this path
            setExpandedPath(path, false);
        }
    };

    // Auto expand when this item becomes active
    useEffect(() => {
        if (isActive){
            setIsNew(false);
            if (!isExpanded) {
            // Collapse all menus except the path to this active item
                const pathToExpand = getPathToRoot(path, parentsMap);
                collapseAllExcept(pathToExpand);
                
                // Expand this item
                setExpandedPath(path, true);
            }
        }
    }, [isActive, path, isExpanded, setExpandedPath, collapseAllExcept, parentsMap]);

    return (
        <li className={`
            ${isActive ? "active" : ""} 
            ${!isExpanded ? "collapsed" : ""}
        `}>
            <div className={`menu-item ${!isPublished ? 'unpublished' : ''}`} 
                 title={title} 
                 onClick={handleClick}>
                {isLoggedIn && (
                    <span className={`status-dot ${isPublished ? 'published' : 'unpublished'}`} />
                )}
                {isNew_ && (
                    <span className="new-indicator">NEW</span>
                )}
                <NavLink to={path} onClick={handleClick}>
                    {title}
                </NavLink>
                {children && children.length > 0 && (
                    <div 
                        className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                        onClick={toggleExpand}
                    >
                        ›
                    </div>
                )}
            </div>
            {children && children.length > 0 && (
                <ul className={!isExpanded ? "collapsed" : ""}>
                    {children.map((child, childIndex) => (
                        <MenuItem
                            key={child.path}
                            item={child}
                            isLoggedIn={isLoggedIn}
                            activeRoute={activeRoute}
                            searchTerm={searchTerm}
                            onItemClick={onItemClick}
                            level={level + 1}
                            parentPath={path}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

// Helper function to get path from a node to the root
function getPathToRoot(path, parentsMap) {
    const result = [path];
    let currentPath = path;
    let parentPath = parentsMap[currentPath];
    
    while (parentPath) {
        result.push(parentPath);
        currentPath = parentPath;
        parentPath = parentsMap[currentPath];
    }
    
    return result;
}

function Sidebar({ className, onItemClick }) {
    const routes = useSelector(state => state.routes.items);
    const isSidebarOpen = useSelector(state => state.sidebar.isOpen);
    const activeRoute = useSelector(state => state.routes.activeRoute);
    const isLoggedIn = useSelector(state => state.login.isLoggedIn);
    const [menuItems, setMenuItems] = useState([]);
    const [isContentLoaded, setIsContentLoaded] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();
    
    // Create a map to store parent-child relationships
    const [parentsMap, setParentsMap] = useState({});
    
    // Store expanded states centrally
    const [expandedPaths, setExpandedPaths] = useState({});

    const handleContentLoaded = useCallback(() => {
        setIsContentLoaded(true);
    }, []);

    // Function to collapse all menu items except for a provided list of paths
    const collapseAllExcept = useCallback((exceptPaths = []) => {
        setExpandedPaths(prev => {
            const newState = {};
            
            // Mark only the excepted paths as expanded
            exceptPaths.forEach(path => {
                newState[path] = true;
                localStorage.setItem(`sidebar-expanded-${path}`, true);
            });
            
            // Collapse all other items and update localStorage
            Object.keys(prev).forEach(path => {
                if (!exceptPaths.includes(path)) {
                    localStorage.setItem(`sidebar-expanded-${path}`, false);
                }
            });
            
            return newState;
        });
    }, []);

    // Function to set the expanded state of a path and all its parents
    const setExpandedPath = useCallback((path, isExpanded) => {
        setExpandedPaths(prev => {
            const newState = { ...prev, [path]: isExpanded };
            
            // If expanding, also expand all parent items
            if (isExpanded) {
                let currentPath = path;
                let parentPath = parentsMap[currentPath];
                
                // Traverse up the tree and expand all parents
                while (parentPath) {
                    newState[parentPath] = true;
                    currentPath = parentPath;
                    parentPath = parentsMap[currentPath];
                }
            }
            
            // Save expanded state to localStorage
            localStorage.setItem(`sidebar-expanded-${path}`, isExpanded);
            
            // If expanding, also save parent expanded states
            if (isExpanded) {
                let currentPath = path;
                let parentPath = parentsMap[currentPath];
                
                while (parentPath) {
                    localStorage.setItem(`sidebar-expanded-${parentPath}`, true);
                    currentPath = parentPath;
                    parentPath = parentsMap[currentPath];
                }
            }
            
            return newState;
        });
    }, [parentsMap]);
    
    // Initialize expanded states from localStorage
    useEffect(() => {
        const initialExpandedState = {};
        
        // Initialize from localStorage if available
        routes.forEach(route => {
            const storageKey = `sidebar-expanded-${route.path}`;
            const isExpanded = localStorage.getItem(storageKey) === 'true';
            if (isExpanded) {
                initialExpandedState[route.path] = true;
            }
        });
        
        setExpandedPaths(initialExpandedState);
    }, [routes]);

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
        
        // Build parent-child relationship map
        const newParentsMap = {};
        routes.forEach(route => {
            if (route.parent) {
                newParentsMap[route.path] = route.parent;
            }
        });
        setParentsMap(newParentsMap);
        
        const items = buildTree(routes);
        setMenuItems(items);
        handleContentLoaded();
    }, [routes, handleContentLoaded]);
    
    // Auto-expand parents of active route
    useEffect(() => {
        if (activeRoute) {
            // Get path from active route to root
            const pathToRoot = getPathToRoot(activeRoute, parentsMap);
            
            // Collapse all except this path
            collapseAllExcept(pathToRoot);
            
            // Ensure the active route is expanded
            setExpandedPath(activeRoute, true);
        }
    }, [activeRoute, parentsMap, setExpandedPath, collapseAllExcept]);

    // Scroll to the active menu item only after menu items are loaded
    useEffect(() => {
        if (isContentLoaded) {
            const activeItem = sidebarRef.current.querySelector('.active');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [location.pathname, isContentLoaded, activeRoute]);

    return (
        <aside 
            ref={sidebarRef} 
            className={`sidebar ${className} ${!isSidebarOpen ? 'hidden' : ''}`}
        >
            <SidebarToggle />
            <DndProvider backend={HTML5Backend}>
                <MenuExpandContext.Provider value={{ 
                    expandedPaths, 
                    setExpandedPath, 
                    collapseAllExcept,
                    parentsMap 
                }}>
                    <nav className="sidebar-nav">
                        <ul>
                            {menuItems.map((item, index) => (
                                <MenuItem 
                                    key={item.path}
                                    item={item}
                                    isLoggedIn={isLoggedIn}
                                    activeRoute={activeRoute}
                                    searchTerm=""
                                    onItemClick={onItemClick}
                                />
                            ))}
                        </ul>
                    </nav>
                </MenuExpandContext.Provider>
            </DndProvider>
        </aside>
    );
}

export default Sidebar;
