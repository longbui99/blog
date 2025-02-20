import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../..//static/logo.svg';
import TOCToggle from '../toggle/TOCToggle.js';
import ChatToggle from '../toggle/SearchToggle.js';
import AIBotToggle from '../toggle/AIBotToggle.js';
import ControlPanelToggle from '../toggle/ControlPanelToggle.js';

import './styles/Header.css';
import SearchPopup from './SearchPopup.js';
import ChatPopup from './ChatPopup.js';

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
        <div className="app-bar-controls">
          <ControlPanelToggle />
        </div>
      </div>
      <div>
        <ChatToggle />
        <AIBotToggle />
        <SearchPopup />
        <ChatPopup />
      </div>
    </header>
  );
}

export default Header;
