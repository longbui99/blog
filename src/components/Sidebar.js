import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SidebarSearch from './SidebarSearch';
import { routeStructure } from '../const/routes';

const ItemTypes = {
  MENU_ITEM: 'menuItem'
};

const MenuItem = ({ id, title, path, index, moveItem, children }) => {
  const location = useLocation();
  const [, drag] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: { id, index }
  });

  const [, drop] = useDrop({
    accept: ItemTypes.MENU_ITEM,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const ref = useCallback((node) => {
    drag(drop(node));
  }, [drag, drop]);

  const isActive = location.pathname.startsWith(path);

  return (
    <li ref={ref} className={isActive ? "active" : ""}>
      <NavLink to={path}>{title}</NavLink>
      {children && <ul>{children.map((child, index) => (
        <MenuItem key={child.path} {...child} index={index} moveItem={moveItem} />
      ))}</ul>}
    </li>
  );
};

function Sidebar({ isOpen, toggleSidebar, className }) {
  const [menuItems, setMenuItems] = useState(() => {
    const buildTree = (items, parent = null) => {
      return items
        .filter(item => item.parent === parent)
        .sort((a, b) => a.sequence - b.sequence)
        .map(item => ({
          ...item,
          children: buildTree(items, item.path)
        }));
    };
    return buildTree(routeStructure);
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('sidebarSearchTerm') || '';
  });

  const moveItem = useCallback((dragIndex, hoverIndex) => {
    setMenuItems((prevItems) => {
      const newItems = [...prevItems];
      const [reorderedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, reorderedItem);
      return newItems;
    });
  }, []);

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

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${className}`}>
      <SidebarSearch onSearch={handleSearch} initialSearchTerm={searchTerm} />
      <DndProvider backend={HTML5Backend}>
        <nav className="sidebar-nav">
          <ul>
            {filteredMenuItems.map((item, index) => (
              <MenuItem key={item.path} {...item} index={index} moveItem={moveItem} />
            ))}
          </ul>
        </nav>
      </DndProvider>
    </aside>
  );
}

export default Sidebar;
