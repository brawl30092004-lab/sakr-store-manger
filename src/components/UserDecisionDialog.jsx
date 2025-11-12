import React from 'react';
import './UserDecisionDialog.css';

/**
 * Dialog configuration for different scenarios
 */
const dialogConfigs = {
  missingFiles: {
    title: '⚠️ Files Are Missing',
    getMessage: (missingFiles) => {
      // Defensive check: ensure missingFiles is an array
      const filesList = Array.isArray(missingFiles) && missingFiles.length > 0
        ? missingFiles.map(f => `  ✗ ${f}`).join('\n')
        : '  ✗ Required files are missing';
      
      return `We found a problem:

The folder you selected appears to have missing files:
${filesList}

It looks like the files were deleted, but the connection to GitHub is still there (in a hidden folder).`;
    },
    
    options: [
      {
        id: 'restore',
        icon: '🔄',
        title: 'Restore from GitHub',
        description: 'Download the missing files again',
        note: 'Your GitHub data is safe and will be downloaded',
        recommended: true
      },
      {
        id: 'fresh',
        icon: '🗑️',
        title: 'Start Completely Fresh',
        description: 'Delete everything and re-download',
        note: 'Removes the hidden folder too'
      },
      {
        id: 'cancel',
        icon: '❌',
        title: 'Cancel',
        description: 'Go back without making changes'
      }
    ]
  },
  
  repoMismatch: {
    title: '🔀 Different Repository Detected',
    getMessage: (currentUrl, newUrl) => `Your folder is currently connected to:
📍 ${currentUrl || '(unknown)'}

But you just entered:
📍 ${newUrl || '(not specified)'}

These are different repositories!`,
    
    options: [
      {
        id: 'switch',
        icon: '🔗',
        title: 'Switch Connection',
        description: 'Keep files, just change which GitHub repository we sync with',
        warning: 'Only do this if the files are the same in both repositories'
      },
      {
        id: 'reclone',
        icon: '📥',
        title: 'Download New Repository',
        description: 'Delete current files and download from the new repository',
        warning: 'Current files will be deleted',
        destructive: true
      },
      {
        id: 'cancel',
        icon: '❌',
        title: 'Cancel - Keep Current Setup',
        description: 'Go back without making changes'
      }
    ]
  },
  
  localChangesConflict: {
    title: '🔄 Update Available from Store',
    getMessage: (changedFiles) => {
      // Defensive check: ensure changedFiles is an array
      const filesList = Array.isArray(changedFiles) && changedFiles.length > 0
        ? changedFiles.map(f => `  📝 ${f}`).join('\n')
        : '  📝 Local files have been modified';
      
      return `There are new changes on your store, but you also have changes on this computer that haven't been saved yet.

Your changes:
${filesList}

How should we handle this?`;
    },
    
    options: [
      {
        id: 'commit-first',
        icon: '💾',
        title: 'Save My Changes First',
        description: 'Upload your changes to the store, then download the updates',
        note: 'Keeps your work safe',
        recommended: true
      },
      {
        id: 'discard',
        icon: '📥',
        title: 'Download Updates (Discard Mine)',
        description: 'Throw away your changes and download from the store',
        warning: 'Your recent changes will be permanently lost!',
        destructive: true
      },
      {
        id: 'cancel',
        icon: '❌',
        title: 'Cancel - I\'ll Fix This Later',
        description: 'Go back without making changes'
      }
    ]
  },

  nonEmptyFolder: {
    title: '📁 Folder Is Not Empty',
    getMessage: (fileCount) => `The folder you selected already contains ${fileCount} item(s).

To download the repository from GitHub, we need an empty folder.`,
    
    options: [
      {
        id: 'delete',
        icon: '🗑️',
        title: 'Delete Contents and Continue',
        description: 'Remove all files in this folder and download from GitHub',
        warning: 'All current files will be permanently deleted',
        destructive: true
      },
      {
        id: 'cancel',
        icon: '❌',
        title: 'Cancel - Choose Another Folder',
        description: 'Go back and select a different folder',
        recommended: true
      }
    ]
  }
};

/**
 * UserDecisionDialog Component
 * 
 * A user-friendly dialog that presents choices in plain language
 * without technical jargon.
 * 
 * @param {string} type - Type of dialog (missingFiles, repoMismatch, etc.)
 * @param {any} data - Data to pass to getMessage function
 * @param {function} onChoice - Callback when user makes a choice
 * @param {boolean} isOpen - Whether dialog is visible
 */
const UserDecisionDialog = ({ type, data, onChoice, isOpen }) => {
  if (!isOpen) return null;

  const config = dialogConfigs[type];
  if (!config) {
    console.error('Unknown dialog type:', type);
    return null;
  }

  // Handle different data formats
  let message;
  if (Array.isArray(data)) {
    // Spread array for functions expecting multiple arguments
    message = config.getMessage(...data);
  } else {
    // Pass single value directly
    message = config.getMessage(data);
  }

  const handleChoice = (optionId) => {
    onChoice(optionId);
  };

  return (
    <div className="user-decision-overlay">
      <div className="user-decision-dialog">
        <div className="dialog-header">
          <h2>{config.title}</h2>
        </div>
        
        <div className="dialog-body">
          <div className="dialog-message">
            {message.split('\n').map((line, i) => (
              <p key={i}>{line || '\u00A0'}</p>
            ))}
          </div>
          
          <div className="dialog-options">
            {config.options.map(option => (
              <button
                key={option.id}
                className={`dialog-option ${option.recommended ? 'recommended' : ''} ${option.destructive ? 'destructive' : ''}`}
                onClick={() => handleChoice(option.id)}
              >
                <div className="option-icon">{option.icon}</div>
                <div className="option-content">
                  <div className="option-title">
                    {option.title}
                    {option.recommended && <span className="badge-recommended">Recommended</span>}
                  </div>
                  <div className="option-description">{option.description}</div>
                  {option.note && (
                    <div className="option-note">✓ {option.note}</div>
                  )}
                  {option.warning && (
                    <div className="option-warning">⚠️ {option.warning}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDecisionDialog;
