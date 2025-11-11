import React from 'react';
import './SetupProgress.css';

/**
 * Progress stage configurations
 */
const stageConfigs = {
  checking: {
    icon: '🔍',
    title: 'Checking Your Setup',
    steps: [
      { id: 'folder', label: 'Checking folder' },
      { id: 'files', label: 'Verifying files' },
      { id: 'connection', label: 'Checking GitHub connection' }
    ]
  },
  downloading: {
    icon: '📥',
    title: 'Downloading from GitHub',
    description: 'This will download:',
    items: [
      'products.json (your product data)',
      'images folder (product photos)',
      'Connection files (for syncing)'
    ],
    steps: [
      { id: 'connecting', label: 'Connecting to GitHub' },
      { id: 'downloading', label: 'Downloading files' },
      { id: 'organizing', label: 'Organizing files' }
    ]
  },
  restoring: {
    icon: '🔄',
    title: 'Restoring Missing Files',
    steps: [
      { id: 'checking', label: 'Checking what\'s missing' },
      { id: 'downloading', label: 'Downloading from GitHub' },
      { id: 'complete', label: 'Files restored' }
    ]
  },
  cloning: {
    icon: '📦',
    title: 'Setting Up Repository',
    steps: [
      { id: 'preparing', label: 'Preparing folder' },
      { id: 'cloning', label: 'Downloading repository' },
      { id: 'finalizing', label: 'Finalizing setup' }
    ]
  },
  validating: {
    icon: '✓',
    title: 'Validating Repository',
    steps: [
      { id: 'checking-files', label: 'Checking files' },
      { id: 'checking-remote', label: 'Verifying GitHub connection' },
      { id: 'complete', label: 'Validation complete' }
    ]
  },
  syncing: {
    icon: '🔄',
    title: 'Syncing with GitHub',
    steps: [
      { id: 'fetching', label: 'Checking for updates' },
      { id: 'pulling', label: 'Downloading changes' },
      { id: 'complete', label: 'Sync complete' }
    ]
  }
};

/**
 * SetupProgress Component
 * 
 * Shows user-friendly progress indicator for various setup operations
 * with clear, non-technical language.
 * 
 * @param {string} stage - Current stage (checking, downloading, restoring, etc.)
 * @param {string} currentStep - Current step ID within the stage
 * @param {array} completedSteps - Array of completed step IDs
 * @param {string} message - Additional message to display
 * @param {number} progress - Optional progress percentage (0-100)
 * @param {boolean} isVisible - Whether to show the progress indicator
 */
const SetupProgress = ({ 
  stage, 
  currentStep, 
  completedSteps = [], 
  message, 
  progress,
  isVisible = true 
}) => {
  if (!isVisible) return null;

  const config = stageConfigs[stage];
  if (!config) {
    console.error('Unknown progress stage:', stage);
    return null;
  }

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'complete';
    if (currentStep === stepId) return 'active';
    return 'pending';
  };

  return (
    <div className="setup-progress-overlay">
      <div className="setup-progress-container">
        <div className="progress-icon">{config.icon}</div>
        <h3 className="progress-title">{config.title}</h3>
        
        {config.description && (
          <div className="progress-description">
            <p>{config.description}</p>
            {config.items && (
              <ul className="progress-items">
                {config.items.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        <div className="progress-steps">
          {config.steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div 
                key={step.id}
                className={`progress-step ${status}`}
              >
                <div className="step-indicator">
                  {status === 'complete' ? (
                    <span className="step-checkmark">✓</span>
                  ) : status === 'active' ? (
                    <span className="step-spinner"></span>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            );
          })}
        </div>
        
        {progress !== undefined && (
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
            <div className="progress-percentage">{Math.round(progress)}%</div>
          </div>
        )}
        
        {message && (
          <div className="progress-message">{message}</div>
        )}
      </div>
    </div>
  );
};

export default SetupProgress;
