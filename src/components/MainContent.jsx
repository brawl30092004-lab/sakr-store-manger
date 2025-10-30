import React, { useState, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, updateProduct, deleteProduct, duplicateProduct } from '../store/slices/productsSlice';
import { defaultProduct } from '../store/slices/productsSlice';
import ProductForm from './ProductForm';
import ProductImage from './ProductImage';
import ExportDialog from './ExportDialog';
import './MainContent.css';

const MainContent = forwardRef(({ selectedCategory, activeFilters }, ref) => {
  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { items: products, loading, error } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  
  // Refs for child components
  const searchInputRef = useRef(null);
  const productFormRef = useRef(null);

  // Filtering Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(product => {
        // Convert category ID back to category name for comparison
        // Category ID format: "electronics" -> Category name: "Electronics"
        // We need to match against the actual product.category value
        const categoryId = selectedCategory.toLowerCase().replace(/\s+/g, '-');
        const productCategoryId = product.category.toLowerCase().replace(/\s+/g, '-');
        return productCategoryId === categoryId;
      });
    }

    // Special Filters - Apply all active filters (AND logic)
    if (activeFilters && activeFilters.length > 0) {
      result = result.filter(product => {
        let passesFilters = true;
        
        // Check each active filter
        if (activeFilters.includes('featured')) {
          passesFilters = passesFilters && (product.isNew || product.tags?.includes('featured'));
        }
        
        if (activeFilters.includes('discounts')) {
          passesFilters = passesFilters && (product.discount > 0);
        }
        
        return passesFilters;
      });
    }

    // Search Filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [products, selectedCategory, activeFilters, searchText]);

  // Handle opening form for new product
  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  // Handle opening form for editing product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  // Handle closing form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Handle saving product
  const handleSaveProduct = async (productData) => {
    // Check if this is an update (productData.id > 0) or a new product (productData.id === 0)
    if (editingProduct || productData.id > 0) {
      // Update existing product
      const productId = editingProduct?.id || productData.id;
      await dispatch(updateProduct({
        id: productId,
        updates: productData
      })).unwrap();
      // For updates, return the current products state
      return products;
    } else {
      // Add new product
      const result = await dispatch(addProduct(productData)).unwrap();
      // Return the updated products array from the action
      return result;
    }
  };

  // Handle deleting product
  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      dispatch(deleteProduct(deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  // Handle duplicating product
  const handleDuplicateProduct = (id) => {
    dispatch(duplicateProduct(id));
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleNewProduct,
    handleSave: () => {
      if (productFormRef.current?.handleSave) {
        productFormRef.current.handleSave();
      }
    },
    handleExport: () => {
      setIsExportDialogOpen(true);
    },
    focusSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    handleDeleteShortcut: () => {
      if (selectedProductId && !isFormOpen && !deleteConfirmId) {
        handleDeleteClick(selectedProductId);
      }
    },
    handleEscape: () => {
      if (deleteConfirmId) {
        handleDeleteCancel();
      } else if (isFormOpen) {
        handleCloseForm();
      }
    },
    handleEnter: () => {
      if (isFormOpen && productFormRef.current?.handleEnter) {
        productFormRef.current.handleEnter();
      }
    }
  }));

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-message">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Toolbar with New Product Button */}
      <div className="toolbar">
        <button 
          className="btn-new-product"
          onClick={handleNewProduct}
        >
          + New Product
        </button>
        
        <button 
          className="btn-export"
          onClick={() => setIsExportDialogOpen(true)}
          title="Export products to organized folder structure"
        >
          📦 Export Products
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search products by name or description..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Product List */}
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {/* Product Image */}
              <ProductImage product={product} />

              {/* Product Info */}
              <div className="product-info">
                <h3 className="product-name" dir="auto">{product.name}</h3>
                
                <div className="product-price">
                  {product.discount ? (
                    <>
                      <span className="price-original">EGP {product.price.toFixed(2)}</span>
                      <span className="price-discounted">EGP {product.discountedPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="price">EGP {product.price.toFixed(2)}</span>
                  )}
                </div>

                <div className="product-meta">
                  <span className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                    {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                  </span>
                  <span className="product-category">{product.category}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div 
                className="product-actions"
                onClick={() => setSelectedProductId(product.id)}
              >
                <button 
                  className="btn-action btn-edit" 
                  title="Edit"
                  onClick={() => handleEditProduct(product)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-action btn-duplicate" 
                  title="Duplicate"
                  onClick={() => handleDuplicateProduct(product.id)}
                >
                  📋 Duplicate
                </button>
                <button 
                  className="btn-action btn-delete" 
                  title="Delete"
                  onClick={() => handleDeleteClick(product.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          ref={productFormRef}
          product={editingProduct || defaultProduct}
          onClose={handleCloseForm}
          onSave={handleSaveProduct}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this product?</p>
            <p className="confirmation-warning">This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Dialog */}
      <ExportDialog 
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </div>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent;
