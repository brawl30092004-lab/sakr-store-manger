import React, { useState, useEffect, useRef } from 'react';
import './StatusBar.css';

function StatusBar() {
  const [gitStatus, setGitStatus] = useState({
    hasChanges: false,
    totalChanges: 0,
    modified: 0,
    created: 0,
    deleted: 0,
    message: 'Ready'
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const statusCheckInterval = useRef(null);

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
        message: 'Ready'
      });
    }
  };

  /**
   * Handles the publish to GitHub action
   */
  const handlePublish = async () => {
    if (!gitStatus.hasChanges) {
      return;
    }

    setIsPublishing(true);
    
    try {
      // TODO: Implement publish functionality
      console.log('Publishing to GitHub...');
      
      // Placeholder for actual publish logic
      // This will be implemented in the next phase
      setTimeout(() => {
        alert('Publish functionality will be implemented in the next phase');
        setIsPublishing(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to publish:', error);
      alert(`Failed to publish: ${error.message}`);
      setIsPublishing(false);
    }
  };

  return (
    <div className="status-bar">
      <div className="status-message">
        <span className={`status-indicator ${gitStatus.hasChanges ? 'changes' : 'ready'}`}></span>
        <span>{gitStatus.message}</span>
        {gitStatus.hasChanges && gitStatus.totalChanges > 0 && (
          <span className="status-details">
            {gitStatus.modified > 0 && ` • ${gitStatus.modified} modified`}
            {gitStatus.created > 0 && ` • ${gitStatus.created} added`}
            {gitStatus.deleted > 0 && ` • ${gitStatus.deleted} deleted`}
          </span>
        )}
      </div>
      <button 
        className="publish-btn" 
        disabled={!gitStatus.hasChanges || isPublishing}
        onClick={handlePublish}
      >
        {isPublishing ? 'Publishing...' : 'Publish to GitHub'}
      </button>
    </div>
  );
}

export default StatusBar;
