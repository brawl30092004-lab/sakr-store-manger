import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CouponService from '../../services/couponService';

/**
 * Default Coupon Object Template
 * Used as the starting point for creating new coupons
 */
export const defaultCoupon = {
  id: 0,                    // Will be auto-generated
  code: '',
  type: 'percentage',       // 'percentage' or 'fixed'
  amount: 10,
  minSpend: 0,
  category: 'All',
  description: '',
  enabled: true
};

/**
 * Async thunk to load coupons from coupons.json
 */
export const loadCoupons = createAsyncThunk(
  'coupons/loadCoupons',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);
      const coupons = await couponService.loadCoupons();
      return coupons;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to save coupons to coupons.json
 */
export const saveCoupons = createAsyncThunk(
  'coupons/saveCoupons',
  async (coupons, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);
      await couponService.saveCoupons(coupons);
      return coupons;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to add a new coupon
 */
export const addCoupon = createAsyncThunk(
  'coupons/addCoupon',
  async (coupon, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const coupons = state.coupons.items;

      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);
      
      // Generate next ID
      const newId = couponService.generateNextCouponId(coupons);
      const newCoupon = {
        ...coupon,
        id: newId,
        code: couponService.formatCouponCode(coupon.code)
      };

      // Add to array
      const updatedCoupons = [...coupons, newCoupon];

      // Save to file
      await couponService.saveCoupons(updatedCoupons);

      return updatedCoupons;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to update an existing coupon
 */
export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ id, updates }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const coupons = state.coupons.items;

      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);

      // Format code if it's being updated
      const formattedUpdates = {
        ...updates,
        code: updates.code ? couponService.formatCouponCode(updates.code) : updates.code
      };

      // Update coupon in array
      const updatedCoupons = coupons.map(coupon =>
        coupon.id === id ? { ...coupon, ...formattedUpdates } : coupon
      );

      // Save to file
      await couponService.saveCoupons(updatedCoupons);

      return { id, updates: formattedUpdates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to delete a coupon
 */
export const deleteCoupon = createAsyncThunk(
  'coupons/deleteCoupon',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const coupons = state.coupons.items;

      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);

      // Remove coupon from array
      const updatedCoupons = coupons.filter(coupon => coupon.id !== id);

      // Save to file
      await couponService.saveCoupons(updatedCoupons);

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to toggle coupon enabled status
 */
export const toggleCouponStatus = createAsyncThunk(
  'coupons/toggleCouponStatus',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const coupons = state.coupons.items;

      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);

      // Toggle enabled status
      const updatedCoupons = coupons.map(coupon =>
        coupon.id === id ? { ...coupon, enabled: !coupon.enabled } : coupon
      );

      // Save to file
      await couponService.saveCoupons(updatedCoupons);

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to duplicate a coupon
 */
export const duplicateCoupon = createAsyncThunk(
  'coupons/duplicateCoupon',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const coupons = state.coupons.items;

      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const couponService = new CouponService(projectPath);

      // Find the coupon to duplicate
      const originalCoupon = coupons.find(c => c.id === id);
      if (!originalCoupon) {
        throw new Error('Coupon not found');
      }

      // Generate next ID and unique code
      const newId = couponService.generateNextCouponId(coupons);
      const newCoupon = {
        ...originalCoupon,
        id: newId,
        code: `${originalCoupon.code}_COPY`,
        enabled: false // Duplicate starts disabled
      };

      // Add to array
      const updatedCoupons = [...coupons, newCoupon];

      // Save to file
      await couponService.saveCoupons(updatedCoupons);

      return updatedCoupons;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Coupons Slice
 */
const couponsSlice = createSlice({
  name: 'coupons',
  initialState: {
    items: [],
    loading: false,
    error: null,
    hasUnsavedChanges: false,
  },
  reducers: {
    // Mark changes as saved (used after git publish)
    markCouponsSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
    // Clear error
    clearCouponError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Coupons
      .addCase(loadCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = false;
      })
      .addCase(loadCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load coupons';
      })
      
      // Save Coupons
      .addCase(saveCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true; // Mark as unsaved until git publish
      })
      .addCase(saveCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save coupons';
      })
      
      // Add Coupon
      .addCase(addCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true;
      })
      .addCase(addCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add coupon';
      })
      
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        const index = state.items.findIndex(c => c.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
        state.hasUnsavedChanges = true;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update coupon';
      })
      
      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(c => c.id !== action.payload);
        state.hasUnsavedChanges = true;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete coupon';
      })
      
      // Toggle Coupon Status
      .addCase(toggleCouponStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is the id that was toggled
        const index = state.items.findIndex(c => Number(c.id) === Number(action.payload));
        if (index !== -1) {
          state.items[index].enabled = !state.items[index].enabled;
        }
        state.hasUnsavedChanges = true;
      })
      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to toggle coupon status';
      })
      
      // Duplicate Coupon
      .addCase(duplicateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true;
      })
      .addCase(duplicateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to duplicate coupon';
      });
  },
});

export const { markCouponsSaved, clearCouponError } = couponsSlice.actions;

export default couponsSlice.reducer;
