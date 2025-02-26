import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage if available
const getInitialChatOpenState = () => {
  try {
    const storedValue = localStorage.getItem('isChatOpen');
    return storedValue ? JSON.parse(storedValue) : false;
  } catch (error) {
    console.error('Error reading isChatOpen from localStorage:', error);
    return false;
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    isChatOpen: getInitialChatOpenState()
  },
  reducers: {
    setChatOpen: (state, action) => {
      state.isChatOpen = action.payload;
      // Store in localStorage when value changes
      try {
        localStorage.setItem('isChatOpen', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Error saving isChatOpen to localStorage:', error);
      }
    }
  }
});

export const { setChatOpen } = chatSlice.actions;
export default chatSlice.reducer; 