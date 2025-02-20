import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    isSearchOpen: false,
    isChatOpen: false,
    searchTerm: ''
  },
  reducers: {
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload;
      if (!action.payload) {
        state.searchTerm = '';
      }
    },
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  }
});

export const { setSearchOpen, setChatOpen, setSearchTerm } = searchSlice.actions;
export default searchSlice.reducer; 