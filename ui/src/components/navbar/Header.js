import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../..//static/logo.svg';
import SearchBar from './SearchBar.js';
import TOCToggle from '../toggle/TOCToggle.js';
import LoginToggle from '../toggle/LoginToggle.js';
import ThemeToggle from '../toggle/ThemeToggle.js';
import './styles/Header.css';
import SearchPopup from './SearchPopup.js';

function Header({ isLoggedIn }) {
  return (
    <header className="app-bar">
      <div className="logo-container">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <h1 className="site-title">Long Bui</h1>
      </div>
      <p className="motto">You, not others</p>
      <div className="app-bar-right">
        <SearchBar />
        <div className="app-bar-controls">
          <TOCToggle />
          <LoginToggle />
          <ThemeToggle />
        </div>
      </div>
      <div>
        <SearchPopup />
      </div>
    </header>
  );
}

export default Header;
