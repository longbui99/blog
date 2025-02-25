import { createSlice } from '@reduxjs/toolkit';
import { getInitialPanelState } from '../../utils/responsive';

const initialState = {
  isOpen: localStorage.getItem('isTOCOpen') !== null 
    ? JSON.parse(localStorage.getItem('isTOCOpen')) 
    : getInitialPanelState()
};

const tocSlice = createSlice({
  name: 'toc',
  initialState,
  reducers: {
    toggleTOC: (state) => {
      state.isOpen = !state.isOpen;
      localStorage.setItem('isTOCOpen', JSON.stringify(state.isOpen));
    },
    setTOC: (state, action) => {
      state.isOpen = action.payload;
      localStorage.setItem('isTOCOpen', JSON.stringify(action.payload));
    }
  }
});

export const { toggleTOC, setTOC } = tocSlice.actions;
export default tocSlice.reducer; 