import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './slices/sidebarSlice';
import tocReducer from './slices/tocSlice';
import themeReducer from './slices/themeSlice';
import loginReducer from './slices/loginSlice';
import chatReducer from './slices/chatSlice';
import routesReducer from './slices/routesSlice';
import searchReducer from './slices/searchSlice';
import controlPanelReducer from './slices/controlPanelSlice';
import editingReducer from './slices/editingSlice';
import blogReducer from './slices/blogSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    toc: tocReducer,
    theme: themeReducer,
    login: loginReducer,
    chat: chatReducer,
    routes: routesReducer,
    search: searchReducer,
    controlPanel: controlPanelReducer,
    editing: editingReducer,
    blog: blogReducer,
  },
}); 