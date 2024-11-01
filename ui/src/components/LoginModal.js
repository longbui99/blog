import React, { useState } from 'react';
import { FaUser, FaLock, FaTimes } from 'react-icons/fa';
import '../styles/LoginModal.css';
import { loginProcessor } from '../processor/loginProcessor';

function LoginModal({ isOpen, onClose, onSubmit, isPopup = false, isLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await loginProcessor.login(username, password);
    
    if (result.success) {
      onSubmit(result.username);
      onClose();
      window.location.reload();
    } else {
      setError(result.error);
    }
  };

  const handleCancel = () => {
    loginProcessor.logout();
    onClose();
    if (isLoggedIn) {
      window.location.reload();
    } 
  };

  if (!isOpen) return null;

  const modalClass = isPopup ? 'login-popup' : 'login-modal';

  return (
    <div className={`login-overlay ${isPopup ? 'popup' : ''}`}>
      <div className={modalClass}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-buttons">
            <button type="submit" className="submit-button">
              Sign In
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCancel}
            >
              {isLoggedIn ? 'Logout' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
