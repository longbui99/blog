import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { isDeviceMobile } from '../../utils/responsive';
import { ROUTES } from '../../utils/routeConstants';
import { useMenuContext } from '../../contexts/MenuContext';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveRoute } from '../../redux/slices/routesSlice';
import SidebarToggle from '../toggle/SidebarToggle';
import "./styles/Sidebar.css";

const MenuItem = ({ id, title, path, index, is_published, children, searchTerm, onItemClick, level = 0 }) => {
    const activeRoute = useSelector(state => state.routes.activeRoute);
    const isLoggedIn = useSelector(state => state.login.isLoggedIn);
    const [isPublished, setIsPublished] = useState(is_published);
    const navigate = useNavigate();
    const { subscribeToEvent } = useMenuContext();
    const dispatch = useDispatch();

    // Check if this item is currently active
    const isActive = path === activeRoute;
    const hasActiveChild = useCallback(() => {
        const isChildActive = (items) => {
            return items?.some(child => 
                child.path === activeRoute || 
                (child.children && isChildActive(child.children))
            );
        };
        return isChildActive(children);
    }, [children, activeRoute]);

    subscribeToEvent(path, setIsPublished);
    
    if (isActive) {
        dispatch(setActiveRoute(path));
    }

    const handleClick = () => {
        dispatch(setActiveRoute(path));
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
        <li className={`
            ${isActive ? "active" : ""} 
            ${hasActiveChild() ? "has-active-child" : ""}
        `}>
            <div className={`menu-item ${!isPublished ? 'unpublished' : ''}`} 
                 title={title} 
                 onClick={handleClick}>
                {isLoggedIn && (
                    <span className={`status-dot ${isPublished ? 'published' : 'unpublished'}`} />
                )}
                <NavLink to={path} onClick={handleClick}>
                    {title}
                </NavLink>
            </div>
            {children && children.length > 0 && (
                <ul>
                    {children.map((child, childIndex) => (
                        <MenuItem
                            key={child.path}
                            {...child}
                            index={childIndex}
                            searchTerm={searchTerm}
                            onItemClick={onItemClick}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

function Sidebar({ className, onItemClick }) {
    const routes = useSelector(state => state.routes.items);
    const isSidebarOpen = useSelector(state => state.sidebar.isOpen);
    const [menuItems, setMenuItems] = useState([]);
    const [isContentLoaded, setIsContentLoaded] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();

    const handleContentLoaded = useCallback(() => {
        setIsContentLoaded(true);
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
        handleContentLoaded();
    }, [routes, handleContentLoaded]);

    // Scroll to the active menu item only after menu items are loaded
    useEffect(() => {
        if (isContentLoaded) {
            const activeItem = sidebarRef.current.querySelector('.active');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.pathname, isContentLoaded]);


    return (
        <aside 
            ref={sidebarRef} 
            className={`sidebar ${className} ${!isSidebarOpen ? 'hidden' : ''}`}
        >
            <SidebarToggle />
            <DndProvider backend={HTML5Backend}>
                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item, index) => (
                            <MenuItem 
                                key={item.path} 
                                {...item} 
                                index={index}
                                onItemClick={onItemClick}
                            />
                        ))}
                    </ul>
                </nav>
            </DndProvider>
        </aside>
    );
}

export default Sidebar;
