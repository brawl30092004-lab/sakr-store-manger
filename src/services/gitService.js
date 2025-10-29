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
   * Makes an authenticated API request to verify credentials and repository access
   * @returns {Promise<Object>} - Result object with success status and message
   */
  async testConnection() {
    try {
      // Validate config
      if (!this.config.username || !this.config.token || !this.config.repoUrl) {
        return {
          success: false,
          message: 'GitHub configuration is incomplete. Please fill in all fields.'
        };
      }

      // Parse repository URL to extract owner and repo name
      const repoMatch = this.config.repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
      if (!repoMatch) {
        return {
          success: false,
          message: 'Invalid repository URL format. Expected: https://github.com/owner/repo'
        };
      }

      const owner = repoMatch[1];
      const repo = repoMatch[2].replace(/\.git$/, ''); // Remove .git if present

      // Make authenticated API request to GitHub
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Sakr-Store-Manager'
        }
      });

      // Handle different response statuses
      if (response.status === 200) {
        const repoData = await response.json();
        return {
          success: true,
          message: `Connection successful! Repository: ${repoData.full_name}`,
          data: {
            name: repoData.name,
            fullName: repoData.full_name,
            private: repoData.private,
            defaultBranch: repoData.default_branch
          }
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid token. Please check your Personal Access Token.'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'Repository not found. Please check the repository URL or ensure you have access.'
        };
      } else if (response.status === 403) {
        const data = await response.json();
        return {
          success: false,
          message: `Access forbidden: ${data.message || 'You may not have permission to access this repository.'}`
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          message: `GitHub API error (${response.status}): ${data.message || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      
      // Handle network errors
      if (error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error. Please check your internet connection.'
        };
      }
      
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * Gets the current repository status with detailed change information
   * @returns {Promise<Object>} - Git status object with hasChanges flag and file counts
   */
  async getStatus() {
    try {
      const status = await this.git.status();
      
      // Calculate change counts
      const modified = status.modified.length;
      const created = status.created.length;
      const deleted = status.deleted.length;
      const renamed = status.renamed.length;
      const totalChanges = modified + created + deleted + renamed;
      
      return {
        hasChanges: !status.isClean(),
        isClean: status.isClean(),
        modified,
        created,
        deleted,
        renamed,
        totalChanges,
        files: {
          modified: status.modified,
          created: status.created,
          deleted: status.deleted,
          renamed: status.renamed
        },
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind
      };
    } catch (error) {
      console.error('Failed to get repository status:', error);
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
