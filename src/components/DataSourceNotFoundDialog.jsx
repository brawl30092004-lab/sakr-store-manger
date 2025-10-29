import React, { useState } from 'react';
import './DataSourceNotFoundDialog.css';

/**
 * DataSourceNotFoundDialog Component
 * Displays when products.json is not found on app startup
 * Offers options to create new file or browse for existing file
 */
function DataSourceNotFoundDialog({ onCreateNew, onBrowseExisting, onClose }) {
  const [isCreating, setIsCreating] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      await onCreateNew();
    } finally {
      setIsCreating(false);
    }
  };

  const handleBrowseExisting = async () => {
    setIsBrowsing(true);
    try {
      await onBrowseExisting();
    } finally {
      setIsBrowsing(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="data-source-dialog">
        <div className="dialog-header">
          <h2>⚠️ Data Source Not Found</h2>
        </div>
        
        <div className="dialog-content">
          <p className="dialog-message">
            The products.json file could not be found at the configured location.
          </p>
          <p className="dialog-submessage">
            Would you like to create a new file or browse for an existing one?
          </p>

          <div className="dialog-options">
            <div className="option-card" onClick={!isCreating && !isBrowsing ? handleCreateNew : null}>
              <div className="option-icon">📄</div>
              <div className="option-details">
                <h3>Create New File</h3>
                <p>Create an empty products.json file at the configured location</p>
              </div>
              {isCreating && <div className="option-loading">Creating...</div>}
            </div>

            <div className="option-card" onClick={!isCreating && !isBrowsing ? handleBrowseExisting : null}>
              <div className="option-icon">🔍</div>
              <div className="option-details">
                <h3>Browse for Existing File</h3>
                <p>Select a different folder containing your products.json file</p>
              </div>
              {isBrowsing && <div className="option-loading">Opening...</div>}
            </div>
          </div>

          <div className="dialog-hint">
            <strong>Tip:</strong> You can change the data source location anytime in Settings.
          </div>
        </div>

        <div className="dialog-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={isCreating || isBrowsing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataSourceNotFoundDialog;
