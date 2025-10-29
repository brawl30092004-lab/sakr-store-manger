import simpleGit from 'simple-git';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * GitService - Handles Git operations and GitHub integration
 */
class GitService {
  /**
   * Creates a new GitService instance
   * @param {string} projectPath - Path to the local git repository
   * @param {Object} config - GitHub configuration
   * @param {string} config.username - GitHub username
   * @param {string} config.token - GitHub Personal Access Token (decrypted)
   * @param {string} config.repoUrl - GitHub repository URL
   */
  constructor(projectPath, config = {}) {
    this.projectPath = projectPath;
    this.config = {
      username: config.username || '',
      token: config.token || '',
      repoUrl: config.repoUrl || ''
    };
    
    // Initialize simple-git with the project path
    this.git = simpleGit(projectPath);
  }

  /**
   * Checks if the specified directory is a valid Git repository
   * @returns {Promise<boolean>} - True if directory is a git repository
   */
  async isRepository() {
    try {
      // Check if .git directory exists
      const gitDir = join(this.projectPath, '.git');
      if (!existsSync(gitDir)) {
        return false;
      }

      // Verify by running git status
      await this.git.status();
      return true;
    } catch (error) {
      console.error('Git repository check failed:', error.message);
      return false;
    }
  }

  /**
   * Tests the connection to the GitHub repository
   * @returns {Promise<Object>} - Result object with success status and message
   */
  async testConnection() {
    try {
      // First check if it's a valid git repository
      const isRepo = await this.isRepository();
      if (!isRepo) {
        return {
          success: false,
          message: 'Not a valid Git repository. Please select a valid Git project folder.'
        };
      }

      // Validate config
      if (!this.config.username || !this.config.token || !this.config.repoUrl) {
        return {
          success: false,
          message: 'GitHub configuration is incomplete. Please fill in all fields.'
        };
      }

      // Check remote configuration
      const remotes = await this.git.getRemotes(true);
      
      if (remotes.length === 0) {
        return {
          success: false,
          message: 'No remote repository configured. Please add a remote first.'
        };
      }

      // Try to fetch from remote (lightweight test)
      // This will verify credentials without pulling data
      await this.git.fetch(['--dry-run']);

      return {
        success: true,
        message: 'Successfully connected to GitHub repository!'
      };
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      
      // Parse error message for user-friendly feedback
      if (error.message.includes('Authentication failed')) {
        return {
          success: false,
          message: 'Authentication failed. Please check your Personal Access Token.'
        };
      } else if (error.message.includes('Repository not found')) {
        return {
          success: false,
          message: 'Repository not found. Please check the repository URL.'
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${error.message}`
        };
      }
    }
  }

  /**
   * Gets the current repository status
   * @returns {Promise<Object>} - Git status object
   */
  async getStatus() {
    try {
      return await this.git.status();
    } catch (error) {
      throw new Error(`Failed to get repository status: ${error.message}`);
    }
  }

  /**
   * Gets the list of remote repositories
   * @returns {Promise<Array>} - Array of remote objects
   */
  async getRemotes() {
    try {
      return await this.git.getRemotes(true);
    } catch (error) {
      throw new Error(`Failed to get remotes: ${error.message}`);
    }
  }

  /**
   * Initializes a new Git repository
   * @returns {Promise<void>}
   */
  async init() {
    try {
      await this.git.init();
    } catch (error) {
      throw new Error(`Failed to initialize repository: ${error.message}`);
    }
  }

  /**
   * Adds a remote repository
   * @param {string} name - Remote name (e.g., 'origin')
   * @param {string} url - Remote URL
   * @returns {Promise<void>}
   */
  async addRemote(name, url) {
    try {
      await this.git.addRemote(name, url);
    } catch (error) {
      throw new Error(`Failed to add remote: ${error.message}`);
    }
  }

  /**
   * Commits changes to the repository
   * @param {string} message - Commit message
   * @returns {Promise<Object>} - Commit result
   */
  async commit(message) {
    try {
      return await this.git.commit(message);
    } catch (error) {
      throw new Error(`Failed to commit: ${error.message}`);
    }
  }

  /**
   * Pushes changes to the remote repository
   * @param {string} remote - Remote name (default: 'origin')
   * @param {string} branch - Branch name (default: current branch)
   * @returns {Promise<Object>} - Push result
   */
  async push(remote = 'origin', branch = null) {
    try {
      if (branch) {
        return await this.git.push(remote, branch);
      }
      return await this.git.push();
    } catch (error) {
      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  /**
   * Pulls changes from the remote repository
   * @param {string} remote - Remote name (default: 'origin')
   * @param {string} branch - Branch name (default: current branch)
   * @returns {Promise<Object>} - Pull result
   */
  async pull(remote = 'origin', branch = null) {
    try {
      if (branch) {
        return await this.git.pull(remote, branch);
      }
      return await this.git.pull();
    } catch (error) {
      throw new Error(`Failed to pull: ${error.message}`);
    }
  }
}

export default GitService;
