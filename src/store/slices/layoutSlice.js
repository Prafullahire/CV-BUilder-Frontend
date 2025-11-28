import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedLayout: null,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setLayout: (state, action) => {
      state.selectedLayout = action.payload;
    },
    resetLayout: (state) => {
      state.selectedLayout = null;
    },
  },
});

export const { setLayout, resetLayout } = layoutSlice.actions;
export default layoutSlice.reducer;
