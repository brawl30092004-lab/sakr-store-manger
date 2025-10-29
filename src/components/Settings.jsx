import React, { useState, useEffect } from 'react';
import './Settings.css';

/**
 * Settings Component - GitHub Integration Configuration
 * Allows users to configure GitHub repository and Personal Access Token
 */
function Settings() {
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
  const [hasExistingToken, setHasExistingToken] = useState(false);

  // Load existing settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

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
    }
  };

  /**
   * Handles input field changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear token indicator if user modifies the token field
    if (name === 'token' && value !== '••••••••') {
      setHasExistingToken(false);
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
    // Validate form data
    if (!formData.repoUrl || !formData.username || !formData.projectPath) {
      setStatus({
        message: 'Please fill in all required fields before testing',
        type: 'error'
      });
      return;
    }

    if (!formData.token && !hasExistingToken) {
      setStatus({
        message: 'Please provide a Personal Access Token',
        type: 'error'
      });
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
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus({
        message: `Connection test failed: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Saves the settings
   */
  const handleSave = async () => {
    // Validate form data
    if (!formData.repoUrl || !formData.username || !formData.projectPath) {
      setStatus({
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    // Check if token is provided or exists
    if (!formData.token && !hasExistingToken) {
      setStatus({
        message: 'Please provide a Personal Access Token',
        type: 'error'
      });
      return;
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

      const result = await window.electron.saveSettings(configToSave);
      
      if (result.success) {
        setStatus({
          message: 'Settings saved successfully!',
          type: 'success'
        });
        
        // If we saved a new token, update the indicator
        if (formData.token !== '••••••••') {
          setHasExistingToken(true);
          setFormData(prev => ({
            ...prev,
            token: '••••••••'
          }));
        }
      } else {
        setStatus({
          message: result.message || 'Failed to save settings',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setStatus({
        message: `Failed to save settings: ${error.message}`,
        type: 'error'
      });
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
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-description">
          Configure your GitHub integration for product data synchronization
        </p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>GitHub Configuration</h2>
          
          <div className="form-group">
            <label htmlFor="repoUrl">
              Repository URL <span className="required">*</span>
            </label>
            <input
              type="text"
              id="repoUrl"
              name="repoUrl"
              value={formData.repoUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repository"
              className="form-input"
            />
            <small className="form-hint">
              Example: https://github.com/yourusername/sakr-store-data
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="username">
              GitHub Username <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your GitHub username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">
              Personal Access Token (PAT) <span className="required">*</span>
            </label>
            <input
              type="password"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="Enter your GitHub PAT"
              className="form-input"
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
              Select the folder containing your local Git repository
            </small>
          </div>
        </div>

        {status.message && (
          <div className={`status-message status-${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="settings-actions">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isLoading}
            className="btn btn-test"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isTesting}
            className="btn btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || isTesting}
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
