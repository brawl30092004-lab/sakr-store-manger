import React, { useState, useMemo, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Package, Edit, Copy, Trash2, Star, Gift, X } from 'lucide-react';
import { addProduct, updateProduct, deleteProduct, duplicateProduct, toggleProductNew } from '../store/slices/productsSlice';
import { defaultProduct } from '../store/slices/productsSlice';
import ProductForm from './ProductForm';
import ProductImage from './ProductImage';
import ExportDialog from './ExportDialog';
import ContextMenu from './ContextMenu';
import InlineConfirmation from './InlineConfirmation';
import { showUndoNotification } from '../services/undoService.jsx';
import { showSuccess } from '../services/toastService';
import './MainContent.css';

const MainContent = forwardRef(({ selectedCategory, activeFilters, onFilterToggle }, ref) => {
  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // Context menu state
  const { items: products, loading, error } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  
  // Refs for child components
  const searchInputRef = useRef(null);
  const productFormRef = useRef(null);

  // Calculate filter counts
  const filters = useMemo(() => {
    const featuredCount = products.filter(p => p.isNew || p.tags?.includes('featured')).length;
    const discountsCount = products.filter(p => p.discount > 0).length;
    
    return [
      { id: 'featured', name: 'Featured', icon: Star, count: featuredCount },
      { id: 'discounts', name: 'Discounts', icon: Gift, count: discountsCount },
    ];
  }, [products]);

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

  // Handle opening form for new product - MEMOIZED
  const handleNewProduct = useCallback(() => {
    setEditingProduct(null);
    setIsFormOpen(true);
  }, []);

  // Handle opening form for editing product - MEMOIZED
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  }, []);

  // Handle closing form - MEMOIZED
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingProduct(null);
  }, []);

  // Handle saving product - MEMOIZED
  const handleSaveProduct = useCallback(async (productData) => {
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
  }, [editingProduct, products, dispatch]);

  // Handle deleting product - MEMOIZED
  const handleDeleteClick = useCallback((id) => {
    setDeleteConfirmId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirmId) {
      const productToDelete = products.find(p => p.id === deleteConfirmId);
      
      // Store deleted product for undo
      const deletedProduct = { ...productToDelete };
      
      // Delete the product
      await dispatch(deleteProduct(deleteConfirmId));
      
      // Show undo notification
      showUndoNotification(
        {
          type: 'DELETE_PRODUCT',
          description: `Deleted "${deletedProduct.name}"`,
          data: deletedProduct,
        },
        async () => {
          // Undo function - restore the product
          await dispatch(addProduct(deletedProduct)).unwrap();
          showSuccess('Product restored');
        },
        8000 // Show for 8 seconds
      );
      
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, dispatch, products]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  // Handle duplicating product - MEMOIZED
  const handleDuplicateProduct = useCallback((id) => {
    dispatch(duplicateProduct(id));
  }, [dispatch]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e, product) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      product: product
    });
  }, []);

  // Handle toggling new badge
  const handleToggleNew = useCallback((id) => {
    dispatch(toggleProductNew(id));
  }, [dispatch]);

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
      {/* Toolbar with Filters and Search */}
      <div className="toolbar">
        {/* Filter Chips */}
        <div className="filter-chips">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => onFilterToggle && onFilterToggle(filter.id)}
                title={`${filter.name} (${filter.count})`}
              >
                <Icon size={16} />
                <span className="filter-chip-label">{filter.name}</span>
                <span className="filter-chip-count">{filter.count}</span>
                {isActive && <X size={14} className="filter-chip-close" />}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="toolbar-search">
          <Search size={18} className="toolbar-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="toolbar-search-input"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Product List */}
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
              onContextMenu={(e) => handleContextMenu(e, product)}
            >
              {/* Product Image */}
              <ProductImage product={product} />

              {/* Product Info */}
              <div className="product-info">
                <h3 className="product-name" dir="auto">{product.name}</h3>
                
                <div className="product-price">
                  {product.discount ? (
                    <>
                      <span className="price-original">EGP {product.price != null ? Number(product.price).toFixed(2) : '0.00'}</span>
                      <span className="price-discounted">EGP {product.discountedPrice != null ? Number(product.discountedPrice).toFixed(2) : '0.00'}</span>
                    </>
                  ) : (
                    <span className="price">EGP {product.price != null ? Number(product.price).toFixed(2) : '0.00'}</span>
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
                  title="Edit (or Right-click for menu)"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  className="btn-action btn-duplicate" 
                  title="Duplicate"
                  onClick={() => handleDuplicateProduct(product.id)}
                >
                  <Copy size={16} /> Duplicate
                </button>
                <button 
                  className="btn-action btn-delete" 
                  title="Delete"
                  onClick={() => handleDeleteClick(product.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={() => handleEditProduct(contextMenu.product)}
          onDuplicate={() => handleDuplicateProduct(contextMenu.product.id)}
          onDelete={() => {
            setSelectedProductId(contextMenu.product.id);
            handleDeleteClick(contextMenu.product.id);
          }}
          onToggleNew={() => handleToggleNew(contextMenu.product.id)}
          productName={contextMenu.product.name}
          isNew={contextMenu.product.isNew}
        />
      )}

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
        <div style={{ 
          position: 'fixed', 
          top: '70px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 1000,
          maxWidth: '500px',
          width: '90%'
        }}>
          <InlineConfirmation
            message={`Are you sure you want to delete "${products.find(p => p.id === deleteConfirmId)?.name}"? You can undo this action.`}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
          />
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
