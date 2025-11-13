import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { showSuccess, showError, showInfo } from '../services/toastService';
import ConflictResolutionDialog from './ConflictResolutionDialog';
import RemoteChangesSummaryDialog from './RemoteChangesSummaryDialog';
import './SyncStatusIndicator.css';

/**
 * SyncStatusIndicator - Shows sync status and provides manual sync button
 * Displays last sync time, pending changes, and remote changes indicator
 */
function SyncStatusIndicator() {
  const dataSource = useSelector((state) => state.settings.dataSource);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [remoteChanges, setRemoteChanges] = useState(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showRemoteChangesDialog, setShowRemoteChangesDialog] = useState(false);
  const [checkInterval, setCheckInterval] = useState(null);

  /**
   * Load last sync time from localStorage
   */
  useEffect(() => {
    // Skip if not in GitHub mode
    if (dataSource !== 'github') {
      return;
    }

    const savedTime = localStorage.getItem('lastGitSync');
    if (savedTime) {
      setLastSyncTime(new Date(parseInt(savedTime)));
    }

    // Start periodic checking for remote changes (every 5 minutes)
    const interval = setInterval(() => {
      checkForRemoteChanges();
    }, 300000); // 5 minutes

    setCheckInterval(interval);

    // Initial check
    checkForRemoteChanges();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dataSource]);

  /**
   * Check for remote changes without pulling
   */
  const checkForRemoteChanges = useCallback(async (showNotification = false) => {
    try {
      const result = await window.electron.checkRemoteChanges();
      
      if (result.success) {
        setRemoteChanges(result);
        
        // Show notification if there are new changes (only when auto-checking or manually triggered)
        if (showNotification) {
          if (result.hasRemoteChanges && result.behindBy > 0) {
            showInfo(`${result.behindBy} new change(s) available from your store. Click sync to update.`, {
              autoClose: 5000
            });
          } else {
            showSuccess('Already up to date with your store');
          }
        }
      }
    } catch (error) {
      console.error('Error checking remote changes:', error);
      if (showNotification) {
        showError('Failed to check for remote changes');
      }
    }
  }, []);

  /**
   * Handle manual refresh of remote changes
   */
  const handleRefresh = async () => {
    await checkForRemoteChanges(true);
  };

  /**
   * Format relative time (e.g., "2 minutes ago")
   */
  const getRelativeTime = (date) => {
    if (!date) return 'Never';

    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  /**
   * Handle manual sync from GitHub
   */
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing from store...');

    try {
      const result = await window.electron.pullManual();

      if (result.success) {
        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem('lastGitSync', now.getTime().toString());

        setSyncStatus(null);
        
        if (result.changes > 0) {
          showSuccess(`Synced ${result.changes} change(s) from store`);
        } else {
          showSuccess('Already up to date with store');
        }

        // Refresh remote changes status
        await checkForRemoteChanges();

        // Reload products if there were changes
        if (result.changes > 0) {
          window.location.reload();
        }
      } else {
        setSyncStatus(null);
        
        // Check if it's a conflict that needs resolution
        if (result.hasConflict || result.needsResolution || 
            (result.error && result.error.includes('conflict'))) {
          console.log('🔀 Sync conflict detected, showing resolution dialog...');
          setShowConflictDialog(true);
        } else {
          // Other errors (network, auth, etc.)
          const userMessage = result.userMessage || result.message || 'Sync failed';
          showError(userMessage);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(null);
      showError('Failed to sync from store');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Handle conflict resolution completion
   */
  const handleConflictResolved = async (resolution) => {
    // Reload products after conflict resolution
    showInfo('Reloading products...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Only show for GitHub mode - check at the end after all hooks
  if (dataSource !== 'github') {
    return null;
  }

  return (
    <>
      <div className="sync-status-indicator">
        <div className="sync-info">
          <div className="sync-time">
            <span className="sync-label">Last synced:</span>
            <span className="sync-value">{getRelativeTime(lastSyncTime)}</span>
          </div>

          {remoteChanges && remoteChanges.hasRemoteChanges && (
            <div className="remote-changes-badge" title={remoteChanges.message}>
              <span className="badge-icon">⬇️</span>
              <span className="badge-text">{remoteChanges.behindBy} new</span>
            </div>
          )}

          {remoteChanges && remoteChanges.aheadBy > 0 && (
            <div className="local-changes-badge" title={`${remoteChanges.aheadBy} unpublished changes`}>
              <span className="badge-icon">⬆️</span>
              <span className="badge-text">{remoteChanges.aheadBy} local</span>
            </div>
          )}
        </div>

        <div className="sync-actions">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={isSyncing}
            title="Check for new changes from your store"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 00-.908-.417A4 4 0 118 4v1.076l.812-.812a.5.5 0 11.707.708L7.477 6.914a.5.5 0 01-.708 0L4.727 4.872a.5.5 0 11.708-.708L6.248 5H8V3z"/>
            </svg>
          </button>

          <button
            className={`view-remote-changes-btn ${remoteChanges?.hasRemoteChanges ? 'has-changes' : ''}`}
            onClick={() => setShowRemoteChangesDialog(true)}
            disabled={isSyncing}
            title={remoteChanges?.hasRemoteChanges ? 'View incoming changes from GitHub' : 'No remote changes to view'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
            </svg>
            View Changes
          </button>

          <button
            className={`sync-button ${isSyncing ? 'syncing' : ''} ${remoteChanges?.hasRemoteChanges ? 'has-updates' : ''}`}
            onClick={handleSync}
            disabled={isSyncing}
            title="Pull latest changes from your online store"
          >
            <span className="sync-icon">🔄</span>
            <span className="sync-text">
              {isSyncing ? 'Syncing...' : remoteChanges?.hasRemoteChanges ? 'Get Updates' : 'Sync'}
            </span>
          </button>
        </div>

        {syncStatus && (
          <div className="sync-status-message">
            <div className="status-spinner"></div>
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      <RemoteChangesSummaryDialog
        isOpen={showRemoteChangesDialog}
        onClose={() => setShowRemoteChangesDialog(false)}
        onSync={handleSync}
      />

      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onResolved={handleConflictResolved}
      />
    </>
  );
}

export default SyncStatusIndicator;
