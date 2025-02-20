import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: (() => {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  })()
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
      document.body.classList.toggle('dark-mode', state.isDarkMode);
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      localStorage.setItem('isDarkMode', JSON.stringify(action.payload));
      document.body.classList.toggle('dark-mode', action.payload);
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer; 