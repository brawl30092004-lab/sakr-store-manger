import { createSlice } from '@reduxjs/toolkit';

/**
 * Settings Slice - Manages application settings including project path and data source
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // Hard-coded for testing - points to mockup directory
    projectPath: 'e:\\sakr store manger\\mockup products and images',
    // Data source: 'local' (browse files) or 'github' (GitHub repository)
    dataSource: 'local',
  },
  reducers: {
    setProjectPath: (state, action) => {
      state.projectPath = action.payload;
    },
    setDataSource: (state, action) => {
      state.dataSource = action.payload;
    },
  },
});

export const { setProjectPath, setDataSource } = settingsSlice.actions;
export default settingsSlice.reducer;
