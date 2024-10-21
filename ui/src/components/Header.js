import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { ReactComponent as Logo } from '../static/logo.svg';
import '../styles/Header.css';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';

function Header({ isLoggedIn, onEditClick, onDeleteClick }) {
  return (
    <header className="top-header">
      <div className="logo-container">
        <Link to="/" className="logo">
          <Logo />
        </Link>
        <h1 className="site-title">Long Bui</h1>
      </div>
      <p className="motto">You, not others</p>
      <nav className="top-nav">
        <a href="https://longbui.net" target="_blank" rel="noopener noreferrer">Portfolio</a>
        <div className="social-links">
          <a href="https://www.linkedin.com/in/longbui99/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a href="https://github.com/longbui99" target="_blank" rel="noopener noreferrer" title="GitHub">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
        {isLoggedIn && (
          <div className="content-actions">
            <button className="edit-button" onClick={onEditClick} title="Edit">
              <EditIcon />
            </button>
            <button className="delete-button" onClick={onDeleteClick} title="Delete">
              <TrashIcon />
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
