import React, { useState, useEffect } from 'react';
import { showSuccess, showError, showInfo } from '../services/toastService';
import './ConflictResolutionDialog.css';

/**
 * ConflictResolutionDialog - User-friendly dialog for resolving merge conflicts
 * Provides simple options: Keep Local, Keep Remote, or Cancel
 */
function ConflictResolutionDialog({ isOpen, onClose, onResolved, isResolving: externalIsResolving = false }) {
  const [conflictDetails, setConflictDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [fieldSelections, setFieldSelections] = useState({});
  // Format: { productId: { field: useLocal (boolean) } }
  
  // Use external isResolving if provided (from hook), otherwise use internal state
  const resolving = externalIsResolving || isResolving;

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
   * Initialize default field selections (all local)
   */
  useEffect(() => {
    if (conflictDetails?.productConflicts) {
      const defaults = {};
      for (const product of conflictDetails.productConflicts) {
        defaults[product.productId] = {};
        for (const field of product.fieldConflicts) {
          defaults[product.productId][field.field] = true; // Default to local
        }
      }
      setFieldSelections(defaults);
    }
  }, [conflictDetails]);

  /**
   * Toggle field selection (local vs remote)
   */
  const toggleFieldSelection = (productId, field) => {
    setFieldSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: !prev[productId]?.[field]
      }
    }));
  };

  /**
   * Select all fields for a product from one source
   */
  const selectAllForProduct = (productId, useLocal) => {
    const product = conflictDetails.productConflicts.find(p => p.productId === productId);
    if (!product) return;
    
    const newSelections = {};
    for (const field of product.fieldConflicts) {
      newSelections[field.field] = useLocal;
    }
    
    setFieldSelections(prev => ({
      ...prev,
      [productId]: newSelections
    }));
  };

  /**
   * Resolve with custom field selections
   */
  const handleAdvancedResolve = async () => {
    setIsResolving(true);
    
    try {
      // Convert selections to array format
      const selections = [];
      for (const productId in fieldSelections) {
        for (const field in fieldSelections[productId]) {
          selections.push({
            productId,
            field,
            useLocal: fieldSelections[productId][field]
          });
        }
      }
      
      const result = await window.electron.resolveConflictWithFieldSelections(selections);
      
      if (result.success) {
        showSuccess('Conflict resolved with your custom selections!');
        
        // For external handlers (like StatusBar), continue with publish
        if (externalIsResolving !== false && onResolved) {
          showInfo('Continuing publish to store...');
          onResolved('custom'); // Signal custom resolution
        } else {
          onClose();
        }
      } else {
        showError('Failed to resolve conflict: ' + result.message);
      }
    } catch (error) {
      console.error('Error resolving with field selections:', error);
      showError('Failed to resolve conflict');
    } finally {
      setIsResolving(false);
    }
  };

  /**
   * Resolve conflict by choosing a version
   */
  const handleResolve = async (resolution) => {
    // If using external resolution handler, just call it
    if (externalIsResolving !== false) {
      if (resolution === 'cancel') {
        onClose();
      } else {
        onResolved(resolution);
      }
      return;
    }
    
    // Otherwise use internal resolution logic (for backward compatibility with SyncStatusIndicator)
    setIsResolving(true);
    
    try {
      let result;
      
      if (resolution === 'cancel') {
        // Abort the merge
        result = await window.electron.resolveConflict('abort');
        
        if (result.success) {
          showInfo('Merge cancelled. Your changes are preserved.');
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
            {externalIsResolving !== false 
              ? 'Cannot publish: changes on your store conflict with your local changes'
              : 'Changes on your store conflict with your local changes'}
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
                {conflictDetails.hasProductConflicts && conflictDetails.productConflicts?.length > 0 ? (
                  <>
                    <p className="conflict-description">
                      <strong>{conflictDetails.productConflicts.length} product(s)</strong> have conflicting changes
                      between your local version and the current store.
                    </p>
                    
                    <div className="product-conflicts">
                      {conflictDetails.productConflicts.map((product, pIndex) => (
                        <div key={pIndex} className="product-conflict-item">
                          <div className="product-conflict-header">
                            <span className="product-icon">📦</span>
                            <strong>{product.productName}</strong>
                            <span className="conflict-count">{product.fieldConflicts?.length || 0} field(s) differ</span>
                          </div>
                          
                          {showAdvancedMode && (
                            <div className="product-actions">
                              <button 
                                className="btn-select-all"
                                onClick={() => selectAllForProduct(product.productId, true)}
                                disabled={resolving}
                              >
                                Use All My Values
                              </button>
                              <button 
                                className="btn-select-all"
                                onClick={() => selectAllForProduct(product.productId, false)}
                                disabled={resolving}
                              >
                                Use All Store Values
                              </button>
                            </div>
                          )}
                          
                          <div className="field-conflicts">
                            {(product.fieldConflicts || []).map((field, fIndex) => (
                              <div key={fIndex} className="field-conflict">
                                <div className="field-name">{field.fieldLabel}:</div>
                                <div className={`field-comparison ${showAdvancedMode ? 'interactive' : ''}`}>
                                  <div 
                                    className={`field-version github-version ${showAdvancedMode && !fieldSelections[product.productId]?.[field.field] ? 'selected' : ''}`}
                                    onClick={() => showAdvancedMode && toggleFieldSelection(product.productId, field.field)}
                                    style={{ cursor: showAdvancedMode ? 'pointer' : 'default' }}
                                  >
                                    {showAdvancedMode && (
                                      <input 
                                        type="radio"
                                        name={`${product.productId}-${field.field}`}
                                        checked={!fieldSelections[product.productId]?.[field.field]}
                                        onChange={() => {}}
                                        className="field-radio"
                                      />
                                    )}
                                    <div className="version-label">🌐 Store</div>
                                    <div className="version-value">
                                      {field.field === 'price' ? `$${field.remoteValue}` : 
                                       field.field === 'isNew' ? (field.remoteValue ? 'Yes' : 'No') :
                                       field.field === 'discount' ? `${field.remoteValue}%` :
                                       field.remoteValue || '(empty)'}
                                    </div>
                                  </div>
                                  <div className="field-separator">vs</div>
                                  <div 
                                    className={`field-version local-version ${showAdvancedMode && fieldSelections[product.productId]?.[field.field] ? 'selected' : ''}`}
                                    onClick={() => showAdvancedMode && toggleFieldSelection(product.productId, field.field)}
                                    style={{ cursor: showAdvancedMode ? 'pointer' : 'default' }}
                                  >
                                    {showAdvancedMode && (
                                      <input 
                                        type="radio"
                                        name={`${product.productId}-${field.field}`}
                                        checked={fieldSelections[product.productId]?.[field.field]}
                                        onChange={() => {}}
                                        className="field-radio"
                                      />
                                    )}
                                    <div className="version-label">💻 Your Version</div>
                                    <div className="version-value">
                                      {field.field === 'price' ? `$${field.localValue}` :
                                       field.field === 'isNew' ? (field.localValue ? 'Yes' : 'No') :
                                       field.field === 'discount' ? `${field.localValue}%` :
                                       field.localValue || '(empty)'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              <div className="conflict-explanation">
                <h3>Which version do you want to keep?</h3>
                <p>Choose how to resolve {conflictDetails.hasProductConflicts ? 'these product conflicts' : 'the conflict'}:</p>
              </div>

              {!showAdvancedMode && (
                <div className="conflict-options">
                  {conflictDetails.hasProductConflicts && conflictDetails.productConflicts?.some(pc => pc.canAutoMerge) && (
                    <div className="conflict-option conflict-option-recommended">
                      <div className="option-icon merge">🔀</div>
                      <div className="option-content">
                        <h4>Smart Merge <span className="badge-recommended">✨ Recommended</span></h4>
                        <p>Combine both changes automatically - keep all updates from both sides</p>
                        <p className="option-note">✓ Best of both worlds - no data loss!</p>
                      </div>
                    </div>
                  )}

                  <div className="conflict-option">
                    <div className="option-icon local">💻</div>
                    <div className="option-content">
                      <h4>Use My Version</h4>
                      <p>Keep your changes and update the store with your version</p>
                      <p className="option-note">⚠️ Store changes will be overwritten</p>
                    </div>
                  </div>

                  <div className="conflict-option">
                    <div className="option-icon remote">☁️</div>
                    <div className="option-content">
                      <h4>Keep Store Version</h4>
                      <p>Discard your changes and keep what's currently on the store</p>
                      <p className="option-note">⚠️ Your edits will be lost</p>
                    </div>
                  </div>

                  <div className="conflict-option">
                    <div className="option-icon cancel">🚫</div>
                    <div className="option-content">
                      <h4>Cancel</h4>
                      <p>Abort and don't publish anything right now</p>
                      <p className="option-note">ℹ️ You can try again later or manually resolve</p>
                    </div>
                  </div>
                  
                  <div className="advanced-mode-toggle">
                    <button 
                      className="btn-toggle-advanced"
                      onClick={() => setShowAdvancedMode(true)}
                      disabled={resolving}
                    >
                      🎯 Choose Individual Fields (Advanced)
                    </button>
                    <p className="advanced-hint">Select which specific fields to keep from each version</p>
                  </div>
                </div>
              )}
              
              {showAdvancedMode && (
                <div className="advanced-mode-active">
                  <div className="advanced-mode-header">
                    <h4>🎯 Custom Field Selection</h4>
                    <p>Click on any field to choose which version to keep. Selected fields are highlighted.</p>
                    <button 
                      className="btn-back-simple"
                      onClick={() => setShowAdvancedMode(false)}
                      disabled={resolving}
                    >
                      ← Back to Simple Mode
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-conflicts">
              <p>No conflicts found.</p>
            </div>
          )}
        </div>

        <div className="conflict-dialog-actions">
          {showAdvancedMode ? (
            <>
              <button
                className="conflict-btn conflict-btn-custom"
                onClick={handleAdvancedResolve}
                disabled={resolving || isLoading}
                title="Apply your custom field selections"
              >
                {resolving ? 'Applying...' : '✓ Apply Custom Selection'}
              </button>
              <button
                className="conflict-btn conflict-btn-cancel"
                onClick={() => handleResolve('cancel')}
                disabled={resolving}
                title="Cancel this operation and try again later"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {conflictDetails?.hasProductConflicts && conflictDetails?.productConflicts?.some(pc => pc.canAutoMerge) && (
                <button
                  className="conflict-btn conflict-btn-merge"
                  onClick={() => handleResolve('merge')}
                  disabled={resolving || isLoading}
                  title="Intelligently combine both your changes and the store's changes"
                >
                  {resolving ? 'Merging...' : '🔀 Smart Merge (Recommended)'}
                </button>
              )}
              
              <button
                className="conflict-btn conflict-btn-local"
                onClick={() => handleResolve('local')}
                disabled={resolving || isLoading}
                title="Keep your changes and publish them to the store"
              >
                {resolving ? 'Resolving...' : '💻 Use My Version'}
              </button>
              
              <button
                className="conflict-btn conflict-btn-remote"
                onClick={() => handleResolve('remote')}
                disabled={resolving || isLoading}
                title="Discard your changes and keep the current store version"
              >
                {resolving ? 'Resolving...' : '☁️ Keep Store Version'}
              </button>
              
              <button
                className="conflict-btn conflict-btn-cancel"
                onClick={() => handleResolve('cancel')}
                disabled={resolving}
                title="Cancel this operation and try again later"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="conflict-dialog-footer">
          {resolving ? (
            <p className="conflict-help resolving">
              🔄 <strong>Resolving conflict and publishing...</strong> This may take a moment.
            </p>
          ) : (
            <p className="conflict-help">
              💡 <strong>Tip:</strong> If you're unsure, click Cancel and contact your team to coordinate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConflictResolutionDialog;
