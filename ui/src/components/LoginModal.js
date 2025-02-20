import React, { useState } from 'react';
import { FaUser, FaLock, FaTimes } from 'react-icons/fa';
import '../styles/LoginModal.css';
import { loginProcessor } from '../processor/loginProcessor';
import { useDispatch, useSelector } from 'react-redux';
import { setLoginStatus, setLoginModal } from '../redux/slices/loginSlice';

function LoginModal() {
  const dispatch = useDispatch();
  const { isLoggedIn, isLoginModalOpen, isLoginPopup } = useSelector((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await loginProcessor.login(username, password);
    
    if (result.success) {
      dispatch(setLoginStatus(true));
      dispatch(setLoginModal(false));
      window.location.reload();
    } else {
      setError(result.error);
    }
  };

  const handleClose = () => {
    dispatch(setLoginModal(false));
  };

  const handleCancel = () => {
    loginProcessor.logout();
    dispatch(setLoginModal(false));
    if (isLoggedIn) {
      dispatch(setLoginStatus(false));
      window.location.reload();
    }
  };

  if (!isLoginModalOpen) return null;

  const modalClass = isLoginPopup ? 'login-popup' : 'login-modal';

  return (
    <div className={`login-overlay ${isLoginPopup ? 'popup' : ''}`}>
      <div className={modalClass}>
        <button className="close-button" onClick={handleClose}>
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
