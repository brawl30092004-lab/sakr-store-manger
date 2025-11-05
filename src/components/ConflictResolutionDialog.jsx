import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showInfo } from '../services/toastService';
import './ConflictResolutionDialog.css';

/**
 * ConflictResolutionDialog - User-friendly dialog for resolving merge conflicts
 * Provides simple options: Keep Local, Keep Remote, or Cancel
 */
function ConflictResolutionDialog({ isOpen, onClose, onResolved }) {
  const [conflictDetails, setConflictDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConflictDetails();
    }
  }, [isOpen]);

  /**
   * Load conflict details from backend
   */
  const loadConflictDetails = async () => {
    setIsLoading(true);
    try {
      const result = await window.electron.getConflictDetails();
      
      if (result.success) {
        setConflictDetails(result);
      } else {
        showError('Failed to load conflict details: ' + result.message);
        onClose();
      }
    } catch (error) {
      console.error('Error loading conflict details:', error);
      showError('Failed to load conflict details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resolve conflict by choosing a version
   */
  const handleResolve = async (resolution) => {
    setIsResolving(true);
    
    try {
      let result;
      
      if (resolution === 'cancel') {
        // Abort the merge
        result = await window.electron.resolveConflict('abort');
        
        if (result.success) {
          showInfo('Merge cancelled. Your local changes are preserved.');
          onClose();
        } else {
          showError('Failed to cancel merge: ' + result.message);
        }
      } else {
        // Resolve by keeping local or remote version
        result = await window.electron.resolveConflict(resolution);
        
        if (result.success) {
          const versionName = resolution === 'local' ? 'local' : 'remote';
          showSuccess(`Conflict resolved! Kept ${versionName} version.`);
          
          // Notify parent component
          if (onResolved) {
            onResolved(resolution);
          }
          
          onClose();
        } else {
          showError('Failed to resolve conflict: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      showError('Failed to resolve conflict');
    } finally {
      setIsResolving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="conflict-dialog-overlay" onClick={() => !isResolving && handleResolve('cancel')}>
      <div className="conflict-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="conflict-dialog-header">
          <div className="conflict-icon">⚠️</div>
          <h2>Merge Conflict Detected</h2>
          <p className="conflict-subtitle">
            Changes on GitHub conflict with your local changes
          </p>
        </div>

        <div className="conflict-dialog-content">
          {isLoading ? (
            <div className="conflict-loading">
              <div className="spinner"></div>
              <p>Loading conflict details...</p>
            </div>
          ) : conflictDetails && conflictDetails.hasConflicts ? (
            <>
              <div className="conflict-info">
                <p className="conflict-description">
                  <strong>{conflictDetails.conflictedFiles?.length || 0} file(s)</strong> have conflicting changes
                  between your local copy and GitHub.
                </p>
                
                {conflictDetails.conflictedFiles && conflictDetails.conflictedFiles.length > 0 && (
                  <div className="conflicted-files">
                    <p className="files-label">Conflicted files:</p>
                    <ul>
                      {conflictDetails.conflictedFiles.map((file, index) => (
                        <li key={index}>
                          <span className="file-icon">📄</span>
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="conflict-explanation">
                <h3>What do you want to do?</h3>
                <p>Choose how to resolve the conflict:</p>
              </div>

              <div className="conflict-options">
                <div className="conflict-option">
                  <div className="option-icon local">💻</div>
                  <div className="option-content">
                    <h4>Keep My Local Changes</h4>
                    <p>Keep your local version and discard changes from GitHub</p>
                    <p className="option-note">✓ Recommended if you made recent changes</p>
                  </div>
                </div>

                <div className="conflict-option">
                  <div className="option-icon remote">☁️</div>
                  <div className="option-content">
                    <h4>Use GitHub Version</h4>
                    <p>Discard your local changes and use the version from GitHub</p>
                    <p className="option-note">⚠️ Your local changes will be lost</p>
                  </div>
                </div>

                <div className="conflict-option">
                  <div className="option-icon cancel">🚫</div>
                  <div className="option-content">
                    <h4>Cancel</h4>
                    <p>Abort the sync and keep everything as is</p>
                    <p className="option-note">ℹ️ You can try again later</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conflicts">
              <p>No conflicts found.</p>
            </div>
          )}
        </div>

        <div className="conflict-dialog-actions">
          <button
            className="conflict-btn conflict-btn-local"
            onClick={() => handleResolve('local')}
            disabled={isResolving || isLoading}
          >
            {isResolving ? 'Resolving...' : '💻 Keep Local'}
          </button>
          
          <button
            className="conflict-btn conflict-btn-remote"
            onClick={() => handleResolve('remote')}
            disabled={isResolving || isLoading}
          >
            {isResolving ? 'Resolving...' : '☁️ Use GitHub'}
          </button>
          
          <button
            className="conflict-btn conflict-btn-cancel"
            onClick={() => handleResolve('cancel')}
            disabled={isResolving}
          >
            Cancel
          </button>
        </div>

        <div className="conflict-dialog-footer">
          <p className="conflict-help">
            💡 <strong>Tip:</strong> If you're unsure, click Cancel and contact your team to coordinate.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConflictResolutionDialog;
