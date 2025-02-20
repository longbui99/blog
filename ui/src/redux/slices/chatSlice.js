import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    isChatOpen: false
  },
  reducers: {
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
    }
  }
});

export const { setChatOpen } = chatSlice.actions;
export default chatSlice.reducer; 