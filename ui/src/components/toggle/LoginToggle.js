import React from 'react';
import { IoPersonOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { toggleLoginModal } from '../../redux/slices/loginSlice';

function LoginToggle() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const showLoginButton = window.location.hostname === process.env.REACT_APP_ADMIN_DOMAIN;

  if (!showLoginButton) {
    return null;
  }

  return (
    <button
      className="login-toggle"
      onClick={() => dispatch(toggleLoginModal())}
      title={isLoggedIn ? "Account" : "Login"}
    >
      <IoPersonOutline />
    </button>
  );
}

export default LoginToggle;
