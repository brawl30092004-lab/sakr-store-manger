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
          <svg className="header-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
          <h2>Data Source Not Found</h2>
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
              <svg className="option-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="option-details">
                <h3>Create New File</h3>
                <p>Create an empty products.json file at the configured location</p>
              </div>
              {isCreating && <div className="option-loading">Creating...</div>}
            </div>

            <div className="option-card" onClick={!isCreating && !isBrowsing ? handleBrowseExisting : null}>
              <svg className="option-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div className="option-details">
                <h3>Browse for Existing File</h3>
                <p>Select a different folder containing your products.json file</p>
              </div>
              {isBrowsing && <div className="option-loading">Opening...</div>}
            </div>
          </div>

          <div className="dialog-hint">
            <svg className="hint-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="8" r="1" fill="currentColor"/>
            </svg>
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
