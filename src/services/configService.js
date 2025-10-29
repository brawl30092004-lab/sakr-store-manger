import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { encryptToken, decryptToken } from '../utils/encryption.js';

/**
 * ConfigService - Manages application configuration storage
 * Stores settings in the user data directory with encrypted sensitive data
 */
class ConfigService {
  constructor() {
    // Get the app's user data directory
    // On Windows: %APPDATA%\SakrStoreManager
    // On macOS: ~/Library/Application Support/SakrStoreManager
    // On Linux: ~/.config/SakrStoreManager
    this.userDataPath = app.getPath('userData');
    this.configFilePath = join(this.userDataPath, 'config.json');
    
    // Ensure the user data directory exists
    this.ensureUserDataDirectory();
  }

  /**
   * Ensures the user data directory exists
   */
  ensureUserDataDirectory() {
    if (!existsSync(this.userDataPath)) {
      mkdirSync(this.userDataPath, { recursive: true });
      console.log('Created user data directory:', this.userDataPath);
    }
  }

  /**
   * Saves configuration to disk
   * @param {Object} config - Configuration object
   * @param {string} config.repoUrl - GitHub repository URL
   * @param {string} config.username - GitHub username
   * @param {string} config.token - GitHub Personal Access Token (will be encrypted)
   * @param {string} config.projectPath - Local project path
   * @returns {boolean} - True if save was successful
   */
  saveConfig(config) {
    try {
      // Validate required fields
      if (!config) {
        throw new Error('Configuration object is required');
      }

      // Create a copy to avoid mutating the original
      const configToSave = { ...config };

      // Encrypt the token if it exists and is not already encrypted
      if (configToSave.token) {
        configToSave.encryptedToken = encryptToken(configToSave.token);
        // Remove the plain text token
        delete configToSave.token;
      }

      // Add metadata
      configToSave.lastUpdated = new Date().toISOString();
      configToSave.version = '1.0';

      // Write to file with pretty formatting
      writeFileSync(
        this.configFilePath,
        JSON.stringify(configToSave, null, 2),
        'utf8'
      );

      console.log('Configuration saved successfully to:', this.configFilePath);
      return true;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  /**
   * Loads configuration from disk
   * @param {boolean} decryptTokens - Whether to decrypt the token (default: false)
   * @returns {Object|null} - Configuration object or null if not found
   */
  loadConfig(decryptTokens = false) {
    try {
      // Check if config file exists
      if (!existsSync(this.configFilePath)) {
        // Config file doesn't exist yet - this is normal on first run
        return null;
      }

      // Read and parse the config file
      const configData = readFileSync(this.configFilePath, 'utf8');
      const config = JSON.parse(configData);

      // Decrypt the token if requested
      if (decryptTokens && config.encryptedToken) {
        try {
          config.token = decryptToken(config.encryptedToken);
        } catch (error) {
          console.error('Failed to decrypt token:', error);
          // Keep the encrypted token but don't expose it
          config.token = null;
        }
      }

      // Remove the encrypted token from the returned object for security
      // unless explicitly keeping it for save operations
      if (!decryptTokens) {
        delete config.encryptedToken;
      }

      console.log('Configuration loaded successfully');
      return config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return null;
    }
  }

  /**
   * Gets the configuration with decrypted token
   * @returns {Object|null} - Configuration with decrypted token
   */
  getConfigWithToken() {
    return this.loadConfig(true);
  }

  /**
   * Gets the configuration without the token (for display purposes)
   * @returns {Object|null} - Configuration without token
   */
  getConfigForDisplay() {
    const config = this.loadConfig(false);
    if (config) {
      // Return config with masked token indicator
      return {
        ...config,
        hasToken: !!config.encryptedToken,
        token: config.encryptedToken ? '••••••••' : ''
      };
    }
    return null;
  }

  /**
   * Checks if configuration exists
   * @returns {boolean} - True if config file exists
   */
  hasConfig() {
    return existsSync(this.configFilePath);
  }

  /**
   * Deletes the configuration file
   * @returns {boolean} - True if deletion was successful
   */
  deleteConfig() {
    try {
      if (existsSync(this.configFilePath)) {
        const fs = require('fs');
        fs.unlinkSync(this.configFilePath);
        console.log('Configuration deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      throw new Error(`Failed to delete configuration: ${error.message}`);
    }
  }

  /**
   * Updates specific configuration fields
   * @param {Object} updates - Fields to update
   * @returns {boolean} - True if update was successful
   */
  updateConfig(updates) {
    try {
      // Load existing config with encrypted token
      const existingConfig = this.loadConfig(false);
      
      // Merge with updates
      const updatedConfig = {
        ...existingConfig,
        ...updates
      };

      // If token is being updated, it will be encrypted in saveConfig
      // If encryptedToken exists in current config and no new token, preserve it
      if (!updates.token && existingConfig && existingConfig.encryptedToken) {
        updatedConfig.encryptedToken = existingConfig.encryptedToken;
      }

      // Save the updated config
      return this.saveConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to update configuration:', error);
      throw new Error(`Failed to update configuration: ${error.message}`);
    }
  }

  /**
   * Gets the path to the config file
   * @returns {string} - Path to config.json
   */
  getConfigPath() {
    return this.configFilePath;
  }

  /**
   * Gets the user data directory path
   * @returns {string} - Path to user data directory
   */
  getUserDataPath() {
    return this.userDataPath;
  }
}

// Export a singleton instance
let configServiceInstance = null;

export function getConfigService() {
  if (!configServiceInstance) {
    configServiceInstance = new ConfigService();
  }
  return configServiceInstance;
}

export default ConfigService;
