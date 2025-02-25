import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  theme: localStorage.getItem('theme') || 'system',
  language: localStorage.getItem('language') || 'en',
  position: { x: 0, y: 0 } // Add position for popup placement
};

const controlPanelSlice = createSlice({
  name: 'controlPanel',
  initialState,
  reducers: {
    setControlPanelOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    toggleControlPanel: (state) => {
      state.isOpen = !state.isOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      // Close panel after selection
      state.isOpen = false;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
      // Close panel after selection
      state.isOpen = false;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    }
  }
});

export const { 
  setControlPanelOpen, 
  toggleControlPanel,
  setTheme,
  setLanguage,
  setPosition
} = controlPanelSlice.actions;

export default controlPanelSlice.reducer; 