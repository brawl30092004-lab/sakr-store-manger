import { useState, useCallback } from 'react';
import { showSuccess, showError, showInfo } from '../services/toastService';

/**
 * Custom hook for handling git merge conflicts during publish operations
 * Provides dialog state management and resolution logic
 * 
 * @param {Function} onResolved - Optional callback when conflict is resolved
 * @returns {Object} - Hook state and handlers
 */
export function useConflictHandler(onResolved = null) {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingPublishData, setPendingPublishData] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  /**
   * Handles conflict resolution and continues with publish
   */
  const handleConflictResolved = useCallback(async (resolution) => {
    if (!pendingPublishData) {
      showError('No pending publish operation');
      return;
    }

    setIsResolving(true);
    
    try {
      // Step 1: Resolve the conflict
      const resolveResult = await window.electron.resolveConflict(resolution);
      
      if (!resolveResult.success) {
        showError(`Failed to resolve conflict: ${resolveResult.message}`);
        setIsResolving(false);
        return;
      }

      // Show appropriate success message
      if (resolution === 'custom') {
        showSuccess('Conflict resolved with your custom selections!');
      } else {
        const versionName = resolution === 'local' ? 'your' : 'store';
        showSuccess(`Conflict resolved! Using ${versionName} version.`);
      }

      // Step 2: Continue with publish (commit + push)
      showInfo('Continuing publish to store...');
      
      const publishResult = await window.electron.continuePublish(
        pendingPublishData.commitMessage,
        pendingPublishData.files
      );

      if (publishResult.success) {
        showSuccess('Successfully published to store!');
        
        // Close dialog and clear pending data
        setShowConflictDialog(false);
        setPendingPublishData(null);
        
        // Call custom callback if provided
        if (onResolved) {
          onResolved(resolution, publishResult);
        }
      } else {
        showError(`Publish failed: ${publishResult.message}`);
      }
    } catch (error) {
      console.error('Error in conflict resolution flow:', error);
      showError('Failed to complete publish operation');
    } finally {
      setIsResolving(false);
    }
  }, [pendingPublishData, onResolved]);

  /**
   * Handles cancellation of conflict resolution
   */
  const handleConflictCancelled = useCallback(async () => {
    setIsResolving(true);
    
    try {
      // Abort the merge
      const result = await window.electron.resolveConflict('abort');
      
      if (result.success) {
        showInfo('Publish cancelled. Your local changes are preserved.');
      } else {
        showError('Failed to cancel: ' + result.message);
      }
    } catch (error) {
      console.error('Error cancelling conflict:', error);
      showError('Failed to cancel operation');
    } finally {
      setShowConflictDialog(false);
      setPendingPublishData(null);
      setIsResolving(false);
    }
  }, []);

  /**
   * Checks if publish result contains a conflict and shows dialog
   * @param {Object} result - Publish result from gitService
   * @param {string} commitMessage - Commit message to use after resolution
   * @param {Array} files - Files to commit after resolution
   * @returns {boolean} - True if conflict was detected and dialog shown
   */
  const checkAndHandleConflict = useCallback((result, commitMessage = null, files = null) => {
    if (result.hasConflict || 
        (result.error === 'Merge conflicts detected') ||
        (result.message && result.message.includes('conflict'))) {
      // Show the conflict dialog
      setShowConflictDialog(true);
      
      // Store data needed to continue publish after resolution
      setPendingPublishData({
        commitMessage,
        files
      });
      
      return true;
    }
    
    return false;
  }, []);

  return {
    // State
    showConflictDialog,
    isResolving,
    
    // Handlers
    handleConflictResolved,
    handleConflictCancelled,
    checkAndHandleConflict,
    
    // Manual control
    setShowConflictDialog,
  };
}

export default useConflictHandler;
