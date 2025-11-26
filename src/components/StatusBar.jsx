import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loadProducts } from '../store/slices/productsSlice';
import { loadCoupons, markCouponsSaved } from '../store/slices/couponsSlice';
import { showSuccess, showError, showLoading, dismissToast, ToastMessages } from '../services/toastService';
import ChangesSummaryDialog from './ChangesSummaryDialog';
import ConflictResolutionDialog from './ConflictResolutionDialog';
import useConflictHandler from '../hooks/useConflictHandler';
import './StatusBar.css';

function StatusBar() {
  const dispatch = useDispatch();
  const [gitStatus, setGitStatus] = useState({
    hasChanges: false,
    totalChanges: 0,
    modified: 0,
    created: 0,
    deleted: 0,
    files: { modified: [], created: [], deleted: [] },
    message: 'Ready'
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const statusCheckInterval = useRef(null);
  
  // Conflict handling hook
  const {
    showConflictDialog,
    isResolving,
    handleConflictResolved,
    handleConflictCancelled,
    checkAndHandleConflict
  } = useConflictHandler(async () => {
    // Callback after conflict resolution and successful publish
    // Reload products and coupons from file to sync with published version
    console.log('🔄 Reloading products and coupons after conflict resolution and publish...');
    await dispatch(loadProducts()).unwrap();
    await dispatch(loadCoupons()).unwrap();
    dispatch(markCouponsSaved());
    await checkGitStatus();
    console.log('✅ Products and coupons reloaded successfully');
  });

  // Check git status on component mount and set up periodic checks
  useEffect(() => {
    // Initial check
    checkGitStatus();

    // Set up periodic status checks (every 5 seconds)
    statusCheckInterval.current = setInterval(() => {
      checkGitStatus();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  /**
   * Checks the current git repository status
   */
  const checkGitStatus = async () => {
    try {
      const status = await window.electron.getGitStatus();
      
      if (status.success) {
        setGitStatus({
          hasChanges: status.hasChanges,
          totalChanges: status.totalChanges || 0,
          modified: status.modified || 0,
          created: status.created || 0,
          deleted: status.deleted || 0,
          files: status.files || { modified: [], created: [], deleted: [] },
          productChanges: status.productChanges || [], // Add product changes
          couponChanges: status.couponChanges || [], // Add coupon changes
          message: status.hasChanges 
            ? `Unsaved changes: ${status.totalChanges} file${status.totalChanges !== 1 ? 's' : ''}`
            : 'Ready'
        });
      } else {
        // If status check fails, show ready state
        setGitStatus({
          hasChanges: false,
          totalChanges: 0,
          modified: 0,
          created: 0,
          deleted: 0,
          files: { modified: [], created: [], deleted: [] },
          productChanges: [],
          couponChanges: [],
          message: 'Ready'
        });
      }
    } catch (error) {
      console.error('Failed to check git status:', error);
      setGitStatus({
        hasChanges: false,
        totalChanges: 0,
        modified: 0,
        created: 0,
        deleted: 0,
        files: { modified: [], created: [], deleted: [] },
        productChanges: [],
        couponChanges: [],
        message: 'Ready'
      });
    }
  };

  /**
   * Handles the publish to GitHub action
   */
  const handlePublish = async (commitMessage = null, files = null) => {
    if (!gitStatus.hasChanges) {
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    
    // Show loading toast
    const toastId = showLoading(ToastMessages.GITHUB_PUSHING);
    
    try {
      console.log('Publishing changes to store...');
      
      // Call the publish API with optional commit message and files
      const result = await window.electron.publishToGitHub(commitMessage, files);
      
      // Dismiss loading toast
      dismissToast(toastId);
      
      // Check if this is a conflict error
      if (checkAndHandleConflict(result, commitMessage, files)) {
        // Conflict detected - dialog will be shown by the hook
        console.log('Merge conflict detected, showing resolution dialog');
        return;
      }
      
      if (result.success) {
        // Success - show notification
        showSuccess(ToastMessages.GITHUB_PUBLISHED);
        
        // Reload products and coupons from file to sync with published version
        console.log('🔄 Reloading products and coupons after successful publish...');
        await dispatch(loadProducts()).unwrap();
        await dispatch(loadCoupons()).unwrap();
        
        // Mark coupons as saved (reset unsaved changes flag)
        dispatch(markCouponsSaved());
        
        // Refresh git status to update the UI
        await checkGitStatus();
        console.log('✅ Products and coupons reloaded successfully');
      } else {
        // Failed - show error (not a conflict)
        setPublishError(result.message || 'Failed to publish changes');
        showError(result.message || 'Failed to publish changes to store');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      setPublishError(error.message || 'An unexpected error occurred');
      
      // Dismiss loading toast and show error
      dismissToast(toastId);
      showError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="status-bar">
        <div className="status-message">
          <span className={`status-indicator ${gitStatus.hasChanges ? 'changes' : 'ready'}`}></span>
          <span className="status-text">
            {isPublishing ? 'Publishing changes to store...' : (
              gitStatus.hasChanges ? (
                // Show combined product and coupon changes count
                (() => {
                  const productCount = gitStatus.productChanges?.length || 0;
                  const couponCount = gitStatus.couponChanges?.length || 0;
                  
                  if (productCount > 0 && couponCount > 0) {
                    return `${productCount} product${productCount !== 1 ? 's' : ''}, ${couponCount} coupon${couponCount !== 1 ? 's' : ''} changed`;
                  } else if (productCount > 0) {
                    return `${productCount} product${productCount !== 1 ? 's' : ''} changed`;
                  } else if (couponCount > 0) {
                    return `${couponCount} coupon${couponCount !== 1 ? 's' : ''} changed`;
                  } else {
                    return `${gitStatus.totalChanges} file${gitStatus.totalChanges !== 1 ? 's' : ''} modified`;
                  }
                })()
              ) : (
                'All changes published • Ready'
              )
            )}
          </span>
          {gitStatus.hasChanges && gitStatus.totalChanges > 0 && !isPublishing && (
            <span className="status-details">
              {gitStatus.modified > 0 && ` • ${gitStatus.modified} modified`}
              {gitStatus.created > 0 && ` • ${gitStatus.created} added`}
              {gitStatus.deleted > 0 && ` • ${gitStatus.deleted} deleted`}
            </span>
          )}
          {publishError && (
            <span className="status-error"> • Error: {publishError}</span>
          )}
        </div>
        <div className="status-actions">
          <button 
            className={`view-changes-btn ${gitStatus.hasChanges ? 'has-changes' : ''}`}
            disabled={!gitStatus.hasChanges}
            onClick={() => setShowSummaryDialog(true)}
            title={gitStatus.hasChanges ? 'View pending changes' : 'No changes to view'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
            </svg>
            View Changes
          </button>
          <button 
            className={`publish-btn ${isPublishing ? 'publishing' : ''}`}
            disabled={!gitStatus.hasChanges || isPublishing}
            onClick={() => handlePublish()}
            title={gitStatus.hasChanges ? 'Publish all changes to your online store' : 'No changes to publish'}
          >
            {isPublishing ? (
              <>
                <span className="spinner"></span>
                Publishing...
              </>
            ) : (
              'Publish to Store'
            )}
          </button>
        </div>
      </div>
      
      <ChangesSummaryDialog
        isOpen={showSummaryDialog}
        onClose={() => setShowSummaryDialog(false)}
        gitStatus={gitStatus}
        onPublish={handlePublish}
      />
      
      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={handleConflictCancelled}
        onResolved={handleConflictResolved}
        isResolving={isResolving}
      />
    </>
  );
}

export default StatusBar;
