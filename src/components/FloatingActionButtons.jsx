import React from 'react';
import { Plus, Save, Upload } from 'lucide-react';
import './FloatingActionButtons.css';

/**
 * FloatingActionButtons - Quick access to frequent actions
 * Provides easy access to common operations without menu navigation
 */
function FloatingActionButtons({ 
  onNewProduct, 
  onSave, 
  onExport,
  showExport = true 
}) {
  return (
    <div className="fab-container">
      <div className="fab-group">
        {/* New Product - Primary Action */}
        <button
          className="fab fab-primary"
          onClick={onNewProduct}
          title="New Product (Ctrl+N)"
          aria-label="Add new product"
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
