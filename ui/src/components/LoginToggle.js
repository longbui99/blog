import React from 'react';
import { FaSignInAlt, FaUserAlt } from 'react-icons/fa';
import { ALLOWED_DOMAIN } from '../const/constants';

function LoginToggle({ isLoggedIn, onLoginClick }) {
  const showLoginButton = window.location.hostname === ALLOWED_DOMAIN;

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
