import React, { useState, useEffect } from 'react';
import { showSuccess, showError } from '../services/toastService';
import './ChangesSummaryDialog.css';

function ChangesSummaryDialog({ isOpen, onClose, gitStatus, onPublish }) {
  const [commitMessage, setCommitMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true);
  
  // Get all changed files
  const getAllFiles = () => {
    const allFiles = [];
    if (gitStatus.files) {
      if (gitStatus.files.modified) allFiles.push(...gitStatus.files.modified);
      if (gitStatus.files.created) allFiles.push(...gitStatus.files.created);
      if (gitStatus.files.deleted) allFiles.push(...gitStatus.files.deleted);
    }
    return allFiles;
  };
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen && gitStatus.hasChanges) {
      console.log('Git Status in dialog:', gitStatus);
      
      // Generate a default commit message based on changes
      const defaultMessage = generateDefaultCommitMessage(gitStatus);
      setCommitMessage(defaultMessage);
      
      // Select all files by default
      const allFiles = getAllFiles();
      console.log('All files:', allFiles);
      setSelectedFiles(new Set(allFiles));
      setSelectAll(true);
    }
  }, [isOpen, gitStatus]);

  // Generate a helpful default commit message
  const generateDefaultCommitMessage = (status) => {
    const parts = [];
    
    if (status.modified > 0) {
      parts.push(`Updated ${status.modified} file${status.modified !== 1 ? 's' : ''}`);
    }
    if (status.created > 0) {
      parts.push(`Added ${status.created} file${status.created !== 1 ? 's' : ''}`);
    }
    if (status.deleted > 0) {
      parts.push(`Deleted ${status.deleted} file${status.deleted !== 1 ? 's' : ''}`);
    }
    
    return parts.join(', ') || 'Update files';
  };

  // Toggle file selection
  const toggleFileSelection = (file) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(file)) {
        newSet.delete(file);
      } else {
        newSet.add(file);
      }
      
      // Update select all state
      const allFiles = getAllFiles();
      setSelectAll(newSet.size === allFiles.length);
      
      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const allFiles = getAllFiles();
    if (selectAll) {
      setSelectedFiles(new Set());
      setSelectAll(false);
    } else {
      setSelectedFiles(new Set(allFiles));
      setSelectAll(true);
    }
  };

  // Restore a specific file
  const handleRestoreFile = async (file) => {
    try {
      const result = await window.electron.restoreFile(file);
      if (result.success) {
        showSuccess(`File restored: ${file}`);
        // Remove from selected files
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file);
          return newSet;
        });
        // Trigger a refresh of git status
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showError(result.message || `Failed to restore ${file}`);
      }
    } catch (error) {
      console.error('Failed to restore file:', error);
      showError(`Failed to restore file: ${error.message}`);
    }
  };

  // Undo a specific product change
  const handleUndoProductChange = async (productChange) => {
    try {
      const result = await window.electron.undoProductChange(productChange);
      if (result.success) {
        showSuccess(`Undone: ${productChange.productName}`);
        // Trigger a refresh of git status
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showError(result.message || `Failed to undo change for ${productChange.productName}`);
      }
    } catch (error) {
      console.error('Failed to undo product change:', error);
      showError(`Failed to undo product change: ${error.message}`);
    }
  };

  const handlePublish = async () => {
    if (!commitMessage.trim()) {
      showError('Please enter a commit message');
      return;
    }
    
    if (selectedFiles.size === 0) {
      showError('Please select at least one file to publish');
      return;
    }
    
    setIsPublishing(true);
    try {
      // Convert Set to Array for the API call
      const filesToCommit = Array.from(selectedFiles);
      const allFiles = getAllFiles();
      
      // If all files are selected, pass null to commit everything
      const filesParam = filesToCommit.length === allFiles.length ? null : filesToCommit;
      
      await onPublish(commitMessage.trim(), filesParam);
      onClose();
    } catch (error) {
      console.error('Failed to publish:', error);
      showError(error.message || 'Failed to publish changes');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="changes-summary-backdrop" onClick={handleBackdropClick}>
      <div className="changes-summary-dialog">
        {/* Header */}
        <div className="changes-summary-header">
          <div className="header-title">
            <svg className="icon-changes" width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
            </svg>
            <h2>Pending Changes</h2>
            <span className="changes-count">{gitStatus.totalChanges} {gitStatus.totalChanges === 1 ? 'file' : 'files'}</span>
          </div>
          <button className="btn-close" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="changes-summary-content">
          {/* Summary Stats */}
          <div className="changes-stats">
            {gitStatus.modified > 0 && (
              <div className="stat-item modified">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                </svg>
                <span className="stat-label">{gitStatus.modified} Modified</span>
              </div>
            )}
            {gitStatus.created > 0 && (
              <div className="stat-item added">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                </svg>
                <span className="stat-label">{gitStatus.created} Added</span>
              </div>
            )}
            {gitStatus.deleted > 0 && (
              <div className="stat-item deleted">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/>
                </svg>
                <span className="stat-label">{gitStatus.deleted} Deleted</span>
              </div>
            )}
          </div>

          {/* Product Changes Summary */}
          {gitStatus.productChanges && gitStatus.productChanges.length > 0 && (
            <div className="product-changes-section">
              <div className="product-changes-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75z"/>
                  <path d="M6.5 3.25a.75.75 0 00-.75.75v8a.75.75 0 001.5 0V4a.75.75 0 00-.75-.75zm2.75.75a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0V4z"/>
                </svg>
                <h3>Product Changes</h3>
                <span className="product-changes-count">{gitStatus.productChanges.length}</span>
              </div>
              <ul className="product-changes-list">
                {gitStatus.productChanges.map((change, index) => (
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
                    <button 
                      className="btn-undo-product"
                      onClick={() => handleUndoProductChange(change)}
                      disabled={isPublishing}
                      title={`Undo changes to ${change.productName}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.178A5.501 5.501 0 008 2.5zM1.705 8.005a.75.75 0 01.834.656 5.501 5.501 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834z"/>
                      </svg>
                      Undo
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Selection Controls */}
          <div className="selection-controls">
            <label className="select-all-checkbox">
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={toggleSelectAll}
                disabled={isPublishing}
              />
              <span className="checkbox-label">
                Select All ({selectedFiles.size} of {getAllFiles().length} selected)
              </span>
            </label>
            <div className="selection-hint">
              💡 Uncheck files to exclude them from this commit
            </div>
          </div>

          {/* File Lists */}
          <div className="changes-files">
            {gitStatus.files?.modified?.length > 0 && (
              <div className="file-group">
                <div className="file-group-header modified">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
                  </svg>
                  Modified Files
                </div>
                <ul className="file-list">
                  {gitStatus.files.modified.map((file, index) => (
                    <li key={`modified-${index}`} className="file-item">
                      <label className="file-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedFiles.has(file)}
                          onChange={() => toggleFileSelection(file)}
                          disabled={isPublishing}
                        />
                      </label>
                      <svg className="file-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
                      </svg>
                      <span className="file-name">{file}</span>
                      <button 
                        className="btn-restore"
                        onClick={() => handleRestoreFile(file)}
                        disabled={isPublishing}
                        title="Restore this file to last committed state"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.178A5.501 5.501 0 008 2.5zM1.705 8.005a.75.75 0 01.834.656 5.501 5.501 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834z"/>
                        </svg>
                        Undo
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gitStatus.files?.created?.length > 0 && (
              <div className="file-group">
                <div className="file-group-header added">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                  </svg>
                  Added Files
                </div>
                <ul className="file-list">
                  {gitStatus.files.created.map((file, index) => (
                    <li key={`created-${index}`} className="file-item">
                      <label className="file-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedFiles.has(file)}
                          onChange={() => toggleFileSelection(file)}
                          disabled={isPublishing}
                        />
                      </label>
                      <svg className="file-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
                      </svg>
                      <span className="file-name">{file}</span>
                      <button 
                        className="btn-restore"
                        onClick={() => handleRestoreFile(file)}
                        disabled={isPublishing}
                        title="Delete this new file"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/>
                        </svg>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gitStatus.files?.deleted?.length > 0 && (
              <div className="file-group">
                <div className="file-group-header deleted">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z"/>
                  </svg>
                  Deleted Files
                </div>
                <ul className="file-list">
                  {gitStatus.files.deleted.map((file, index) => (
                    <li key={`deleted-${index}`} className="file-item">
                      <label className="file-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedFiles.has(file)}
                          onChange={() => toggleFileSelection(file)}
                          disabled={isPublishing}
                        />
                      </label>
                      <svg className="file-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
                      </svg>
                      <span className="file-name">{file}</span>
                      <button 
                        className="btn-restore"
                        onClick={() => handleRestoreFile(file)}
                        disabled={isPublishing}
                        title="Restore this deleted file"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7.001 7.001 0 0114.95 7.16a.75.75 0 11-1.49.178A5.501 5.501 0 008 2.5zM1.705 8.005a.75.75 0 01.834.656 5.501 5.501 0 009.592 2.97l-1.204-1.204a.25.25 0 01.177-.427h3.646a.25.25 0 01.25.25v3.646a.25.25 0 01-.427.177l-1.38-1.38A7.001 7.001 0 011.05 8.84a.75.75 0 01.656-.834z"/>
                        </svg>
                        Restore
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Commit Message */}
          <div className="commit-message-section">
            <label className="commit-label">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              Commit Message
            </label>
            <textarea
              className="commit-message-input"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              rows={3}
              disabled={isPublishing}
            />
            <div className="commit-hint">
              Tip: Write a clear, concise message describing what changed and why
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="changes-summary-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isPublishing}
          >
            Cancel
          </button>
          <button 
            className="btn-publish-primary"
            onClick={handlePublish}
            disabled={!commitMessage.trim() || selectedFiles.size === 0 || isPublishing}
          >
            {isPublishing ? (
              <>
                <span className="spinner-small"></span>
                Publishing...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/>
                </svg>
                Publish {selectedFiles.size > 0 && `(${selectedFiles.size})`} to GitHub
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangesSummaryDialog;
