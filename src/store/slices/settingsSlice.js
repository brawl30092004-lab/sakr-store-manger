import { createSlice } from '@reduxjs/toolkit';

/**
 * Get initial project path from localStorage (for portable app persistence)
 */
const getInitialProjectPath = () => {
  try {
    const saved = localStorage.getItem('projectPath');
    return saved || null;
  } catch (e) {
    return null;
  }
};

/**
 * Get initial data source from localStorage
 */
const getInitialDataSource = () => {
  try {
    const saved = localStorage.getItem('dataSource');
    return saved || 'local';
  } catch (e) {
    return 'local';
  }
};

/**
 * Settings Slice - Manages application settings including project path and data source
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // Start with null - user must select a project path on first run
    projectPath: getInitialProjectPath(),
    // Data source: 'local' (browse files) or 'github' (GitHub repository)
    dataSource: getInitialDataSource(),
  },
  reducers: {
    setProjectPath: (state, action) => {
      state.projectPath = action.payload;
      // Persist to localStorage for portable app
      try {
        if (action.payload) {
          localStorage.setItem('projectPath', action.payload);
        } else {
          localStorage.removeItem('projectPath');
        }
      } catch (e) {
        console.error('Failed to save project path:', e);
      }
    },
    setDataSource: (state, action) => {
      state.dataSource = action.payload;
      // Persist to localStorage
      try {
        localStorage.setItem('dataSource', action.payload);
      } catch (e) {
        console.error('Failed to save data source:', e);
      }
    },
  },
});

export const { setProjectPath, setDataSource } = settingsSlice.actions;
export default settingsSlice.reducer;
