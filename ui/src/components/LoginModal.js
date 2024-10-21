import React, { useState } from 'react';
import '../styles/LoginModal.css';
import { loginProcessor } from '../processor/loginProcessor';

function LoginModal({ isOpen, onClose, onSubmit, isPopup = false }) {
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
    } else {
      setError(result.error);
    }
  };

  if (!isOpen) return null;

  const modalClass = isPopup ? 'login-popup' : 'login-modal';

  return (
    <div className={`login-overlay ${isPopup ? 'popup' : ''}`}>
      <div className={modalClass}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="login-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
