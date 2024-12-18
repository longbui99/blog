import React from 'react';
import { IoPersonOutline } from "react-icons/io5";

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
      <IoPersonOutline />
    </button>
  );
}

export default LoginToggle;
