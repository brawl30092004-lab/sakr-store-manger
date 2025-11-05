import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { showSuccess, showError, showInfo } from '../services/toastService';
import ConflictResolutionDialog from './ConflictResolutionDialog';
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
  const checkForRemoteChanges = useCallback(async () => {
    try {
      const result = await window.electron.checkRemoteChanges();
      
      if (result.success) {
        setRemoteChanges(result);
        
        // Show notification if there are new changes
        if (result.hasRemoteChanges && result.behindBy > 0) {
          showInfo(`${result.behindBy} new change(s) available on GitHub. Click sync to update.`, {
            autoClose: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error checking remote changes:', error);
    }
  }, []);

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
    setSyncStatus('Syncing from GitHub...');

    try {
      const result = await window.electron.pullManual();

      if (result.success) {
        // Update last sync time
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem('lastGitSync', now.getTime().toString());

        setSyncStatus(null);
        
        if (result.changes > 0) {
          showSuccess(`Synced ${result.changes} change(s) from GitHub`);
        } else {
          showSuccess('Already up to date with GitHub');
        }

        // Refresh remote changes status
        await checkForRemoteChanges();

        // Reload products if there were changes
        if (result.changes > 0) {
          window.location.reload();
        }
      } else {
        // Check if it's a conflict error
        if (result.error && result.error.includes('conflict')) {
          setSyncStatus(null);
          setShowConflictDialog(true);
        } else {
          setSyncStatus(null);
          showError(result.message || 'Sync failed');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus(null);
      showError('Failed to sync from GitHub');
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

        <button
          className={`sync-button ${isSyncing ? 'syncing' : ''} ${remoteChanges?.hasRemoteChanges ? 'has-updates' : ''}`}
          onClick={handleSync}
          disabled={isSyncing}
          title="Pull changes from GitHub"
        >
          <span className="sync-icon">🔄</span>
          <span className="sync-text">
            {isSyncing ? 'Syncing...' : remoteChanges?.hasRemoteChanges ? 'Update' : 'Sync'}
          </span>
        </button>

        {syncStatus && (
          <div className="sync-status-message">
            <div className="status-spinner"></div>
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onResolved={handleConflictResolved}
      />
    </>
  );
}

export default SyncStatusIndicator;
