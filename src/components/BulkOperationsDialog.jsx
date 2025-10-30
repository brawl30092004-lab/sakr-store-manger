import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import ProductImage from './ProductImage';
import './BulkOperationsDialog.css';

const BulkOperationsDialog = ({ isOpen, onClose, products, operationType, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  // Smart filtering based on operation type
  const filteredProducts = useMemo(() => {
    switch (operationType) {
      case 'removeNewBadge':
        return products.filter(p => p.isNew === true);
      case 'removeDiscount':
        return products.filter(p => p.discount === true || p.discount > 0);
      case 'deleteProducts':
        return products; // Show all products for deletion
      default:
        return products;
    }
  }, [products, operationType]);

  // Get operation title and description
  const getOperationInfo = () => {
    switch (operationType) {
      case 'removeNewBadge':
        return {
          title: 'Bulk Remove New Badge',
          description: 'Select products to remove the "New" badge from:',
          confirmText: 'Remove New Badge',
          emptyMessage: 'No products have the "New" badge.'
        };
      case 'removeDiscount':
        return {
          title: 'Bulk Remove Discount',
          description: 'Select discounted products to remove discount from:',
          confirmText: 'Remove Discount',
          emptyMessage: 'No products have discounts.'
        };
      case 'deleteProducts':
        return {
          title: 'Bulk Delete Products',
          description: 'Select products to delete:',
          confirmText: 'Delete Selected',
          emptyMessage: 'No products available.'
        };
      default:
        return {
          title: 'Bulk Operation',
          description: 'Select products:',
          confirmText: 'Confirm',
          emptyMessage: 'No products available.'
        };
    }
  };

  const operationInfo = getOperationInfo();

  // Toggle individual product selection
  const handleToggleProduct = (productId) => {
    setSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Select all products
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onConfirm(selectedIds);
      setSelectedIds([]);
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bulk-dialog-overlay" onClick={handleCancel}>
      <div className="bulk-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bulk-dialog-header">
          <h2>{operationInfo.title}</h2>
          <button className="bulk-dialog-close" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <div className="bulk-dialog-description">
          {operationInfo.description}
        </div>

        {/* Content */}
        <div className="bulk-dialog-content">
          {filteredProducts.length === 0 ? (
            <div className="bulk-dialog-empty">
              {operationInfo.emptyMessage}
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="bulk-select-all">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                  <span>Select All ({filteredProducts.length} products)</span>
                </label>
              </div>

              {/* Products List */}
              <div className="bulk-products-list">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`bulk-product-item ${selectedIds.includes(product.id) ? 'selected' : ''}`}
                    onClick={() => handleToggleProduct(product.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => handleToggleProduct(product.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="bulk-product-image">
                      <ProductImage 
                        product={product}
                      />
                    </div>
                    <div className="bulk-product-info">
                      <div className="bulk-product-name">{product.name}</div>
                      <div className="bulk-product-details">
                        <span className="bulk-product-price">
                          ${product.discount ? product.discountedPrice?.toFixed(2) : product.price?.toFixed(2)}
                        </span>
                        {product.isNew && <span className="bulk-badge new">New</span>}
                        {product.discount && <span className="bulk-badge discount">Discount</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bulk-dialog-footer">
          <div className="bulk-selected-count">
            {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="bulk-dialog-actions">
            <button className="bulk-btn bulk-btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="bulk-btn bulk-btn-confirm"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
            >
              {operationInfo.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsDialog;
