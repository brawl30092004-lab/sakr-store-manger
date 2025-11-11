import simpleGit from 'simple-git';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * GitService - Handles Git operations and GitHub integration
 */
class GitService {
  /**
   * Checks if Git is installed on the system
   * This is a static method that can be called without instantiating the class
   * @param {string} [customGitPath] - Optional custom Git executable path
   * @returns {Promise<Object>} - Result object with success status, installed status, version, and message
   */
  static async checkGitInstallation(customGitPath = null) {
    try {
      // Create simple-git instance with custom Git path if provided
      const gitOptions = customGitPath ? { 
        binary: customGitPath,
        unsafe: {
          allowUnsafeCustomBinary: true  // Allow paths with spaces like "C:\Program Files\Git\cmd\git.exe"
        }
      } : {};
      const git = simpleGit(gitOptions);
      
      // Try to get Git version
      const version = await git.version();
      
      return {
        success: true,
        installed: true,
        version: version.installed ? version.major + '.' + version.minor + '.' + version.patch : 'unknown',
        gitVersion: version,
        gitPath: customGitPath || 'git',
        message: `Git is installed (version ${version.installed ? version.major + '.' + version.minor + '.' + version.patch : 'unknown'})`
      };
    } catch (error) {
      console.error('Git installation check failed:', error.message);
      
      // Check if it's a "git not found" error
      if (error.message.includes('spawn git ENOENT') || 
          error.message.includes('git: command not found') ||
          error.message.includes('not recognized as an internal or external command')) {
        return {
          success: false,
          installed: false,
          version: null,
          message: 'Git is not installed on this system. Please install Git to use GitHub features.',
          error: error.message
        };
      }
      
      // Other errors
      return {
        success: false,
        installed: false,
        version: null,
        message: 'Unable to verify Git installation: ' + error.message,
        error: error.message
      };
    }
  }
  /**
   * Creates a new GitService instance
   * @param {string} projectPath - Path to the local git repository
   * @param {Object} config - GitHub configuration
   * @param {string} config.username - GitHub username
   * @param {string} config.token - GitHub Personal Access Token (decrypted)
   * @param {string} config.repoUrl - GitHub repository URL
   * @param {string} [config.gitPath] - Optional custom Git executable path
   */
  constructor(projectPath, config = {}) {
    this.projectPath = projectPath;
    this.config = {
      username: config.username || '',
      token: config.token || '',
      repoUrl: config.repoUrl || '',
      gitPath: config.gitPath || null
    };
    
    // Initialize simple-git with the project path and custom Git binary if provided
    const gitOptions = this.config.gitPath 
      ? { 
          baseDir: projectPath, 
          binary: this.config.gitPath,
          unsafe: {
            allowUnsafeCustomBinary: true  // Allow paths with spaces
          }
        }
      : { baseDir: projectPath };
    
    this.git = simpleGit(gitOptions);
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
   * Analyzes changes in products.json to show detailed product-level changes
   * @returns {Promise<Array>} - Array of detailed change descriptions
   */
  async analyzeProductChanges() {
    try {
      // Get the diff for products.json
      const diff = await this.git.diff(['HEAD', 'products.json']);
      
      if (!diff) {
        return [];
      }

      // Get old version (HEAD)
      let oldProducts = [];
      try {
        const oldContent = await this.git.show(['HEAD:products.json']);
        oldProducts = JSON.parse(oldContent);
      } catch (error) {
        // File might be new, that's okay
        console.log('Could not get old products.json:', error.message);
      }

      // Get new version (working directory)
      let newProducts = [];
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const newContent = await fs.readFile(path.join(this.projectPath, 'products.json'), 'utf-8');
        newProducts = JSON.parse(newContent);
      } catch (error) {
        console.log('Could not get new products.json:', error.message);
        return [];
      }

      // Create maps for easy lookup
      const oldMap = new Map(oldProducts.map(p => [p.id, p]));
      const newMap = new Map(newProducts.map(p => [p.id, p]));

      const changes = [];

      // Check for deleted products
      for (const [id, product] of oldMap) {
        if (!newMap.has(id)) {
          changes.push({
            type: 'deleted',
            productId: id,
            productName: product.name,
            description: `${product.name}: deleted`
          });
        }
      }

      // Check for new and modified products
      for (const [id, newProduct] of newMap) {
        const oldProduct = oldMap.get(id);

        if (!oldProduct) {
          // New product
          changes.push({
            type: 'added',
            productId: id,
            productName: newProduct.name,
            description: `${newProduct.name}: added`
          });
        } else {
          // Check for modifications
          const productChanges = [];

          // Name change
          if (oldProduct.name !== newProduct.name) {
            productChanges.push(`renamed from "${oldProduct.name}" to "${newProduct.name}"`);
          }

          // Stock change
          if (oldProduct.stock !== newProduct.stock) {
            productChanges.push(`stock changed from ${oldProduct.stock} to ${newProduct.stock}`);
          }

          // Price change
          if (oldProduct.price !== newProduct.price) {
            productChanges.push(`price changed from EGP ${oldProduct.price.toFixed(2)} to EGP ${newProduct.price.toFixed(2)}`);
          }

          // Discount change
          if (oldProduct.discount !== newProduct.discount) {
            if (newProduct.discount) {
              productChanges.push(`discount added (EGP ${newProduct.discountedPrice.toFixed(2)})`);
            } else {
              productChanges.push('discount removed');
            }
          } else if (oldProduct.discount && newProduct.discount && 
                     oldProduct.discountedPrice !== newProduct.discountedPrice) {
            productChanges.push(`discounted price changed from EGP ${oldProduct.discountedPrice.toFixed(2)} to EGP ${newProduct.discountedPrice.toFixed(2)}`);
          }

          // Category change
          if (oldProduct.category !== newProduct.category) {
            productChanges.push(`category changed from "${oldProduct.category}" to "${newProduct.category}"`);
          }

          // Description change
          if (oldProduct.description !== newProduct.description) {
            productChanges.push('description updated');
          }

          // Image changes
          if (oldProduct.image !== newProduct.image || 
              JSON.stringify(oldProduct.images) !== JSON.stringify(newProduct.images)) {
            productChanges.push('images updated');
          }

          // isNew flag change
          if (oldProduct.isNew !== newProduct.isNew) {
            productChanges.push(newProduct.isNew ? 'marked as new' : 'unmarked as new');
          }

          // If there are changes, add them
          if (productChanges.length > 0) {
            changes.push({
              type: 'modified',
              productId: id,
              productName: newProduct.name,
              description: `${newProduct.name}: ${productChanges.join(', ')}`
            });
          }
        }
      }

      return changes;
    } catch (error) {
      console.error('Error analyzing product changes:', error);
      return [];
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

      // Check if products.json is modified and get detailed changes
      let productChanges = [];
      if (status.modified.includes('products.json') || 
          status.created.includes('products.json')) {
        productChanges = await this.analyzeProductChanges();
      }
      
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
        productChanges, // Add detailed product changes
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
   * @param {string} [customGitPath] - Optional custom Git executable path
   * @returns {Promise<Object>} - Result object with success status
   */
  static async cloneRepository(targetPath, repoUrl, username, token, customGitPath = null) {
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
          
          // Use custom Git path if provided
          const gitOptions = customGitPath
            ? { baseDir: targetPath, binary: customGitPath }
            : { baseDir: targetPath };
          
          const git = simpleGit(gitOptions);
          
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
        // Use custom Git path if provided
        const gitOptions = customGitPath ? { binary: customGitPath } : {};
        
        await simpleGit(gitOptions).clone(authenticatedUrl, targetPath);
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
   * Restores a specific file to its last committed state (discards changes)
   * @param {string} filePath - Path to the file to restore
   * @returns {Promise<Object>} - Result object with success status
   */
  async restoreFile(filePath) {
    try {
      await this.git.checkout(['--', filePath]);
      return {
        success: true,
        message: `File restored: ${filePath}`
      };
    } catch (error) {
      console.error(`Failed to restore file ${filePath}:`, error);
      return {
        success: false,
        error: error.message,
        message: `Failed to restore file: ${error.message}`
      };
    }
  }

  /**
   * Undoes a specific product change by restoring the old value from HEAD
   * @param {Object} productChange - The product change object with productId and type
   * @returns {Promise<Object>} - Result object with success status
   */
  async undoProductChange(productChange) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const productsPath = path.join(this.projectPath, 'products.json');

      // Get old version from HEAD
      let oldProducts = [];
      try {
        const oldContent = await this.git.show(['HEAD:products.json']);
        oldProducts = JSON.parse(oldContent);
      } catch (error) {
        return {
          success: false,
          message: 'Could not read original products.json from repository'
        };
      }

      // Get current version
      const currentContent = await fs.readFile(productsPath, 'utf-8');
      const currentProducts = JSON.parse(currentContent);

      // Find the product by ID
      const oldProduct = oldProducts.find(p => p.id === productChange.productId);
      const currentProductIndex = currentProducts.findIndex(p => p.id === productChange.productId);

      if (productChange.type === 'deleted') {
        // Product was deleted, restore it
        if (oldProduct) {
          currentProducts.push(oldProduct);
        }
      } else if (productChange.type === 'added') {
        // Product was added, remove it
        if (currentProductIndex !== -1) {
          currentProducts.splice(currentProductIndex, 1);
        }
      } else if (productChange.type === 'modified') {
        // Product was modified, restore old version
        if (oldProduct && currentProductIndex !== -1) {
          currentProducts[currentProductIndex] = oldProduct;
        }
      }

      // Save the updated products.json
      await fs.writeFile(productsPath, JSON.stringify(currentProducts, null, 2), 'utf-8');

      return {
        success: true,
        message: `Undone changes for: ${productChange.productName}`
      };
    } catch (error) {
      console.error('Failed to undo product change:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to undo product change: ${error.message}`
      };
    }
  }

  /**
   * Stages specific files for commit
   * @param {Array<string>} files - Array of file paths to stage
   * @returns {Promise<Object>} - Result object with success status
   */
  async stageFiles(files) {
    try {
      if (!files || files.length === 0) {
        return {
          success: false,
          message: 'No files specified to stage'
        };
      }
      
      await this.git.add(files);
      return {
        success: true,
        message: `Staged ${files.length} file(s)`,
        files
      };
    } catch (error) {
      console.error('Failed to stage files:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to stage files: ${error.message}`
      };
    }
  }

  /**
   * Unstages specific files (removes from staging area)
   * @param {Array<string>} files - Array of file paths to unstage
   * @returns {Promise<Object>} - Result object with success status
   */
  async unstageFiles(files) {
    try {
      if (!files || files.length === 0) {
        return {
          success: false,
          message: 'No files specified to unstage'
        };
      }
      
      await this.git.reset(['--', ...files]);
      return {
        success: true,
        message: `Unstaged ${files.length} file(s)`,
        files
      };
    } catch (error) {
      console.error('Failed to unstage files:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to unstage files: ${error.message}`
      };
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
      
      console.log('Pull result:', JSON.stringify(pullResult, null, 2));

      // Check for conflicts (with null safety)
      if (pullResult?.summary?.conflicts && pullResult.summary.conflicts.length > 0) {
        return {
          success: false,
          error: 'Merge conflicts detected',
          conflicts: pullResult.summary.conflicts,
          message: `Merge conflicts found in ${pullResult.summary.conflicts.length} file(s). Please resolve conflicts manually.`
        };
      }

      return {
        success: true,
        message: pullResult?.summary?.changes > 0 
          ? `Pulled ${pullResult.summary.changes} change(s) successfully` 
          : 'Already up to date',
        changes: pullResult?.summary?.changes || 0,
        insertions: pullResult?.summary?.insertions || 0,
        deletions: pullResult?.summary?.deletions || 0
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
   * @param {Array<string>} files - Optional array of specific files to commit (if null, commits all changes)
   * @returns {Promise<Object>} - Result object with success status and commit details
   */
  async commitChanges(message = null, files = null) {
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

      // Stage changes - either specific files or all changes
      if (files && files.length > 0) {
        // Stage only the specified files
        console.log(`Staging ${files.length} specific file(s)`);
        await this.git.add(files);
      } else {
        // Stage all changes including deletions (git add -A)
        await this.git.add('-A');
      }

      // Commit the staged changes
      const commitResult = await this.git.commit(message);

      return {
        success: true,
        message: 'Changes committed successfully',
        commit: commitResult.commit,
        summary: commitResult.summary,
        branch: commitResult.branch,
        commitMessage: message,
        filesCommitted: files || 'all'
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
   * Executes the full workflow: stash (if needed), pull, pop stash, commit, and push
   * @param {string} commitMessage - Custom commit message (optional)
   * @param {Array<string>} files - Optional array of specific files to commit (if null, commits all changes)
   * @returns {Promise<Object>} - Result object with success status and detailed information
   */
  async publishChanges(commitMessage = null, files = null) {
    const startTime = Date.now();
    const results = {
      stash: null,
      pull: null,
      stashPop: null,
      commit: null,
      push: null
    };

    try {
      // Step 0: Check if we have local uncommitted changes
      const status = await this.getStatus();
      const hasLocalChanges = !status.isClean;

      // Step 1: If we have local changes, stash them before pulling
      if (hasLocalChanges) {
        console.log('Step 1a: Stashing local changes...');
        try {
          await this.git.stash(['push', '-u', '-m', 'Auto-stash before pull']);
          results.stash = { success: true, stashed: true };
          console.log('Local changes stashed successfully');
        } catch (error) {
          console.error('Failed to stash changes:', error);
          results.stash = { success: false, error: error.message };
        }
      }

      // Step 2: Pull latest changes
      console.log('Step 1b: Pulling latest changes...');
      results.pull = await this.pullLatestChanges();

      if (!results.pull.success) {
        // If pull failed and we stashed changes, try to restore them
        if (results.stash?.stashed) {
          console.log('Pull failed, restoring stashed changes...');
          try {
            await this.git.stash(['pop']);
          } catch (popError) {
            console.error('Failed to restore stashed changes:', popError);
          }
        }

        // Check if this is a conflict error - return special conflict status
        if (results.pull.error === 'Merge conflicts detected' || 
            (results.pull.message && results.pull.message.includes('conflict'))) {
          return {
            success: false,
            hasConflict: true,
            error: results.pull.error,
            message: results.pull.message,
            conflicts: results.pull.conflicts,
            step: 'pull',
            results,
            needsResolution: true
          };
        }
        
        // Other errors (network, auth, etc.)
        return {
          success: false,
          error: results.pull.error,
          message: results.pull.message,
          step: 'pull',
          results
        };
      }

      // Step 3: If we stashed changes, pop them back and handle potential conflicts
      if (results.stash?.stashed) {
        console.log('Step 2: Restoring stashed changes...');
        try {
          await this.git.stash(['pop']);
          results.stashPop = { success: true };
          console.log('Stashed changes restored successfully');
        } catch (error) {
          console.error('Conflict when restoring stashed changes:', error);
          
          // Check if this is a merge conflict from stash pop
          if (error.message.includes('conflict') || error.message.includes('CONFLICT')) {
            // Get conflict details
            const conflictDetails = await this.getConflictDetails();
            
            return {
              success: false,
              hasConflict: true,
              error: 'Merge conflicts detected',
              message: 'Your local changes conflict with changes from the store',
              conflictDetails,
              step: 'stash_pop',
              results,
              needsResolution: true
            };
          }
          
          // Other stash pop errors
          results.stashPop = { success: false, error: error.message };
          return {
            success: false,
            error: error.message,
            message: `Failed to restore local changes: ${error.message}`,
            step: 'stash_pop',
            results
          };
        }
      }

      // Step 4: Commit changes
      console.log('Step 3: Committing changes...');
      results.commit = await this.commitChanges(commitMessage, files);

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

      // Step 5: Push to GitHub
      console.log('Step 4: Pushing to store...');
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
        filesCommitted: results.commit.filesCommitted,
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

  /**
   * Continues publishing after conflict resolution
   * Only executes commit and push steps (assumes pull already done)
   * @param {string} commitMessage - Commit message
   * @param {Array<string>} files - Optional array of specific files to commit
   * @returns {Promise<Object>} - Result object
   */
  async continuePublishAfterResolution(commitMessage = null, files = null) {
    const startTime = Date.now();
    const results = {
      commit: null,
      push: null
    };

    try {
      // Step 1: Commit changes
      console.log('Step 1/2: Committing changes after conflict resolution...');
      results.commit = await this.commitChanges(commitMessage, files);

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

      // Step 2: Push to GitHub
      console.log('Step 2/2: Pushing to GitHub...');
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
        filesCommitted: results.commit.filesCommitted,
        results
      };
    } catch (error) {
      console.error('Continue publish workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: `Publish workflow failed: ${error.message}`,
        results
      };
    }
  }

  /**
   * Checks if there are new changes on the remote repository
   * Compares local HEAD with remote HEAD without pulling
   * @param {string} branch - Branch name (defaults to current branch)
   * @returns {Promise<Object>} - Result with hasRemoteChanges and behindBy count
   */
  async checkForRemoteChanges(branch = null) {
    try {
      // Get current branch if not specified
      if (!branch) {
        const status = await this.git.status();
        branch = status.current;
      }

      console.log(`Checking for remote changes on ${branch}...`);

      // Fetch latest remote refs without pulling
      await this.git.fetch('origin');

      // Get local and remote commit hashes
      const localHead = await this.git.revparse(['HEAD']);
      const remoteHead = await this.git.revparse([`origin/${branch}`]);

      // Check if we're behind
      const behindBy = localHead !== remoteHead 
        ? parseInt(await this.git.raw(['rev-list', '--count', `HEAD..origin/${branch}`]))
        : 0;

      // Check if we're ahead
      const aheadBy = localHead !== remoteHead 
        ? parseInt(await this.git.raw(['rev-list', '--count', `origin/${branch}..HEAD`]))
        : 0;

      return {
        success: true,
        hasRemoteChanges: behindBy > 0,
        behindBy,
        aheadBy,
        upToDate: behindBy === 0 && aheadBy === 0,
        message: behindBy > 0 
          ? `${behindBy} new change(s) available on GitHub`
          : 'Your local copy is up to date'
      };
    } catch (error) {
      console.error('Failed to check for remote changes:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to check for remote changes: ${error.message}`
      };
    }
  }

  /**
   * Checks if a merge would cause conflicts without actually merging
   * Uses git merge --no-commit --no-ff to simulate merge
   * @param {string} branch - Branch name (defaults to current branch)
   * @returns {Promise<Object>} - Result with potential conflict information
   */
  async checkForPotentialConflicts(branch = null) {
    try {
      // Get current branch if not specified
      if (!branch) {
        const status = await this.git.status();
        branch = status.current;
      }

      console.log(`Checking for potential conflicts with origin/${branch}...`);

      // First, fetch to ensure we have latest remote refs
      await this.git.fetch('origin');

      // Check if there are local changes
      const status = await this.git.status();
      const hasLocalChanges = status.files.length > 0;

      // Check if remote is ahead
      const remoteCheck = await this.checkForRemoteChanges(branch);
      if (!remoteCheck.hasRemoteChanges) {
        return {
          success: true,
          hasLocalChanges,
          hasRemoteChanges: false,
          potentialConflicts: false,
          message: 'No remote changes detected'
        };
      }

      // If both local and remote have changes, there might be conflicts
      if (hasLocalChanges && remoteCheck.aheadBy > 0 && remoteCheck.behindBy > 0) {
        // Both sides have changes - potential conflict
        return {
          success: true,
          hasLocalChanges,
          hasRemoteChanges: true,
          potentialConflicts: true,
          diverged: true,
          message: 'Local and remote branches have diverged - conflicts possible',
          warning: 'Publishing may encounter merge conflicts. Consider pulling first.'
        };
      }

      return {
        success: true,
        hasLocalChanges,
        hasRemoteChanges: remoteCheck.hasRemoteChanges,
        potentialConflicts: false,
        message: 'No conflicts expected'
      };
    } catch (error) {
      console.error('Failed to check for potential conflicts:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to check for conflicts: ${error.message}`
      };
    }
  }

  /**
   * Pulls changes from GitHub with retry logic and better error handling
   * @param {string} branch - Branch name (defaults to current branch)
   * @param {number} maxRetries - Maximum number of retry attempts
   * @returns {Promise<Object>} - Result with success status and details
   */
  async pullWithRetry(branch = null, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Pull attempt ${attempt}/${maxRetries}...`);
        
        const result = await this.pullLatestChanges(branch);
        
        if (result.success) {
          return result;
        }

        // If it's a conflict error, don't retry
        if (result.error && result.error.includes('conflict')) {
          return result;
        }

        lastError = result.error;

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        lastError = error.message;

        // If it's a conflict or auth error, don't retry
        if (error.message.includes('conflict') || 
            error.message.includes('authentication') ||
            error.message.includes('401') ||
            error.message.includes('403')) {
          return {
            success: false,
            error: error.message,
            message: `Pull failed: ${error.message}`
          };
        }

        // Wait before retrying
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    return {
      success: false,
      error: lastError,
      message: `Pull failed after ${maxRetries} attempts: ${lastError}`,
      retriesExhausted: true
    };
  }

  /**
   * Parses products.json to find specific product-level conflicts
   * @param {string} localContent - Local version content
   * @param {string} remoteContent - Remote version content
   * @returns {Array} - Array of product conflicts with field-level details
   */
  parseProductConflicts(localContent, remoteContent) {
    try {
      const localProducts = JSON.parse(localContent);
      const remoteProducts = JSON.parse(remoteContent);
      const conflicts = [];

      // Create maps for quick lookup
      const localMap = new Map(localProducts.map(p => [p.id, p]));
      const remoteMap = new Map(remoteProducts.map(p => [p.id, p]));

      // Find products that exist in both but differ
      for (const [id, localProduct] of localMap) {
        const remoteProduct = remoteMap.get(id);
        
        if (!remoteProduct) continue; // Product only exists locally
        
        const fieldConflicts = [];
        
        // Compare each field
        const fieldsToCheck = ['name', 'price', 'description', 'category', 'stock', 'isNew', 'discount'];
        
        for (const field of fieldsToCheck) {
          const localValue = localProduct[field];
          const remoteValue = remoteProduct[field];
          
          // Check if values differ
          if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
            fieldConflicts.push({
              field,
              fieldLabel: this.getFieldLabel(field),
              localValue,
              remoteValue,
              isDifferent: true
            });
          }
        }
        
        // If there are field conflicts, add this product to conflicts list
        if (fieldConflicts.length > 0) {
          conflicts.push({
            productId: id,
            productName: localProduct.name || remoteProduct.name || `Product ${id}`,
            localProduct,
            remoteProduct,
            fieldConflicts
          });
        }
      }
      
      return conflicts;
    } catch (error) {
      console.error('Failed to parse product conflicts:', error);
      return [];
    }
  }

  /**
   * Gets user-friendly label for product field
   * @param {string} field - Field name
   * @returns {string} - User-friendly label
   */
  getFieldLabel(field) {
    const labels = {
      name: 'Product Name',
      price: 'Price',
      description: 'Description',
      category: 'Category',
      stock: 'Stock Quantity',
      isNew: 'New Badge',
      discount: 'Discount'
    };
    return labels[field] || field;
  }

  /**
   * Handles merge conflicts by providing resolution options
   * @returns {Promise<Object>} - Conflict details with resolution options
   */
  async getConflictDetails() {
    try {
      // Get list of conflicted files
      const statusSummary = await this.git.status();
      const conflictedFiles = statusSummary.conflicted || [];

      if (conflictedFiles.length === 0) {
        return {
          success: true,
          hasConflicts: false,
          message: 'No conflicts found'
        };
      }

      // Get details for products.json conflicts (most common)
      const conflicts = [];
      let productConflicts = [];
      
      for (const file of conflictedFiles) {
        try {
          // Get both versions of the file
          let localVersion = null;
          let remoteVersion = null;

          try {
            localVersion = await this.git.show(['HEAD:' + file]);
          } catch (e) {
            console.log('Could not get local version of', file);
          }

          try {
            remoteVersion = await this.git.show(['MERGE_HEAD:' + file]);
          } catch (e) {
            console.log('Could not get remote version of', file);
          }

          // If this is products.json, parse for product-level conflicts
          if (file.includes('products.json') && localVersion && remoteVersion) {
            productConflicts = this.parseProductConflicts(localVersion, remoteVersion);
          }

          conflicts.push({
            file,
            localVersion,
            remoteVersion
          });
        } catch (error) {
          console.error(`Error getting conflict details for ${file}:`, error);
        }
      }

      return {
        success: true,
        hasConflicts: true,
        conflictedFiles,
        conflicts,
        productConflicts, // Detailed product-level conflicts
        hasProductConflicts: productConflicts.length > 0,
        message: productConflicts.length > 0 
          ? `${productConflicts.length} product(s) have conflicts`
          : `${conflictedFiles.length} file(s) have conflicts`
      };
    } catch (error) {
      console.error('Failed to get conflict details:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to analyze conflicts: ${error.message}`
      };
    }
  }

  /**
   * Resolves conflicts by choosing a version
   * @param {string} resolution - 'local', 'remote', or 'abort'
   * @param {Array<string>} files - Files to resolve (defaults to all conflicted files)
   * @returns {Promise<Object>} - Resolution result
   */
  async resolveConflict(resolution, files = null) {
    try {
      const statusSummary = await this.git.status();
      const conflictedFiles = files || statusSummary.conflicted || [];

      if (conflictedFiles.length === 0) {
        return {
          success: true,
          message: 'No conflicts to resolve'
        };
      }

      if (resolution === 'abort') {
        // Abort the merge
        await this.git.raw(['merge', '--abort']);
        return {
          success: true,
          aborted: true,
          message: 'Merge aborted, returned to previous state'
        };
      }

      // Resolve conflicts by choosing a version
      for (const file of conflictedFiles) {
        if (resolution === 'local') {
          // Keep local version (ours)
          await this.git.raw(['checkout', '--ours', file]);
        } else if (resolution === 'remote') {
          // Keep remote version (theirs)
          await this.git.raw(['checkout', '--theirs', file]);
        }
        
        // Stage the resolved file
        await this.git.add(file);
      }

      // Complete the merge
      await this.git.raw(['commit', '--no-edit']);

      return {
        success: true,
        resolved: true,
        resolution,
        filesResolved: conflictedFiles.length,
        message: `Resolved ${conflictedFiles.length} file(s) by keeping ${resolution} version`
      };
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to resolve conflicts: ${error.message}`
      };
    }
  }

  /**
   * Pushes changes to GitHub with retry logic
   * @param {string} branch - Branch name
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>} - Push result
   */
  async pushWithRetry(branch = null, maxRetries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Push attempt ${attempt}/${maxRetries}...`);
        
        const result = await this.pushToGitHub(branch);
        
        if (result.success) {
          return result;
        }

        lastError = result.error;

        // If it's an auth error, don't retry
        if (result.error && (
          result.error.includes('authentication') ||
          result.error.includes('401') ||
          result.error.includes('403')
        )) {
          return result;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        lastError = error.message;

        // If it's an auth error, don't retry
        if (error.message.includes('authentication') ||
            error.message.includes('401') ||
            error.message.includes('403')) {
          return {
            success: false,
            error: error.message,
            message: `Push failed: ${error.message}`
          };
        }

        // Wait before retrying
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    return {
      success: false,
      error: lastError,
      message: `Push failed after ${maxRetries} attempts: ${lastError}`,
      retriesExhausted: true
    };
  }
}

export default GitService;
