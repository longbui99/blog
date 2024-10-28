import React from 'react';
import { FaUserAlt } from 'react-icons/fa';

function LoginToggle({ isLoggedIn, onLoginClick }) {
  const showLoginButton = window.location.hostname === process.env.REACT_APP_ADMIN_DOMAIN;

  if (!showLoginButton) {
    return null;
  }

  return (
    <button
      className="login-toggle"
      onClick={onLoginClick}
      title="Login"
    >
      <FaUserAlt />
    </button>
  );
}

export default LoginToggle;
