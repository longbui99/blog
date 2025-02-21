import { createSlice } from '@reduxjs/toolkit';

const blogSlice = createSlice({
    name: 'blog',
    initialState: {
        content: null,
        isPublished: false,
    },
    reducers: {
        setBlogContent: (state, action) => {
            state.content = action.payload;
        },
        setPublished: (state, action) => {
            state.isPublished = action.payload;
        },
    },
});

export const { setBlogContent, setPublished } = blogSlice.actions;
export default blogSlice.reducer; 