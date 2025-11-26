import React from 'react';
import { Plus, Save, Upload } from 'lucide-react';
import './FloatingActionButtons.css';

/**
 * FloatingActionButtons - Quick access to frequent actions
 * Provides easy access to common operations without menu navigation
 */
function FloatingActionButtons({ 
  onNewProduct, 
  onNewCoupon,
  onSave, 
  onExport,
  showExport = true,
  currentView = 'products'
}) {
  const handleNewClick = () => {
    if (currentView === 'coupons' && onNewCoupon) {
      onNewCoupon();
    } else if (onNewProduct) {
      onNewProduct();
    }
  };

  const newButtonTitle = currentView === 'coupons' ? 'New Coupon (Ctrl+N)' : 'New Product (Ctrl+N)';
  const newButtonLabel = currentView === 'coupons' ? 'Add new coupon' : 'Add new product';

  return (
    <div className="fab-container">
      <div className="fab-group">
        {/* New Product/Coupon - Primary Action */}
        <button
          className="fab fab-primary"
          onClick={handleNewClick}
          title={newButtonTitle}
          aria-label={newButtonLabel}
        >
          <Plus size={24} />
        </button>

        {/* Save */}
        <button
          className="fab fab-secondary"
          onClick={onSave}
          title="Save All (Ctrl+S)"
          aria-label="Save all changes"
        >
          <Save size={20} />
        </button>

        {/* Export (conditional) */}
        {showExport && (
          <button
            className="fab fab-secondary"
            onClick={onExport}
            title="Export Products"
            aria-label="Export products"
          >
            <Upload size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

export default FloatingActionButtons;
