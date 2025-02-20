import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    isOpen: false
  },
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    setChat: (state, action) => {
      state.isOpen = action.payload;
    }
  }
});

export const { toggleChat, setChat } = chatSlice.actions;
export default chatSlice.reducer; 