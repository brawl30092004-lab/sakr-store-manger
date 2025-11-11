import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProjectPath } from '../store/slices/settingsSlice';
import { showSuccess, showError, showInfo, showWarning, ToastMessages } from '../services/toastService';
import DataSourceSelector from './DataSourceSelector';
import GitInstallDialog from './GitInstallDialog';
import UserDecisionDialog from './UserDecisionDialog';
import SetupProgress from './SetupProgress';
import './Settings.css';

/**
 * Settings Component - GitHub Integration Configuration
 * Allows users to configure GitHub repository and Personal Access Token
 */
function Settings({ onBackToMain }) {
  const dispatch = useDispatch();
  // Get current data source from Redux
  const dataSource = useSelector((state) => state.settings.dataSource);
  
  // Ref for scrolling to top
  const containerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    repoUrl: '',
    username: '',
    token: '',
    projectPath: ''
  });

  const [status, setStatus] = useState({
    message: '',
    type: '' // 'success', 'error', 'info'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [hasExistingToken, setHasExistingToken] = useState(false);
  const [isGitInstalled, setIsGitInstalled] = useState(null); // null = not checked, true = installed, false = not installed
  const [showGitInstallDialog, setShowGitInstallDialog] = useState(false);
  const [gitVersion, setGitVersion] = useState(null);
  
  // New state for user-friendly dialogs and progress
  const [forceClone, setForceClone] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false, type: null, data: null });
  const [progressState, setProgressState] = useState({ 
    isVisible: false, 
    stage: 'checking', 
    currentStep: null, 
    completedSteps: [], 
    message: '' 
  });

  // Scroll to top on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  // Load existing settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check Git installation when switching to GitHub mode
  useEffect(() => {
    if (dataSource === 'github') {
      checkGitInstallation();
      // Scroll to top when switching to GitHub mode to show any notices
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [dataSource]);

  // Scroll to top when Git installation status changes
  useEffect(() => {
    if (isGitInstalled !== null && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [isGitInstalled]);

  /**
   * Checks if Git is installed on the system
   */
  const checkGitInstallation = async () => {
    try {
      const result = await window.electron.checkGitInstallation();
      
      // Log debug info if available
      if (result.debugLogs) {
        console.log('=== GIT DETECTION DEBUG LOGS ===');
        result.debugLogs.forEach(log => console.log(log));
        console.log('=== END DEBUG LOGS ===');
      }
      
      // Log the full result
      console.log('Full Git detection result:', result);
      
      setIsGitInstalled(result.installed);
      setGitVersion(result.version);
      
      if (!result.installed) {
        // Git is not installed, show warning but don't block
        setStatus({
          message: 'Warning: Git not detected. GitHub features may not work properly.',
          type: 'warning'
        });
        console.warn('Git is not installed. GitHub features may not work properly.');
        
        // Show detailed debug info
        if (result.debugLogs) {
          console.error('Git detection failed. Debug info:', {
            gitPathFromFind: result.gitPathFromFind,
            error: result.error,
            message: result.message
          });
        }
      } else {
        // Git is installed
        console.log('Git is installed:', result.version);
        setStatus({
          message: `Git detected (version ${result.version})`,
          type: 'success'
        });
      }
      
      return result.installed;
    } catch (error) {
      console.error('Failed to check Git installation:', error);
      setIsGitInstalled(false);
      setStatus({
        message: 'Warning: Unable to verify Git installation. GitHub features may not work.',
        type: 'warning'
      });
      return false;
    }
  };

  /**
   * Loads settings from the config file
   */
  const loadSettings = async () => {
    try {
      const config = await window.electron.loadSettings();
      
      if (config) {
        setFormData({
          repoUrl: config.repoUrl || '',
          username: config.username || '',
          token: config.hasToken ? '••••••••' : '',
          projectPath: config.projectPath || ''
        });
        setHasExistingToken(config.hasToken);
        setStatus({
          message: 'Settings loaded successfully',
          type: 'info'
        });
        showInfo(ToastMessages.SETTINGS_LOADED);
      } else {
        setStatus({
          message: 'No existing settings found',
          type: 'info'
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setStatus({
        message: `Failed to load settings: ${error.message}`,
        type: 'error'
      });
      showError(error);
    }
  };

  /**
   * Handles input field changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent spaces in username field
    if (name === 'username') {
      const sanitizedValue = value.replace(/\s/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear token indicator if user actively changes the token field
    // (not just clicking in it or when it's being set to masked value)
    if (name === 'token' && value !== '••••••••' && value !== '') {
      setHasExistingToken(false);
    }
  };

  /**
   * Handle focus on token field - select all if masked
   */
  const handleTokenFocus = (e) => {
    if (formData.token === '••••••••') {
      e.target.select();
    }
  };

  /**
   * Opens directory browser dialog
   */
  const handleBrowse = async () => {
    try {
      const selectedPath = await window.electron.browseDirectory();
      if (selectedPath) {
        setFormData(prev => ({
          ...prev,
          projectPath: selectedPath
        }));
      }
    } catch (error) {
      console.error('Failed to browse directory:', error);
      setStatus({
        message: `Failed to browse directory: ${error.message}`,
        type: 'error'
      });
    }
  };

  /**
   * Tests the GitHub connection
   */
  const handleTestConnection = async () => {
    // Only allow testing in GitHub mode
    if (dataSource !== 'github') {
      const message = 'Connection test is only available for GitHub mode';
      setStatus({
        message,
        type: 'info'
      });
      showInfo(message);
      return;
    }

    // Warn if Git is not installed but don't block
    if (isGitInstalled === false) {
      showWarning('Warning: Git not detected. Connection test may fail if Git is required.');
    }

    // Validate form data
    if (!formData.repoUrl || !formData.username || !formData.projectPath) {
      const message = 'Please fill in all required fields before testing';
      setStatus({
        message,
        type: 'error'
      });
      showError(message);
      return;
    }

    if (!formData.token && !hasExistingToken) {
      const message = 'Please provide a Personal Access Token';
      setStatus({
        message,
        type: 'error'
      });
      showError(message);
      return;
    }

    setIsTesting(true);
    setStatus({ message: 'Testing connection...', type: 'info' });

    try {
      // Prepare config for testing
      const configToTest = {
        ...formData,
        // If token is masked and we have existing token, don't send it
        // The backend will use the stored encrypted token
        token: formData.token === '••••••••' ? null : formData.token
      };

      const result = await window.electron.testConnection(configToTest);
      
      setStatus({
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
      
      if (result.success) {
        showSuccess(ToastMessages.GITHUB_CONNECTED);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus({
        message: `Connection test failed: ${error.message}`,
        type: 'error'
      });
      showError(error);
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Handles GitHub repository setup (cloning or validation)
   * Called when saving settings in GitHub mode
   */
  const handleGitHubSetup = async (configToSave) => {
    try {
      // User forced fresh clone - skip all validation
      if (forceClone) {
        showInfo('Starting fresh - will delete and re-download repository...');
        setProgressState({
          isVisible: true,
          stage: 'cloning',
          currentStep: 'preparing',
          completedSteps: [],
          message: 'Preparing folder...'
        });
        
        // Empty the directory first
        await window.electron.fs.emptyDirectory(configToSave.projectPath);
        
        setProgressState(prev => ({
          ...prev,
          currentStep: 'cloning',
          completedSteps: ['preparing'],
          message: 'Downloading repository from GitHub...'
        }));
        
        const tokenToUse = (formData.token && formData.token !== '••••••••') ? formData.token : null;
        const cloneResult = await window.electron.cloneRepository(
          configToSave.projectPath,
          configToSave.repoUrl,
          configToSave.username,
          tokenToUse
        );
        
        if (!cloneResult.success) {
          throw new Error(cloneResult.message || 'Failed to clone repository');
        }
        
        setProgressState(prev => ({
          ...prev,
          currentStep: 'finalizing',
          completedSteps: ['preparing', 'cloning'],
          message: 'Finalizing setup...'
        }));
        
        setTimeout(() => {
          setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
          showSuccess('Repository downloaded successfully!');
        }, 500);
        
        return { success: true, cloned: true };
      }
      
      // Normal flow - validate existing repository
      setProgressState({
        isVisible: true,
        stage: 'validating',
        currentStep: 'checking-files',
        completedSteps: [],
        message: 'Checking folder...'
      });
      
      const pathCheck = await window.electron.fs.checkProjectPath(configToSave.projectPath);
      
      // Path exists with .git folder - validate it
      if (pathCheck.exists && pathCheck.hasGitRepo) {
        console.log('Repository found at:', configToSave.projectPath);
        
        // Step 1: Check if required files exist
        const integrity = await window.electron.validateRepoIntegrity(configToSave.projectPath);
        
        setProgressState(prev => ({
          ...prev,
          currentStep: 'checking-remote',
          completedSteps: ['checking-files'],
          message: 'Verifying GitHub connection...'
        }));
        
        if (!integrity.hasRequiredFiles) {
          // Files are missing - ask user what to do
          setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
          
          const choice = await new Promise((resolve) => {
            setDialogState({
              isOpen: true,
              type: 'missingFiles',
              data: integrity.missingFiles,
              onChoice: (choice) => {
                setDialogState({ isOpen: false, type: null, data: null });
                resolve(choice);
              }
            });
          });
          
          if (choice === 'restore') {
            // Restore from GitHub
            setProgressState({
              isVisible: true,
              stage: 'restoring',
              currentStep: 'checking',
              completedSteps: [],
              message: 'Checking what\'s missing...'
            });
            
            showInfo('Restoring missing files from GitHub...');
            const restored = await window.electron.resetRepoToRemote(configToSave.projectPath);
            
            if (!restored.success) {
              throw new Error('Failed to restore repository: ' + restored.message);
            }
            
            setProgressState(prev => ({
              ...prev,
              currentStep: 'complete',
              completedSteps: ['checking', 'downloading'],
              message: 'Files restored successfully'
            }));
            
            setTimeout(() => {
              setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
              showSuccess('Files restored from GitHub ✓');
            }, 1000);
            
          } else if (choice === 'fresh') {
            // Start completely fresh
            return await handleGitHubSetup({ ...configToSave, _forceFresh: true });
          } else {
            // User cancelled
            setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
            return { success: false, cancelled: true };
          }
        }
        
        // Step 2: Validate remote URL matches
        const remoteCheck = await window.electron.validateGitRemote(
          configToSave.projectPath,
          configToSave.repoUrl
        );
        
        setProgressState(prev => ({
          ...prev,
          currentStep: 'complete',
          completedSteps: ['checking-files', 'checking-remote'],
          message: 'Validation complete'
        }));
        
        if (remoteCheck.matches) {
          // Everything is good!
          setTimeout(() => {
            setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
            showSuccess('Repository validated ✓');
          }, 500);
          return { success: true, alreadyExists: true };
        } else {
          // Remote URL mismatch - ask user
          setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
          
          const choice = await new Promise((resolve) => {
            setDialogState({
              isOpen: true,
              type: 'repoMismatch',
              data: [remoteCheck.currentUrl, configToSave.repoUrl],
              onChoice: (choice) => {
                setDialogState({ isOpen: false, type: null, data: null });
                resolve(choice);
              }
            });
          });
          
          if (choice === 'switch') {
            // Update remote URL
            showInfo('Updating GitHub connection...');
            await window.electron.updateGitRemote(configToSave.projectPath, configToSave.repoUrl);
            showSuccess('Remote URL updated ✓');
            return { success: true };
          } else if (choice === 'reclone') {
            // Delete and re-clone
            await window.electron.fs.emptyDirectory(configToSave.projectPath);
            // Fall through to clone logic below
          } else {
            // User cancelled
            return { success: false, cancelled: true };
          }
        }
      }
      
      // New path or user chose re-clone - proceed with cloning
      setProgressState({
        isVisible: true,
        stage: 'downloading',
        currentStep: 'connecting',
        completedSteps: [],
        message: 'Connecting to GitHub...'
      });
      
      showInfo('Downloading repository from GitHub...');
      
      const tokenToUse = (formData.token && formData.token !== '••••••••') ? formData.token : null;
      
      setProgressState(prev => ({
        ...prev,
        currentStep: 'downloading',
        completedSteps: ['connecting'],
        message: 'Downloading files...'
      }));
      
      const cloneResult = await window.electron.cloneRepository(
        configToSave.projectPath,
        configToSave.repoUrl,
        configToSave.username,
        tokenToUse
      );
      
      if (!cloneResult.success) {
        throw new Error(cloneResult.message || 'Failed to clone repository');
      }
      
      setProgressState(prev => ({
        ...prev,
        currentStep: 'organizing',
        completedSteps: ['connecting', 'downloading'],
        message: 'Organizing files...'
      }));
      
      setTimeout(() => {
        setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
        showSuccess('Repository downloaded successfully!');
      }, 500);
      
      return { success: true, cloned: true };
      
    } catch (error) {
      console.error('GitHub setup failed:', error);
      setProgressState({ isVisible: false, stage: 'checking', currentStep: null, completedSteps: [], message: '' });
      setStatus({
        message: `GitHub setup failed: ${error.message}`,
        type: 'error'
      });
      showError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Saves the settings
   */
  const handleSave = async () => {
    // For GitHub mode, warn if Git is not installed but don't block
    if (dataSource === 'github' && isGitInstalled === false) {
      showWarning('Warning: Git not detected. GitHub features may not work properly without Git installed.');
    }

    // For local mode, only projectPath is required
    // For GitHub mode, all fields are required
    if (dataSource === 'local') {
      // Local mode: only validate projectPath
      if (!formData.projectPath) {
        const message = 'Please select a project path';
        setStatus({
          message,
          type: 'error'
        });
        showError(message);
        return;
      }
    } else {
      // GitHub mode: validate all fields
      if (!formData.repoUrl || !formData.username || !formData.projectPath) {
        const message = 'Please fill in all required fields';
        setStatus({
          message,
          type: 'error'
        });
        showError(message);
        return;
      }

      // Check if token is provided or exists
      if (!formData.token && !hasExistingToken) {
        const message = 'Please provide a Personal Access Token';
        setStatus({
          message,
          type: 'error'
        });
        showError(message);
        return;
      }
    }

    setIsLoading(true);
    setStatus({ message: 'Saving settings...', type: 'info' });

    try {
      // Prepare config to save
      const configToSave = {
        repoUrl: formData.repoUrl.trim(),
        username: formData.username.trim(),
        projectPath: formData.projectPath.trim(),
        // Only include token if it's not the masked version
        ...(formData.token !== '••••••••' && { token: formData.token })
      };

      // If GitHub mode, handle repository setup first
      if (dataSource === 'github') {
        const setupResult = await handleGitHubSetup(configToSave);
        if (!setupResult.success) {
          setIsLoading(false);
          return; // Setup failed, don't save settings
        }
      }

      const result = await window.electron.saveSettings(configToSave);
      
      if (result.success) {
        // Update Redux store with the new project path
        dispatch(setProjectPath(configToSave.projectPath));
        
        setStatus({
          message: 'Settings saved successfully!',
          type: 'success'
        });
        showSuccess(ToastMessages.SETTINGS_SAVED);
        
        // If we saved a new token, update the indicator
        if (formData.token !== '••••••••') {
          setHasExistingToken(true);
          setFormData(prev => ({
            ...prev,
            token: '••••••••'
          }));
        }
        
        // If GitHub mode and we just cloned/setup, go back to main after a delay
        if (dataSource === 'github') {
          setTimeout(() => {
            onBackToMain();
          }, 1500); // Give user time to see the success message
        }
      } else {
        setStatus({
          message: result.message || 'Failed to save settings',
          type: 'error'
        });
        showError(result.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setStatus({
        message: `Failed to save settings: ${error.message}`,
        type: 'error'
      });
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the form
   */
  const handleClear = () => {
    setFormData({
      repoUrl: '',
      username: '',
      token: '',
      projectPath: ''
    });
    setHasExistingToken(false);
    setStatus({ message: 'Form cleared', type: 'info' });
  };

  return (
    <div className="settings-container" ref={containerRef}>
      {/* User Decision Dialog */}
      <UserDecisionDialog 
        type={dialogState.type}
        data={dialogState.data}
        onChoice={dialogState.onChoice}
        isOpen={dialogState.isOpen}
      />
      
      {/* Setup Progress Indicator */}
      <SetupProgress 
        stage={progressState.stage}
        currentStep={progressState.currentStep}
        completedSteps={progressState.completedSteps}
        message={progressState.message}
        isVisible={progressState.isVisible}
      />
      
      {/* Git Installation Dialog */}
      <GitInstallDialog 
        isOpen={showGitInstallDialog}
        onClose={() => setShowGitInstallDialog(false)}
      />

      <div className="settings-header">
        <div className="settings-header-content">
          <div>
            <h1>Settings</h1>
            <p className="settings-description">
              Configure your data source and GitHub integration for product data synchronization
            </p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* Data Source Selector */}
        <DataSourceSelector />

        {/* Git Installation Status - Only show in GitHub mode */}
        {dataSource === 'github' && isGitInstalled !== null && (
          <div className={`git-status ${isGitInstalled ? 'git-installed' : 'git-warning'}`}>
            <div className="git-status-content">
              <div className="git-status-title">
                <span className="git-status-icon">
                  {isGitInstalled ? '✓' : '⚠'}
                </span>
                {isGitInstalled ? 'Git Detected' : 'Git Not Detected'}
              </div>
              <p className="git-status-message">
                {isGitInstalled 
                  ? `Version ${gitVersion} - Ready to use GitHub features`
                  : 'Warning: Git not detected. You can still try GitHub features, but they may not work without Git installed.'
                }
              </p>
            </div>
            {!isGitInstalled && (
              <div className="git-status-action">
                <button
                  onClick={() => setShowGitInstallDialog(true)}
                  className="git-install-btn"
                >
                  Install Git
                </button>
              </div>
            )}
          </div>
        )}


        {dataSource === 'github' && !formData.repoUrl && (
          <div className="github-setup-notice">
            <h3 className="github-setup-title">
              <span className="github-setup-icon">🚀</span>
              GitHub Mode Setup Required
            </h3>
            <p>To use GitHub mode, you need to:</p>
            <ol className="github-setup-steps">
              <li>Enter your GitHub repository URL</li>
              <li>Enter your GitHub username</li>
              <li>Create and enter a Personal Access Token with 'repo' permissions</li>
              <li>Select a local folder where the repository will be cloned</li>
              <li>Click "Save Settings" to clone the repository and start working</li>
            </ol>
          </div>
        )}

        <div className="settings-section">
          <h2>GitHub Configuration</h2>
          
          {dataSource === 'local' && (
            <div className="info-message">
              <strong>Note:</strong> GitHub settings are optional when using Local Files mode. 
              You only need to configure the Local Project Path below.
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="repoUrl">
              Repository URL {dataSource === 'github' && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id="repoUrl"
              name="repoUrl"
              value={formData.repoUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repository"
              className="form-input"
              disabled={dataSource === 'local'}
            />
            <small className="form-hint">
              Example: https://github.com/yourusername/sakr-store-data
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="username">
              GitHub Username {dataSource === 'github' && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your GitHub username"
              className="form-input"
              disabled={dataSource === 'local'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">
              Personal Access Token (PAT) {dataSource === 'github' && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              onFocus={handleTokenFocus}
              placeholder="Enter your GitHub PAT"
              className="form-input"
              disabled={dataSource === 'local'}
            />
            <small className="form-hint">
              Create a token with 'repo' permissions at{' '}
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                github.com/settings/tokens
              </a>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="projectPath">
              Local Project Path <span className="required">*</span>
            </label>
            <div className="input-with-button">
              <input
                type="text"
                id="projectPath"
                name="projectPath"
                value={formData.projectPath}
                onChange={handleInputChange}
                placeholder="Select your local git repository folder"
                className="form-input"
                readOnly
              />
              <button
                type="button"
                onClick={handleBrowse}
                className="btn btn-secondary"
              >
                Browse
              </button>
            </div>
            <small className="form-hint">
              {dataSource === 'github' 
                ? 'Select an empty folder or a folder that already contains your cloned repository. The repository will be cloned here on first setup.'
                : 'Select the folder containing your products.json file'
              }
            </small>
          </div>
        </div>

        {dataSource === 'github' && (
          <div className="advanced-options">
            <h3>Advanced Options</h3>
            <div className="force-clone-option">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={forceClone}
                  onChange={(e) => setForceClone(e.target.checked)}
                  disabled={isLoading || isTesting || isCloning}
                />
                <span className="checkbox-text">
                  <strong>Start Fresh (Force Re-download)</strong>
                  <small>
                    Check this to delete everything and download the repository again from scratch.
                    <br />
                    Use this when:
                    • Something seems broken
                    • Files are corrupted
                    • You want a clean start
                    <br />
                    <em>⚠️ All local files will be deleted</em>
                  </small>
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="settings-actions">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isLoading || isCloning || dataSource === 'local'}
            className="btn btn-test"
            title={dataSource === 'local' ? 'Connection test is only available for GitHub mode' : ''}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isTesting || isCloning}
            className="btn btn-primary"
          >
            {isCloning ? 'Cloning Repository...' : isLoading ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || isTesting || isCloning}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
