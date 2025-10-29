import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProductLocal, updateProductLocal } from '../store/slices/productsSlice';
import { defaultProduct } from '../store/slices/productsSlice';
import ProductForm from './ProductForm';
import './MainContent.css';

function MainContent({ selectedCategory }) {
  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { items: products, loading, error } = useSelector((state) => state.products);
  const dispatch = useDispatch();

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

    // Search Filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [products, selectedCategory, searchText]);

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
  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // Update existing product
      dispatch(updateProductLocal({
        id: editingProduct.id,
        data: productData
      }));
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        image: productData.images?.primary || ''
      };
      dispatch(addProductLocal(newProduct));
    }
  };

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
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
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
              <div className="product-image">
                <img 
                  src={product.image || product.images?.primary || 'placeholder.jpg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                {product.isNew && <span className="badge badge-new">New</span>}
                {product.discount && <span className="badge badge-discount">Sale</span>}
              </div>

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
              <div className="product-actions">
                <button 
                  className="btn-action btn-edit" 
                  title="Edit"
                  onClick={() => handleEditProduct(product)}
                >
                  ✏️ Edit
                </button>
                <button className="btn-action btn-duplicate" title="Duplicate">📋 Duplicate</button>
                <button className="btn-action btn-delete" title="Delete">🗑️ Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct || defaultProduct}
          onClose={handleCloseForm}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

export default MainContent;
