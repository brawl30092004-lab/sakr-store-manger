import { createSlice } from '@reduxjs/toolkit';

/**
 * Settings Slice - Manages application settings including project path
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // Hard-coded for testing - points to mockup directory
    projectPath: 'e:\\sakr store manger\\mockup products and images',
  },
  reducers: {
    setProjectPath: (state, action) => {
      state.projectPath = action.payload;
    },
  },
});

export const { setProjectPath } = settingsSlice.actions;
export default settingsSlice.reducer;
