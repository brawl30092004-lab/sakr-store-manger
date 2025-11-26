import React, { useState, useEffect } from 'react';
import { showError, showLoading, dismissToast } from '../services/toastService';
import './RemoteChangesSummaryDialog.css';

/**
 * RemoteChangesSummaryDialog - Shows what changes would be pulled from GitHub
 * Similar to ChangesSummaryDialog but for incoming changes
 */
function RemoteChangesSummaryDialog({ isOpen, onClose, onSync }) {
  const [remoteChanges, setRemoteChanges] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load remote changes when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadRemoteChanges();
    }
  }, [isOpen]);

  const loadRemoteChanges = async () => {
    setIsLoading(true);
    const toastId = showLoading('Checking for remote changes...');
    
    try {
      const result = await window.electron.getRemoteChangeDetails();
      
      dismissToast(toastId);
      
      if (result.success) {
        setRemoteChanges(result);
      } else {
        showError(result.message || 'Failed to get remote changes');
        onClose();
      }
    } catch (error) {
      console.error('Failed to load remote changes:', error);
      dismissToast(toastId);
      showError('Failed to load remote changes');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
      onClose();
    } catch (error) {
      console.error('Failed to sync:', error);
      showError(error.message || 'Failed to sync changes');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSyncing) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="remote-changes-backdrop" onClick={handleBackdropClick}>
      <div className="remote-changes-dialog">
        {/* Header */}
        <div className="remote-changes-header">
          <div className="header-title">
            <svg className="icon-download" width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.75 8.44V1.75a.75.75 0 00-1.5 0v6.69L4.78 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"/>
            </svg>
            <h2>Incoming Changes</h2>
            {remoteChanges && (
              <span className="changes-count">
                {remoteChanges.totalChanges} {remoteChanges.totalChanges === 1 ? 'file' : 'files'}
              </span>
            )}
          </div>
          <button 
            className="btn-close" 
            onClick={onClose} 
            disabled={isSyncing}
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="remote-changes-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading remote changes...</p>
            </div>
          ) : remoteChanges && remoteChanges.hasRemoteChanges ? (
            <>
              {/* Summary Stats */}
              <div className="changes-stats">
                {remoteChanges.modified > 0 && (
                  <div className="stat-item modified">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                    </svg>
                    <span className="stat-label">{remoteChanges.modified} Modified</span>
                  </div>
                )}
                {remoteChanges.added > 0 && (
                  <div className="stat-item added">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                    </svg>
                    <span className="stat-label">{remoteChanges.added} Added</span>
                  </div>
                )}
                {remoteChanges.deleted > 0 && (
                  <div className="stat-item deleted">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/>
                    </svg>
                    <span className="stat-label">{remoteChanges.deleted} Deleted</span>
                  </div>
                )}
              </div>

              {/* Product Changes Summary */}
              {remoteChanges.productChanges && remoteChanges.productChanges.length > 0 && (
                <div className="product-changes-section">
                  <div className="product-changes-header">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75z"/>
                      <path d="M6.5 3.25a.75.75 0 00-.75.75v8a.75.75 0 001.5 0V4a.75.75 0 00-.75-.75zm2.75.75a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0V4z"/>
                    </svg>
                    <h3>Product Changes</h3>
                    <span className="product-changes-count">{remoteChanges.productChanges.length}</span>
                  </div>
                  <ul className="product-changes-list">
                    {remoteChanges.productChanges.map((change, index) => (
                      <li key={index} className={`product-change-item ${change.type}`}>
                        <div className="product-change-content">
                          {change.type === 'added' && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                            </svg>
                          )}
                          {change.type === 'deleted' && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M2.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/>
                            </svg>
                          )}
                          {change.type === 'modified' && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                            </svg>
                          )}
                          <span className="product-change-description">{change.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coupon Changes Summary */}
              {remoteChanges.couponChanges && remoteChanges.couponChanges.length > 0 && (
                <div className="product-changes-section coupon-changes-section">
                  <div className="product-changes-header">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
                    </svg>
                    <h3>Coupon Changes</h3>
                    <span className="product-changes-count">{remoteChanges.couponChanges.length}</span>
                  </div>
                  <ul className="product-changes-list">
                    {remoteChanges.couponChanges.map((change, index) => (
                      <li key={`coupon-${index}`} className={`product-change-item ${change.type}`}>
                        <div className="product-change-content">
                          {change.type === 'added' && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                            </svg>
                          )}
                          {change.type === 'deleted' && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M2.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/>
                            </svg>
                          )}
                          {change.type === 'modified' && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                            </svg>
                          )}
                          <span className="product-change-description">{change.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Info Message */}
              <div className="info-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 8a8 8 0 1116 0A8 8 0 010 8zm8-6.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM6.5 7.75A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
                <p>These changes will be pulled from your online store and merged with your local copy.</p>
              </div>

              {/* File Lists */}
              <div className="changes-files">
                {remoteChanges.files?.modified?.length > 0 && (
                  <div className="file-group">
                    <div className="file-group-header modified">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                      </svg>
                      Modified Files
                    </div>
                    <ul className="file-list">
                      {remoteChanges.files.modified.map((file, index) => (
                        <li key={`modified-${index}`} className="file-item">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688a.252.252 0 00-.011-.013l-2.914-2.914a.272.272 0 00-.013-.011z"/>
                          </svg>
                          <span className="file-name">{file.path}</span>
                          <span className="file-stats">
                            <span className="insertions">+{file.insertions}</span>
                            <span className="deletions">-{file.deletions}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {remoteChanges.files?.added?.length > 0 && (
                  <div className="file-group">
                    <div className="file-group-header added">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                      </svg>
                      Added Files
                    </div>
                    <ul className="file-list">
                      {remoteChanges.files.added.map((file, index) => (
                        <li key={`added-${index}`} className="file-item">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688a.252.252 0 00-.011-.013l-2.914-2.914a.272.272 0 00-.013-.011z"/>
                          </svg>
                          <span className="file-name">{file.path}</span>
                          <span className="file-stats">
                            <span className="insertions">+{file.insertions}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {remoteChanges.files?.deleted?.length > 0 && (
                  <div className="file-group">
                    <div className="file-group-header deleted">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/>
                      </svg>
                      Deleted Files
                    </div>
                    <ul className="file-list">
                      {remoteChanges.files.deleted.map((file, index) => (
                        <li key={`deleted-${index}`} className="file-item">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688a.252.252 0 00-.011-.013l-2.914-2.914a.272.272 0 00-.013-.011z"/>
                          </svg>
                          <span className="file-name">{file.path}</span>
                          <span className="file-stats">
                            <span className="deletions">-{file.deletions}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
              <h3>You're up to date!</h3>
              <p>Your local copy is in sync with your online store.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {remoteChanges && remoteChanges.hasRemoteChanges && (
          <div className="remote-changes-footer">
            <button 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isSyncing}
            >
              Cancel
            </button>
            <button 
              className={`btn-sync ${isSyncing ? 'syncing' : ''}`}
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <span className="spinner"></span>
                  Syncing...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.178A5.501 5.501 0 008 2.5zM1.705 8.005a.75.75 0 01.834.656 5.501 5.501 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834z"/>
                  </svg>
                  Pull {remoteChanges.totalChanges} Change{remoteChanges.totalChanges !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RemoteChangesSummaryDialog;
