import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice';

function ThemeToggle() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <button 
      className="theme-toggle" 
      onClick={() => dispatch(toggleTheme())}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggle; 