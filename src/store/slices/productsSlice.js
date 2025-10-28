import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../services/productService';

/**
 * Async thunk to load products from products.json
 */
export const loadProducts = createAsyncThunk(
  'products/loadProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath);
      const products = await productService.loadProducts();
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to save products to products.json
 */
export const saveProducts = createAsyncThunk(
  'products/saveProducts',
  async (products, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath);
      await productService.saveProducts(products);
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Products Slice - Manages product data state
 */
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    hasUnsavedChanges: false,
  },
  reducers: {
    addProductLocal: (state, action) => {
      state.items.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    updateProductLocal: (state, action) => {
      const { id, data } = action.payload;
      const index = state.items.findIndex(p => p.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...data };
        state.hasUnsavedChanges = true;
      }
    },
    deleteProductLocal: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
      state.hasUnsavedChanges = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUnsavedChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
  },
  extraReducers: (builder) => {
    // Handle loadProducts
    builder
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = false;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load products';
      });

    // Handle saveProducts
    builder
      .addCase(saveProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = false;
      })
      .addCase(saveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save products';
      });
  },
});

export const {
  addProductLocal,
  updateProductLocal,
  deleteProductLocal,
  clearError,
  resetUnsavedChanges,
} = productsSlice.actions;

export default productsSlice.reducer;
