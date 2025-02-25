import { createSlice } from '@reduxjs/toolkit';
import { getInitialPanelState } from '../../utils/responsive';

const initialState = {
  isOpen: localStorage.getItem('isSidebarOpen') !== null 
    ? JSON.parse(localStorage.getItem('isSidebarOpen')) 
    : getInitialPanelState()
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
      localStorage.setItem('isSidebarOpen', JSON.stringify(state.isOpen));
    },
    setSidebar: (state, action) => {
      state.isOpen = action.payload;
      localStorage.setItem('isSidebarOpen', JSON.stringify(action.payload));
    }
  }
});

export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer; 