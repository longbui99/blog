import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarSearch from './SidebarSearch';

function Sidebar({ isOpen, toggleSidebar, className }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${className}`}>
      <SidebarSearch />
      <nav className="sidebar-nav">
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <NavLink to="/" end>Home</NavLink>
          </li>
          <li className={isActive("/api-protocol") ? "active-parent" : ""}>
            <NavLink to="/api-protocol">API Protocol</NavLink>
            <ul>
              <li className={location.pathname === "/restful-api" ? "active" : ""}>
                <NavLink to="/restful-api">Restful API</NavLink>
              </li>
              <li className={location.pathname === "/mission" ? "active" : ""}>
                <NavLink to="/mission">Our Mission</NavLink>
              </li>
            </ul>
          </li>
          <li className={isActive("/posts") ? "active-parent" : ""}>
            <NavLink to="/posts">Posts</NavLink>
            <ul>
              <li className={location.pathname === "/recent" ? "active" : ""}>
                <NavLink to="/recent">Recent Posts</NavLink>
              </li>
              <li className={location.pathname === "/popular" ? "active" : ""}>
                <NavLink to="/popular">Popular Posts</NavLink>
              </li>
              <li className={location.pathname === "/categories" ? "active" : ""}>
                <NavLink to="/categories">Categories</NavLink>
              </li>
            </ul>
          </li>
          <li className={location.pathname === "/contact" ? "active" : ""}>
            <NavLink to="/contact">Contact</NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
