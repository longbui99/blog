import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    isSearchOpen: false
  },
  reducers: {
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload;
    }
  }
});

export const { setSearchOpen } = searchSlice.actions;
export default searchSlice.reducer; 