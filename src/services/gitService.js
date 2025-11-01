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
   * Clones a repository from GitHub to a local directory
   * @param {string} targetPath - Path where the repository should be cloned
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} username - GitHub username
   * @param {string} token - GitHub Personal Access Token
   * @returns {Promise<Object>} - Result object with success status
   */
  static async cloneRepository(targetPath, repoUrl, username, token) {
    try {
      const fs = await import('fs-extra');
      const path = await import('path');
      
      // Parse repository URL to extract owner and repo
      const repoMatch = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
      if (!repoMatch) {
        return {
          success: false,
          message: 'Invalid repository URL format. Expected: https://github.com/owner/repo'
        };
      }

      const owner = repoMatch[1];
      const repo = repoMatch[2].replace(/\.git$/, '');

      // Create authenticated URL for cloning
      const authenticatedUrl = `https://${username}:${token}@github.com/${owner}/${repo}.git`;

      console.log(`Cloning repository to: ${targetPath}`);

      // Check if target path exists
      const pathExists = await fs.pathExists(targetPath);
      
      if (pathExists) {
        // Check if directory is empty
        const files = await fs.readdir(targetPath);
        if (files.length === 0) {
          // Directory exists but is empty - use init + remote + pull approach
          console.log('Directory exists but is empty, using init + pull approach');
          
          const git = simpleGit(targetPath);
          
          // Initialize repository
          await git.init();
          
          // Add remote
          await git.addRemote('origin', authenticatedUrl);
          
          // Fetch all branches
          await git.fetch('origin');
          
          // Checkout main/master branch
          try {
            await git.checkout('main');
          } catch (e) {
            // Try master if main doesn't exist
            try {
              await git.checkout('master');
            } catch (e2) {
              // Try to checkout the default branch
              await git.checkout('-b', 'main', 'origin/main');
            }
          }
          
          // Pull latest changes
          await git.pull('origin', 'main').catch(() => git.pull('origin', 'master'));
          
        } else {
          // Directory exists and has files
          return {
            success: false,
            message: 'Directory is not empty. Please choose an empty directory.'
          };
        }
      } else {
        // Directory doesn't exist - use normal clone
        await simpleGit().clone(authenticatedUrl, targetPath);
      }

      console.log('Repository cloned successfully');

      return {
        success: true,
        message: `Repository cloned successfully to ${targetPath}`,
        path: targetPath
      };
    } catch (error) {
      console.error('Failed to clone repository:', error);
      return {
        success: false,
        message: `Failed to clone repository: ${error.message}`,
        error: error.message
      };
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

  /**
   * Pulls the latest changes from the remote repository
   * Executes fetch and pull to ensure we're up-to-date before committing
   * @param {string} branch - Branch name (defaults to current branch)
   * @returns {Promise<Object>} - Result object with success status and details
   */
  async pullLatestChanges(branch = null) {
    try {
      // Get current branch if not specified
      if (!branch) {
        const status = await this.git.status();
        branch = status.current;
      }

      console.log(`Pulling latest changes from origin/${branch}...`);

      // Fetch latest changes from remote
      await this.git.fetch('origin');

      // Pull changes from the specified branch
      const pullResult = await this.git.pull('origin', branch);

      // Check for conflicts
      if (pullResult.summary.conflicts.length > 0) {
        return {
          success: false,
          error: 'Merge conflicts detected',
          conflicts: pullResult.summary.conflicts,
          message: `Merge conflicts found in ${pullResult.summary.conflicts.length} file(s). Please resolve conflicts manually.`
        };
      }

      return {
        success: true,
        message: pullResult.summary.changes > 0 
          ? `Pulled ${pullResult.summary.changes} change(s) successfully` 
          : 'Already up to date',
        changes: pullResult.summary.changes,
        insertions: pullResult.summary.insertions,
        deletions: pullResult.summary.deletions
      };
    } catch (error) {
      console.error('Failed to pull latest changes:', error);
      
      // Check for merge conflict errors
      if (error.message.includes('conflict') || error.message.includes('CONFLICT')) {
        return {
          success: false,
          error: 'Merge conflicts detected',
          message: 'Merge conflicts detected. Please resolve conflicts manually and try again.'
        };
      }

      return {
        success: false,
        error: error.message,
        message: `Failed to pull latest changes: ${error.message}`
      };
    }
  }

  /**
   * Stages and commits all changes with a commit message
   * @param {string} message - Commit message (optional, will auto-generate if not provided)
   * @returns {Promise<Object>} - Result object with success status and commit details
   */
  async commitChanges(message = null) {
    try {
      // Get current status to check for changes
      const status = await this.getStatus();

      if (status.isClean) {
        return {
          success: false,
          error: 'No changes to commit',
          message: 'There are no changes to commit.'
        };
      }

      // Auto-generate commit message if not provided
      if (!message) {
        const { modified, created, deleted } = status;
        const parts = [];
        
        if (created > 0) parts.push(`Added ${created} file(s)`);
        if (modified > 0) parts.push(`Modified ${modified} file(s)`);
        if (deleted > 0) parts.push(`Deleted ${deleted} file(s)`);
        
        message = parts.length > 0 
          ? `Update products via Store Manager: ${parts.join(', ')}`
          : 'Update products via Store Manager';
      }

      console.log(`Committing changes with message: ${message}`);

      // Stage all changes including deletions (git add -A)
      // This ensures deleted files are also staged, not just modifications and new files
      await this.git.add('-A');

      // Commit the staged changes
      const commitResult = await this.git.commit(message);

      return {
        success: true,
        message: 'Changes committed successfully',
        commit: commitResult.commit,
        summary: commitResult.summary,
        branch: commitResult.branch,
        commitMessage: message
      };
    } catch (error) {
      console.error('Failed to commit changes:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to commit changes: ${error.message}`
      };
    }
  }

  /**
   * Pushes changes to GitHub with authentication
   * Temporarily sets the remote URL with credentials, pushes, then restores the original URL
   * @param {string} branch - Branch name (defaults to current branch)
   * @param {string} username - GitHub username (optional, uses config if not provided)
   * @param {string} token - GitHub token (optional, uses config if not provided)
   * @returns {Promise<Object>} - Result object with success status and push details
   */
  async pushToGitHub(branch = null, username = null, token = null) {
    let originalRemoteUrl = null;

    try {
      // Use provided credentials or fall back to config
      const authUsername = username || this.config.username;
      const authToken = token || this.config.token;

      // Validate credentials
      if (!authUsername || !authToken) {
        return {
          success: false,
          error: 'Missing credentials',
          message: 'GitHub username and token are required for push operations.'
        };
      }

      // Get current branch if not specified
      if (!branch) {
        const status = await this.git.status();
        branch = status.current;
      }

      // Get the current remote URL
      const remotes = await this.git.getRemotes(true);
      const originRemote = remotes.find(r => r.name === 'origin');
      
      if (!originRemote) {
        return {
          success: false,
          error: 'No remote configured',
          message: 'No "origin" remote found. Please configure the repository URL in Settings.'
        };
      }

      originalRemoteUrl = originRemote.refs.push || originRemote.refs.fetch;

      // Parse the repository URL to extract owner and repo
      const repoMatch = originalRemoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
      if (!repoMatch) {
        return {
          success: false,
          error: 'Invalid repository URL',
          message: 'Could not parse GitHub repository URL.'
        };
      }

      const owner = repoMatch[1];
      const repo = repoMatch[2].replace(/\.git$/, '');

      // Create authenticated remote URL
      const authenticatedUrl = `https://${authUsername}:${authToken}@github.com/${owner}/${repo}.git`;

      console.log(`Pushing to GitHub: ${owner}/${repo} (branch: ${branch})`);

      // Temporarily set the remote URL with authentication
      await this.git.remote(['set-url', 'origin', authenticatedUrl]);

      // Push changes
      const pushResult = await this.git.push('origin', branch);

      // Restore the original remote URL (without credentials)
      await this.git.remote(['set-url', 'origin', originalRemoteUrl]);

      return {
        success: true,
        message: `Successfully pushed to ${owner}/${repo}`,
        branch,
        remoteUrl: `https://github.com/${owner}/${repo}`
      };
    } catch (error) {
      console.error('Failed to push to GitHub:', error);

      // Restore the original remote URL if it was changed
      if (originalRemoteUrl) {
        try {
          await this.git.remote(['set-url', 'origin', originalRemoteUrl]);
        } catch (restoreError) {
          console.error('Failed to restore original remote URL:', restoreError);
        }
      }

      // Parse error message for common issues
      let errorMessage = error.message;
      if (error.message.includes('authentication failed') || error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please check your GitHub username and token.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Access forbidden. Your token may not have the necessary permissions.';
      } else if (error.message.includes('could not resolve host')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      return {
        success: false,
        error: error.message,
        message: `Failed to push to GitHub: ${errorMessage}`
      };
    }
  }

  /**
   * Publishes all changes to GitHub
   * Executes the full workflow: pull, commit, and push
   * @param {string} commitMessage - Custom commit message (optional)
   * @returns {Promise<Object>} - Result object with success status and detailed information
   */
  async publishChanges(commitMessage = null) {
    const startTime = Date.now();
    const results = {
      pull: null,
      commit: null,
      push: null
    };

    try {
      // Step 1: Pull latest changes
      console.log('Step 1/3: Pulling latest changes...');
      results.pull = await this.pullLatestChanges();

      if (!results.pull.success) {
        return {
          success: false,
          error: results.pull.error,
          message: results.pull.message,
          step: 'pull',
          results
        };
      }

      // Step 2: Commit changes
      console.log('Step 2/3: Committing changes...');
      results.commit = await this.commitChanges(commitMessage);

      if (!results.commit.success) {
        // If there are no changes to commit, it's not really an error
        if (results.commit.error === 'No changes to commit') {
          return {
            success: true,
            message: 'Already up to date. No changes to publish.',
            results
          };
        }

        return {
          success: false,
          error: results.commit.error,
          message: results.commit.message,
          step: 'commit',
          results
        };
      }

      // Step 3: Push to GitHub
      console.log('Step 3/3: Pushing to GitHub...');
      results.push = await this.pushToGitHub();

      if (!results.push.success) {
        return {
          success: false,
          error: results.push.error,
          message: results.push.message,
          step: 'push',
          results
        };
      }

      // Success!
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      return {
        success: true,
        message: `Successfully published changes to GitHub in ${duration}s`,
        duration,
        commitMessage: results.commit.commitMessage,
        branch: results.push.branch,
        results
      };
    } catch (error) {
      console.error('Publish workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: `Publish workflow failed: ${error.message}`,
        results
      };
    }
  }
}

export default GitService;
