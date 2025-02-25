import { createSlice } from '@reduxjs/toolkit';

const editingSlice = createSlice({
  name: 'editing',
  initialState: {
    isEditing: false,
    isCreating: false,
    isPublished: false,
    isRawEditor: false
  },
  reducers: {
    setEditing: (state, action) => {
      state.isEditing = action.payload;
      if (!action.payload) {
        state.isRawEditor = false; // Reset raw editor when exiting edit mode
      }
    },
    setCreating: (state, action) => {
      state.isCreating = action.payload;
    },
    setPublished: (state, action) => {
      state.isPublished = action.payload;
    },
    setRawEditor: (state, action) => {
      state.isRawEditor = action.payload;
    }
  }
});

export const { setEditing, setCreating, setPublished, setRawEditor } = editingSlice.actions;
export default editingSlice.reducer; 