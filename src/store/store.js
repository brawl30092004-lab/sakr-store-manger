import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import settingsReducer from './slices/settingsSlice';
import couponsReducer from './slices/couponsSlice';

/**
 * Redux Store Configuration
 */
const store = configureStore({
  reducer: {
    products: productsReducer,
    settings: settingsReducer,
    coupons: couponsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for file system operations
    }),
});

export default store;
