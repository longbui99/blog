import { createSlice } from '@reduxjs/toolkit';

const editingSlice = createSlice({
  name: 'editing',
  initialState: {
    isEditing: false,
    isCreating: false,
    isPublished: false
  },
  reducers: {
    setEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    setCreating: (state, action) => {
      state.isCreating = action.payload;
    },
    setPublished: (state, action) => {
      state.isPublished = action.payload;
    }
  }
});

export const { setEditing, setCreating, setPublished } = editingSlice.actions;
export default editingSlice.reducer; 