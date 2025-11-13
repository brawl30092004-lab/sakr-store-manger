import React, { useState } from 'react';
import './DataSourceSetupDialog.css';

/**
 * DataSourceSetupDialog Component
 * Unified dialog for setting up data sources - handles both first-time setup and manual browsing
 * Context-aware: Shows different messages based on how it was triggered
 * 
 * @param {Function} onCreateNew - Handler for creating new local file
 * @param {Function} onBrowseExisting - Handler for browsing for existing local file
 * @param {Function} onConnectGitHub - Handler for connecting to GitHub repository
 * @param {Function} onClose - Handler for closing the dialog
 * @param {string} context - Context of dialog: 'missing', 'first-start', or 'manual'
 */
function DataSourceSetupDialog({ 
  onCreateNew, 
  onBrowseExisting, 
  onConnectGitHub,
  onClose,
  context = 'missing' // 'missing', 'first-start', or 'manual'
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Context-aware messaging
  const getTitle = () => {
    switch (context) {
      case 'first-start':
        return 'Set Up Your Data Source';
      case 'manual':
        return 'Choose Data Source';
      case 'missing':
      default:
        return 'Data Source Not Found';
    }
  };

  const getMessage = () => {
    switch (context) {
      case 'first-start':
        return 'Choose where you want to store and manage your product data:';
      case 'manual':
        return 'Select how you want to manage your product data:';
      case 'missing':
      default:
        return 'The products.json file could not be found at the configured location.';
    }
  };

  const getSubmessage = () => {
    switch (context) {
      case 'first-start':
        return 'You can change this later in Settings.';
      case 'manual':
        return 'This will update your current data source configuration.';
      case 'missing':
      default:
        return 'Would you like to create a new file, browse for an existing one, or connect to GitHub?';
    }
  };

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

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      await onConnectGitHub();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="data-source-setup-dialog">
        <div className="dialog-header">
          <svg className="header-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
          <h2>{getTitle()}</h2>
        </div>
        
        <div className="dialog-content">
          <p className="dialog-message">
            {getMessage()}
          </p>
          <p className="dialog-submessage">
            {getSubmessage()}
          </p>

          <div className="dialog-options">
            {/* Local File - Create New */}
            <div 
              className="option-card" 
              onClick={!isCreating && !isBrowsing && !isConnecting ? handleCreateNew : null}
              disabled={isCreating || isBrowsing || isConnecting}
            >
              <svg className="option-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="option-details">
                <h3>Create New Local File</h3>
                <p>Start fresh with an empty products.json file on your computer</p>
              </div>
              {isCreating && <div className="option-loading">Creating...</div>}
            </div>

            {/* Local File - Browse Existing */}
            <div 
              className="option-card" 
              onClick={!isCreating && !isBrowsing && !isConnecting ? handleBrowseExisting : null}
              disabled={isCreating || isBrowsing || isConnecting}
            >
              <svg className="option-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div className="option-details">
                <h3>Browse for Existing File</h3>
                <p>Select a folder containing your products.json file</p>
              </div>
              {isBrowsing && <div className="option-loading">Opening...</div>}
            </div>

            {/* GitHub Repository */}
            <div 
              className="option-card github-option" 
              onClick={!isCreating && !isBrowsing && !isConnecting ? handleConnectGitHub : null}
              disabled={isCreating || isBrowsing || isConnecting}
            >
              <svg className="option-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="option-details">
                <h3>Connect to GitHub Repository</h3>
                <p>Sync with a GitHub repository for backup and version control</p>
              </div>
              {isConnecting && <div className="option-loading">Connecting...</div>}
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
            disabled={isCreating || isBrowsing || isConnecting}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataSourceSetupDialog;
