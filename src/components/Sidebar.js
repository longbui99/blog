import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="multi-level-nav">
        <ul>
          <li><NavLink to="/" className="nav-link">Home</NavLink></li>
          <li className="has-children">
            <NavLink to="/about" className="nav-link">About</NavLink>
            <ul>
              <li><NavLink to="/team" className="nav-link">Our Team</NavLink></li>
              <li><NavLink to="/mission" className="nav-link">Our Mission</NavLink></li>
            </ul>
          </li>
          <li className="has-children">
            <NavLink to="/posts" className="nav-link">Posts</NavLink>
            <ul>
              <li><NavLink to="/recent" className="nav-link">Recent Posts</NavLink></li>
              <li><NavLink to="/popular" className="nav-link">Popular Posts</NavLink></li>
              <li><NavLink to="/categories" className="nav-link">Categories</NavLink></li>
            </ul>
          </li>
          <li><NavLink to="/contact" className="nav-link">Contact</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;