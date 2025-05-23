import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../..//static/logo.svg';
import SearchToggle from '../toggle/SearchToggle.js';
import AIBotToggle from '../toggle/AIBotToggle.js';
import CreateToggle from '../toggle/CreateToggle.js';
import EditToggle from '../toggle/EditToggle.js';
import DeleteToggle from '../toggle/DeleteToggle.js';
import PublishToggle from '../toggle/PublishToggle.js';
import ControlPanelToggle from '../toggle/ControlPanelToggle.js';
import ControlPanelPopup from './ControlPanelPopup.js';
import './styles/Header.css';
import SearchPopup from './SearchPopup.js';
import ChatPopup from './ChatPopup.js';
import { useSelector } from 'react-redux';
import RawEditorToggle from '../toggle/RawEditorToggle.js';

function Header() {
  const isLoggedIn = useSelector(state => state.login.isLoggedIn);
  return (
    <>
      <header className="app-bar">
        <div className="logo-container">
          <Link to="/" className="logo">
            <Logo />
          </Link>
          <h1 className="site-title"><a href="/" >Long Bui</a></h1>
        </div>
        <p className="motto">You, not others</p>
        <div className="nav-container-invisible">
          <SearchToggle />
          <AIBotToggle />
          <SearchPopup />
          <ChatPopup />
          <ControlPanelPopup />
        </div>
        <div className="nav-container-invisible">
          {isLoggedIn && (
            <>
              <CreateToggle />
              <EditToggle />
              <DeleteToggle />
              <PublishToggle />
              <RawEditorToggle />
            </>
          )}
        </div>
        <div className="app-bar-right">
          <div className="app-bar-controls">
            <ControlPanelToggle />
          </div>
        </div>
      </header>

    </>
  );
}

export default Header;
