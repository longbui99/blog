import { createSlice } from '@reduxjs/toolkit';
import { loginProcessor } from '../../processor/loginProcessor';

const initialState = {
  isLoggedIn: loginProcessor.isLoggedIn(),
  isLoginModalOpen: false,
  isLoginPopup: false
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginStatus: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    toggleLoginModal: (state) => {
      state.isLoginModalOpen = !state.isLoginModalOpen;
    },
    setLoginModal: (state, action) => {
      state.isLoginModalOpen = action.payload;
    },
    setLoginPopup: (state, action) => {
      state.isLoginPopup = action.payload;
    }
  }
});

export const { setLoginStatus, toggleLoginModal, setLoginModal, setLoginPopup } = loginSlice.actions;
export default loginSlice.reducer; 