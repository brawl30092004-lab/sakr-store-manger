import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../services/productService';

/**
 * Default Product Object Template
 * Used as the starting point for creating new products
 */
export const defaultProduct = {
  id: 0,                    // Will be auto-generated
  name: "",
  price: 0.00,
  description: "",
  image: "",                // Auto-populated from images.primary
  images: {
    primary: "",
    gallery: []
  },
  category: "Apparel",      // Or the first category in the list
  discount: false,
  discountedPrice: 0.00,
  stock: 0,
  isNew: true               // New products are marked as "New" by default
};

/**
 * Async thunk to load products from products.json
 */
export const loadProducts = createAsyncThunk(
  'products/loadProducts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const dataSource = state.settings.dataSource || 'local';
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath, dataSource);
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
      const dataSource = state.settings.dataSource || 'local';
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath, dataSource);
      await productService.saveProducts(products);
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to add a new product
 */
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (product, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const dataSource = state.settings.dataSource || 'local';
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath, dataSource);
      const updatedProducts = await productService.addProduct(product);
      return updatedProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to update an existing product
 */
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const dataSource = state.settings.dataSource || 'local';
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath, dataSource);
      const updatedProducts = await productService.updateProduct(id, updates);
      return updatedProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to delete a product
 */
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const dataSource = state.settings.dataSource || 'local';
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath, dataSource);
      const updatedProducts = await productService.deleteProduct(id);
      return updatedProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to duplicate a product
 */
export const duplicateProduct = createAsyncThunk(
  'products/duplicateProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const projectPath = state.settings.projectPath;
      const dataSource = state.settings.dataSource || 'local';
      
      if (!projectPath) {
        throw new Error('Project path is not set');
      }

      const productService = new ProductService(projectPath, dataSource);
      const updatedProducts = await productService.duplicateProduct(id);
      return updatedProducts;
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
    bulkRemoveNewBadge: (state, action) => {
      const productIds = action.payload; // Array of product IDs
      if (!state.items || !Array.isArray(state.items)) {
        console.error('state.items is not an array:', state.items);
        return;
      }
      state.items = state.items.map(product => {
        if (productIds.includes(product.id)) {
          return { ...product, isNew: false };
        }
        return product;
      });
      state.hasUnsavedChanges = true;
    },
    bulkRemoveDiscount: (state, action) => {
      const productIds = action.payload; // Array of product IDs
      if (!state.items || !Array.isArray(state.items)) {
        console.error('state.items is not an array:', state.items);
        return;
      }
      state.items = state.items.map(product => {
        if (productIds.includes(product.id)) {
          return { ...product, discount: false, discountedPrice: 0.00 };
        }
        return product;
      });
      state.hasUnsavedChanges = true;
    },
    bulkDeleteProducts: (state, action) => {
      const productIds = action.payload; // Array of product IDs
      if (!state.items || !Array.isArray(state.items)) {
        console.error('state.items is not an array:', state.items);
        return;
      }
      state.items = state.items.filter(product => !productIds.includes(product.id));
      state.hasUnsavedChanges = true;
    },
    bulkApplyDiscount: (state, action) => {
      const { productIds, percentage } = action.payload; // { productIds: [], percentage: number }
      if (!state.items || !Array.isArray(state.items)) {
        console.error('state.items is not an array:', state.items);
        return;
      }
      state.items = state.items.map(product => {
        if (productIds.includes(product.id)) {
          const discountAmount = product.price * (percentage / 100);
          const discountedPrice = product.price - discountAmount;
          return { 
            ...product, 
            discount: true, 
            discountedPrice: parseFloat(discountedPrice.toFixed(2))
          };
        }
        return product;
      });
      state.hasUnsavedChanges = true;
    },
    bulkMakeNew: (state, action) => {
      const productIds = action.payload; // Array of product IDs
      if (!state.items || !Array.isArray(state.items)) {
        console.error('state.items is not an array:', state.items);
        return;
      }
      state.items = state.items.map(product => {
        if (productIds.includes(product.id)) {
          return { ...product, isNew: true };
        }
        return product;
      });
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

    // Handle addProduct
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add product';
      });

    // Handle updateProduct
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      });

    // Handle deleteProduct
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      });

    // Handle duplicateProduct
    builder
      .addCase(duplicateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasUnsavedChanges = true;
      })
      .addCase(duplicateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to duplicate product';
      });
  },
});

export const {
  addProductLocal,
  updateProductLocal,
  deleteProductLocal,
  bulkRemoveNewBadge,
  bulkRemoveDiscount,
  bulkDeleteProducts,
  bulkApplyDiscount,
  bulkMakeNew,
  clearError,
  resetUnsavedChanges,
} = productsSlice.actions;

export default productsSlice.reducer;
