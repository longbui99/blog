import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebarSlice';
import tocReducer from './slices/tocSlice';
import themeReducer from './slices/themeSlice';
import loginReducer from './slices/loginSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    toc: tocReducer,
    theme: themeReducer,
    login: loginReducer,
  },
}); 