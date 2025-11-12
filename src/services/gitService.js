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
            const oldPrice = oldProduct.price != null ? oldProduct.price.toFixed(2) : '0.00';
            const newPrice = newProduct.price != null ? newProduct.price.toFixed(2) : '0.00';
            productChanges.push(`price changed from EGP ${oldPrice} to EGP ${newPrice}`);
          }

          // Discount change
          if (oldProduct.discount !== newProduct.discount) {
            if (newProduct.discount) {
              const discountedPrice = newProduct.discountedPrice != null ? newProduct.discountedPrice.toFixed(2) : '0.00';
              productChanges.push(`discount added (EGP ${discountedPrice})`);
            } else {
              productChanges.push('discount removed');
            }
          } else if (oldProduct.discount && newProduct.discount && 
                     oldProduct.discountedPrice !== newProduct.discountedPrice) {
            const oldDiscounted = oldProduct.discountedPrice != null ? oldProduct.discountedPrice.toFixed(2) : '0.00';
            const newDiscounted = newProduct.discountedPrice != null ? newProduct.discountedPrice.toFixed(2) : '0.00';
            productChanges.push(`discounted price changed from EGP ${oldDiscounted} to EGP ${newDiscounted}`);
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
    let stashed = false;
    
    try {
      // Get current branch if not specified
      if (!branch) {
        const status = await this.git.status();
        branch = status.current;
      }

      console.log(`Pulling latest changes from origin/${branch}...`);

      // Check if we have local uncommitted changes that need to be stashed
      const status = await this.getStatus();
      const hasLocalChanges = !status.isClean;

      if (hasLocalChanges) {
        console.log('🔄 Local uncommitted changes detected. Stashing before pull...');
        try {
          // Remove stale lock files before stashing
          await this.removeStaleLockFiles();
          
          await this.git.stash(['push', '-u', '-m', 'Auto-stash before sync']);
          stashed = true;
          console.log('✓ Local changes stashed successfully');
        } catch (stashError) {
          console.error('Failed to stash changes:', stashError);
          return {
            success: false,
            error: 'Failed to stash local changes',
            message: 'Cannot sync: Failed to save your local changes temporarily. Please commit or discard your changes and try again.',
            userMessage: 'Cannot sync while you have unsaved changes. Please publish your changes first, or discard them.'
          };
        }
      }

      // Fetch latest changes from remote
      await this.git.fetch('origin');

      // Pull changes from the specified branch
      const pullResult = await this.git.pull('origin', branch);
      
      console.log('Pull result:', JSON.stringify(pullResult, null, 2));

      // Check for conflicts (with null safety)
      if (pullResult?.summary?.conflicts && pullResult.summary.conflicts.length > 0) {
        // If we stashed changes, restore them before returning conflict
        if (stashed) {
          console.log('⚠️ Conflicts detected during pull. Restoring stashed changes...');
          try {
            await this.git.stash(['pop']);
          } catch (popError) {
            console.error('Failed to restore stashed changes after conflict:', popError);
          }
        }
        
        return {
          success: false,
          error: 'Merge conflicts detected',
          conflicts: pullResult.summary.conflicts,
          hasConflict: true,
          needsResolution: true,
          message: `Merge conflicts found in ${pullResult.summary.conflicts.length} file(s). Please resolve conflicts manually.`
        };
      }

      // If we stashed changes, pop them back now
      if (stashed) {
        console.log('✓ Pull successful. Restoring your local changes...');
        try {
          const stashPopResult = await this.git.stash(['pop']);
          console.log('✓ Local changes restored successfully');
          
          // Check if stash pop caused conflicts
          const statusAfterPop = await this.git.status();
          if (statusAfterPop.conflicted && statusAfterPop.conflicted.length > 0) {
            console.log('⚠️ Conflicts detected after restoring your changes');
            return {
              success: false,
              error: 'Merge conflicts detected',
              hasConflict: true,
              needsResolution: true,
              conflicts: statusAfterPop.conflicted,
              message: 'Your local changes conflict with the updates from GitHub. Please resolve the conflicts.',
              userMessage: 'Your changes conflict with updates from your store. Please choose which version to keep.'
            };
          }
        } catch (stashPopError) {
          console.error('Failed to restore stashed changes:', stashPopError);
          
          // Check if this is a conflict during stash pop
          if (stashPopError.message.includes('conflict') || stashPopError.message.includes('CONFLICT')) {
            const statusAfterError = await this.git.status();
            return {
              success: false,
              error: 'Merge conflicts detected',
              hasConflict: true,
              needsResolution: true,
              conflicts: statusAfterError.conflicted || ['products.json'],
              message: 'Your local changes conflict with the updates from GitHub. Please resolve the conflicts.',
              userMessage: 'Your changes conflict with updates from your store. Please choose which version to keep.'
            };
          }
          
          return {
            success: false,
            error: 'Failed to restore local changes',
            message: `Sync completed but failed to restore your local changes. They are still saved in stash. Error: ${stashPopError.message}`
          };
        }
      }

      return {
        success: true,
        message: pullResult?.summary?.changes > 0 
          ? `Pulled ${pullResult.summary.changes} change(s) successfully` 
          : 'Already up to date',
        changes: pullResult?.summary?.changes || 0,
        insertions: pullResult?.summary?.insertions || 0,
        deletions: pullResult?.summary?.deletions || 0,
        stashed: stashed // Let caller know if we had to stash
      };
    } catch (error) {
      console.error('Failed to pull latest changes:', error);
      
      // If we stashed changes before the error, try to restore them
      if (stashed) {
        console.log('⚠️ Pull failed. Attempting to restore stashed changes...');
        try {
          await this.git.stash(['pop']);
          console.log('✓ Local changes restored after error');
        } catch (popError) {
          console.error('Failed to restore stashed changes after error:', popError);
        }
      }
      
      // Check for network errors
      if (error.message.includes('Could not resolve host') || 
          error.message.includes('Failed to connect') ||
          error.message.includes('unable to access')) {
        return {
          success: false,
          error: 'Network error',
          message: 'Cannot connect to GitHub. Please check your internet connection and try again.'
        };
      }
      
      // Check for authentication errors
      if (error.message.includes('authentication failed') || 
          error.message.includes('401') ||
          error.message.includes('403')) {
        return {
          success: false,
          error: 'Authentication failed',
          message: 'GitHub authentication failed. Please check your Personal Access Token in Settings.'
        };
      }
      
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
      
      // Check for index.lock error
      if (error.message.includes('index.lock') || error.message.includes('Another git process')) {
        // Try to remove stale lock file
        await this.removeStaleLockFiles();
        
        return {
          success: false,
          error: 'Git is busy',
          message: 'Another git operation is in progress. Please wait a moment and try again. If this persists, try restarting the app.'
        };
      }
      
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
          // Remove stale lock files before stashing
          await this.removeStaleLockFiles();
          
          await this.git.stash(['push', '-u', '-m', 'Auto-stash before pull']);
          results.stash = { success: true, stashed: true };
          console.log('Local changes stashed successfully');
        } catch (error) {
          console.error('Failed to stash changes:', error);
          results.stash = { success: false, error: error.message };
          
          // If stash failed, don't proceed with pull as it will fail
          return {
            success: false,
            error: 'Failed to stash local changes',
            message: `Cannot publish: Failed to save your local changes temporarily. ${error.message}`,
            step: 'stash',
            results
          };
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
          const stashPopResult = await this.git.stash(['pop']);
          results.stashPop = { success: true, result: stashPopResult };
          console.log('Stash pop result:', stashPopResult);
          
          // CRITICAL: Check for conflicts after stash pop
          // Git may not throw an error but leaves conflict markers
          const statusAfterPop = await this.git.status();
          
          if (statusAfterPop.conflicted && statusAfterPop.conflicted.length > 0) {
            console.log('Conflicts detected after stash pop:', statusAfterPop.conflicted);
            
            // Get detailed conflict information
            const conflictDetails = await this.getConflictDetails();
            
            return {
              success: false,
              hasConflict: true,
              error: 'Merge conflicts detected',
              message: 'Your local changes conflict with changes from the store',
              conflictDetails,
              conflicts: statusAfterPop.conflicted,
              step: 'stash_pop',
              results,
              needsResolution: true
            };
          }
          
          console.log('Stashed changes restored successfully - no conflicts');
        } catch (error) {
          console.error('Error when restoring stashed changes:', error);
          
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
      // Log current git state for debugging
      console.log('📊 Git state before continue publish:');
      await this.logGitState();
      
      // Remove any stale lock files
      await this.removeStaleLockFiles();
      
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
      const trueConflicts = [];
      const autoMergeableChanges = [];

      // Create maps for quick lookup
      const localMap = new Map(localProducts.map(p => [p.id, p]));
      const remoteMap = new Map(remoteProducts.map(p => [p.id, p]));

      // Find products that exist in both but differ
      for (const [id, localProduct] of localMap) {
        const remoteProduct = remoteMap.get(id);
        
        if (!remoteProduct) continue; // Product only exists locally
        
        const fieldConflicts = [];
        const localOnlyChanges = [];
        const remoteOnlyChanges = [];
        
        // Compare each field
        const fieldsToCheck = ['name', 'price', 'description', 'category', 'stock', 'isNew', 'discount'];
        
        for (const field of fieldsToCheck) {
          const localValue = localProduct[field];
          const remoteValue = remoteProduct[field];
          
          // Check if values differ
          if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
            // This is a change - but is it a TRUE conflict?
            // For now, we'll treat ANY difference as something to show the user
            // but we'll categorize them as "mergeable" vs "conflicting"
            fieldConflicts.push({
              field,
              fieldLabel: this.getFieldLabel(field),
              localValue,
              remoteValue,
              isDifferent: true,
              canAutoMerge: false // For now, let user decide
            });
          }
        }
        
        // If there are field conflicts, add this product to conflicts list
        if (fieldConflicts.length > 0) {
          trueConflicts.push({
            productId: id,
            productName: localProduct.name || remoteProduct.name || `Product ${id}`,
            localProduct,
            remoteProduct,
            fieldConflicts,
            canAutoMerge: true // All field-level changes CAN be auto-merged
          });
        }
      }
      
      return trueConflicts;
    } catch (error) {
      console.error('Failed to parse product conflicts:', error);
      return [];
    }
  }

  /**
   * Performs intelligent 3-way merge of product changes
   * Combines local and remote changes when they affect different fields
   * @param {string} localContent - Local products.json content (stash/uncommitted changes)
   * @param {string} remoteContent - Remote products.json content (HEAD/pulled from GitHub)  
   * @param {string} baseContent - Base products.json content (merge-base/before pull)
   * @returns {Object} - Merge result with merged content
   */
  smartMergeProducts(localContent, remoteContent, baseContent = null) {
    try {
      const localProducts = JSON.parse(localContent);
      const remoteProducts = JSON.parse(remoteContent);
      const baseProducts = baseContent ? JSON.parse(baseContent) : null;
      const mergedProducts = [];
      const mergeLog = [];

      // Create maps for quick lookup
      const localMap = new Map(localProducts.map(p => [p.id, p]));
      const remoteMap = new Map(remoteProducts.map(p => [p.id, p]));
      const baseMap = baseProducts ? new Map(baseProducts.map(p => [p.id, p])) : null;
      
      // Get all unique product IDs
      const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

      for (const id of allIds) {
        const localProduct = localMap.get(id);
        const remoteProduct = remoteMap.get(id);
        const baseProduct = baseMap ? baseMap.get(id) : null;

        if (!localProduct) {
          // Product only exists in remote - use remote version
          mergedProducts.push(remoteProduct);
          mergeLog.push(`Product ${id} (${remoteProduct.name}): Added from store`);
        } else if (!remoteProduct) {
          // Product only exists locally - use local version
          mergedProducts.push(localProduct);
          mergeLog.push(`Product ${id} (${localProduct.name}): Added from your version`);
        } else {
          // Product exists in both - perform intelligent 3-way merge
          const merged = { ...localProduct }; // Start with local
          const fieldsToCheck = ['name', 'price', 'description', 'category', 'stock', 'isNew', 'discount', 'image'];
          const changedFields = [];

          for (const field of fieldsToCheck) {
            const localValue = localProduct[field];
            const remoteValue = remoteProduct[field];
            const baseValue = baseProduct ? baseProduct[field] : null;

            // 3-way merge logic
            if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
              // Values differ - need to merge intelligently
              
              if (baseValue !== null) {
                // We have base - do proper 3-way merge
                const localChanged = JSON.stringify(localValue) !== JSON.stringify(baseValue);
                const remoteChanged = JSON.stringify(remoteValue) !== JSON.stringify(baseValue);
                
                if (localChanged && !remoteChanged) {
                  // Only local changed - use local
                  merged[field] = localValue;
                  changedFields.push(`${field}: ${localValue} (your change)`);
                } else if (remoteChanged && !localChanged) {
                  // Only remote changed - use remote
                  merged[field] = remoteValue;
                  changedFields.push(`${field}: ${remoteValue} (store change)`);
                } else if (localChanged && remoteChanged) {
                  // Both changed - prefer local (user's current intent)
                  merged[field] = localValue;
                  changedFields.push(`${field}: ${localValue} (conflict, kept yours)`);
                }
              } else {
                // No base - use heuristic: prefer local changes
                merged[field] = localValue;
                changedFields.push(`${field}: ${localValue} (your version)`);
              }
            }
            // If values are the same, merged[field] already has the value
          }

          mergedProducts.push(merged);
          
          if (changedFields.length > 0) {
            mergeLog.push(`Product ${id} (${merged.name}): ${changedFields.join(', ')}`);
          }
        }
      }

      // Sort by ID to maintain consistent order
      mergedProducts.sort((a, b) => (a.id || 0) - (b.id || 0));

      return {
        success: true,
        merged: true,
        mergedContent: JSON.stringify(mergedProducts, null, 2),
        mergedProducts,
        mergeLog,
        message: `Smart merge completed: ${mergeLog.length} product(s) processed`
      };
    } catch (error) {
      console.error('Smart merge failed:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to merge products: ${error.message}`
      };
    }
  }

  /**
   * Parses conflict markers directly from a conflicted file
   * Extracts local and remote versions from <<<<<<, =======, >>>>>> markers
   * @param {string} conflictedContent - File content with conflict markers
   * @returns {Array} - Array of product conflicts
   */
  parseConflictMarkers(conflictedContent) {
    try {
      // Split content by conflict markers
      const lines = conflictedContent.split('\n');
      let inConflict = false;
      let localSection = [];
      let remoteSection = [];
      let currentSection = null;
      
      for (const line of lines) {
        if (line.startsWith('<<<<<<<')) {
          inConflict = true;
          currentSection = 'local';
          localSection = [];
          remoteSection = [];
          continue;
        } else if (line.startsWith('=======')) {
          currentSection = 'remote';
          continue;
        } else if (line.startsWith('>>>>>>>')) {
          inConflict = false;
          
          // Try to parse the local and remote sections as product objects
          try {
            const localJson = localSection.join('\n');
            const remoteJson = remoteSection.join('\n');
            
            // Extract product objects from the JSON fragments
            const localMatch = localJson.match(/"price":\s*([\d.]+)|"description":\s*"([^"]*)"/);
            const remoteMatch = remoteJson.match(/"price":\s*([\d.]+)|"description":\s*"([^"]*)"/);
            
            if (localMatch || remoteMatch) {
              // We have a conflict in products.json
              // For now, return a simple conflict indicator
              return [{
                productId: 'unknown',
                productName: 'Product in conflict',
                conflictType: 'field-level',
                localContent: localJson,
                remoteContent: remoteJson,
                fieldConflicts: [{
                  field: 'multiple',
                  fieldLabel: 'Multiple Fields',
                  localValue: 'See local changes',
                  remoteValue: 'See store changes',
                  isDifferent: true
                }]
              }];
            }
          } catch (parseError) {
            console.error('Could not parse conflict sections:', parseError);
          }
          
          currentSection = null;
          continue;
        }
        
        if (inConflict && currentSection === 'local') {
          localSection.push(line);
        } else if (inConflict && currentSection === 'remote') {
          remoteSection.push(line);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to parse conflict markers:', error);
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

          // Try multiple refs to get versions (depends on merge vs stash pop)
          // For stash-pop conflicts:
          //   - HEAD = what we pulled from GitHub (remote/store version)
          //   - refs/stash = your uncommitted local changes (local/your version)
          // For merge conflicts:
          //   - HEAD = your local committed state (local version)
          //   - MERGE_HEAD = what we're merging in from GitHub (remote version)
          
          let headVersion = null;
          let mergeHeadVersion = null;
          let stashVersion = null;
          
          // Get HEAD (current state)
          try {
            headVersion = await this.git.show(['HEAD:' + file]);
          } catch (e) {
            console.log('Could not get HEAD version of', file);
          }

          // Try MERGE_HEAD (normal merge scenario)
          try {
            mergeHeadVersion = await this.git.show(['MERGE_HEAD:' + file]);
          } catch (e) {
            // Not in a merge, might be stash-pop conflict
          }
          
          // Try stash (stash-pop scenario)
          try {
            stashVersion = await this.git.show(['refs/stash@{0}:' + file]);
          } catch (e) {
            // No stash available
          }
          
          // Determine which is local vs remote based on scenario
          if (stashVersion) {
            // Stash-pop conflict: stash = local (your changes), HEAD = remote (GitHub)
            localVersion = stashVersion;
            remoteVersion = headVersion;
            console.log('Using stash-pop conflict versions: local=stash, remote=HEAD');
          } else if (mergeHeadVersion) {
            // Merge conflict: HEAD = local, MERGE_HEAD = remote
            localVersion = headVersion;
            remoteVersion = mergeHeadVersion;
            console.log('Using merge conflict versions: local=HEAD, remote=MERGE_HEAD');
          } else {
            // Fallback
            localVersion = headVersion;
            remoteVersion = null;
          }

          // If this is products.json, parse for product-level conflicts
          if (file.includes('products.json')) {
            // Even if we can't get clean versions, try parsing the conflicted file
            if (localVersion && remoteVersion) {
              productConflicts = this.parseProductConflicts(localVersion, remoteVersion);
              
              // Also detect add/delete operations
              try {
                const localProducts = JSON.parse(localVersion);
                const remoteProducts = JSON.parse(remoteVersion);
                
                // Find products added locally but not on GitHub
                const localIds = new Set(localProducts.map(p => p.id));
                const remoteIds = new Set(remoteProducts.map(p => p.id));
                
                const addedLocally = localProducts.filter(p => !remoteIds.has(p.id));
                const deletedOnGitHub = remoteProducts.filter(p => !localIds.has(p.id));
                
                if (addedLocally.length > 0 || deletedOnGitHub.length > 0) {
                  // Add synthetic conflict entries for add/delete operations
                  for (const product of addedLocally) {
                    productConflicts.push({
                      productId: product.id,
                      productName: product.name || 'Unnamed Product',
                      conflictType: 'added_locally',
                      localValue: product,
                      remoteValue: null,
                      message: `Product "${product.name}" was added locally but doesn't exist on GitHub`,
                      canAutoMerge: true, // Can be auto-merged by keeping it
                      fieldConflicts: [{
                        field: 'existence',
                        fieldLabel: 'Product Existence',
                        localValue: 'Exists (newly added)',
                        remoteValue: 'Does not exist',
                        canAutoMerge: true
                      }]
                    });
                  }
                  
                  for (const product of deletedOnGitHub) {
                    productConflicts.push({
                      productId: product.id,
                      productName: product.name || 'Unnamed Product',
                      conflictType: 'deleted_on_github',
                      localValue: null,
                      remoteValue: product,
                      message: `Product "${product.name}" was deleted on GitHub but still exists locally`,
                      canAutoMerge: false, // User must decide
                      fieldConflicts: [{
                        field: 'existence',
                        fieldLabel: 'Product Existence',
                        localValue: 'Does not exist (deleted)',
                        remoteValue: 'Exists',
                        canAutoMerge: false
                      }]
                    });
                  }
                }
              } catch (parseError) {
                console.error('Could not parse products for add/delete detection:', parseError);
              }
            } else {
              // Try to parse the conflicted file directly (has conflict markers)
              try {
                const fs = await import('fs/promises');
                const path = await import('path');
                const conflictedFilePath = path.join(this.projectPath, file);
                const conflictedContent = await fs.readFile(conflictedFilePath, 'utf-8');
                
                // Parse conflict markers directly from the file
                productConflicts = this.parseConflictMarkers(conflictedContent);
              } catch (parseError) {
                console.error('Could not parse conflict markers:', parseError);
              }
            }
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
   * Checks for and removes stale git lock files
   * @returns {Promise<boolean>} - True if lock file was removed
   */
  async removeStaleLockFiles() {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const lockFilePath = path.join(this.projectPath, '.git', 'index.lock');
      
      try {
        await fs.access(lockFilePath);
        // Lock file exists, try to remove it
        console.log('⚠️ Found stale git lock file:', lockFilePath);
        await fs.unlink(lockFilePath);
        console.log('✅ Stale lock file removed successfully');
        return true;
      } catch (error) {
        // Lock file doesn't exist or couldn't be accessed
        return false;
      }
    } catch (error) {
      console.error('Error checking for lock files:', error);
      return false;
    }
  }

  /**
   * Resolves conflicts with custom field-level selections
   * Allows users to choose which fields to keep from local vs remote for each product
   * @param {Array<Object>} fieldSelections - Array of {productId, field, useLocal: boolean}
   * @returns {Promise<Object>} - Resolution result
   */
  async resolveConflictWithFieldSelections(fieldSelections) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Get conflict details first
      const conflictDetails = await this.getConflictDetails();
      
      if (!conflictDetails.hasProductConflicts) {
        return {
          success: false,
          error: 'No product conflicts found',
          message: 'No product conflicts to resolve with field selections'
        };
      }
      
      // Parse current conflicted file
      const productsFilePath = path.join(this.projectPath, 'products.json');
      const conflictedContent = await fs.readFile(productsFilePath, 'utf-8');
      
      // Get clean versions from git
      let localProducts = [];
      let remoteProducts = [];
      
      // Determine conflict type
      const mergeHeadPath = path.join(this.projectPath, '.git', 'MERGE_HEAD');
      let isStashConflict = false;
      try {
        await fs.access(mergeHeadPath);
        isStashConflict = false;
      } catch {
        isStashConflict = true;
      }
      
      // Get versions based on conflict type
      // Git show uses stage numbers:
      //   :1:file = base (common ancestor)
      //   :2:file = ours (local/HEAD in merge, remote in stash-pop)
      //   :3:file = theirs (remote/MERGE_HEAD in merge, local in stash-pop)
      if (isStashConflict) {
        // Stash conflict: :3 = local (your stashed changes), :2 = remote (what we pulled)
        const localContent = await this.git.show([':3:products.json']);
        const remoteContent = await this.git.show([':2:products.json']);
        localProducts = JSON.parse(localContent);
        remoteProducts = JSON.parse(remoteContent);
      } else {
        // Merge conflict: :2 = local (our HEAD), :3 = remote (their MERGE_HEAD)
        const localContent = await this.git.show([':2:products.json']);
        const remoteContent = await this.git.show([':3:products.json']);
        localProducts = JSON.parse(localContent);
        remoteProducts = JSON.parse(remoteContent);
      }
      
      // Create maps for quick lookup
      const localMap = new Map(localProducts.map(p => [p.id, p]));
      const remoteMap = new Map(remoteProducts.map(p => [p.id, p]));
      
      // Group selections by product
      const selectionsByProduct = {};
      for (const selection of fieldSelections) {
        if (!selectionsByProduct[selection.productId]) {
          selectionsByProduct[selection.productId] = {};
        }
        selectionsByProduct[selection.productId][selection.field] = selection.useLocal;
      }
      
      // Build merged products based on selections
      const mergedProducts = [];
      const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
      
      for (const id of allIds) {
        const localProduct = localMap.get(id);
        const remoteProduct = remoteMap.get(id);
        const selections = selectionsByProduct[id] || {};
        
        if (!localProduct) {
          // Only in remote
          mergedProducts.push(remoteProduct);
        } else if (!remoteProduct) {
          // Only in local
          mergedProducts.push(localProduct);
        } else {
          // Merge based on field selections
          const merged = { id }; // Start with ID
          
          const fieldsToMerge = ['name', 'price', 'description', 'category', 'stock', 'isNew', 'discount', 'image'];
          
          for (const field of fieldsToMerge) {
            if (selections.hasOwnProperty(field)) {
              // User made a selection for this field
              merged[field] = selections[field] ? localProduct[field] : remoteProduct[field];
            } else {
              // No selection - default to local
              merged[field] = localProduct[field] !== undefined ? localProduct[field] : remoteProduct[field];
            }
          }
          
          mergedProducts.push(merged);
        }
      }
      
      // Write merged content
      const mergedContent = JSON.stringify(mergedProducts, null, 2);
      await fs.writeFile(productsFilePath, mergedContent, 'utf-8');
      
      // Stage the resolved file
      await this.git.add('products.json');
      
      // Complete the merge if in merge state
      if (!isStashConflict) {
        try {
          await this.git.raw(['commit', '--no-edit']);
        } catch (commitError) {
          console.log('No merge commit needed:', commitError.message);
        }
      }
      
      return {
        success: true,
        resolved: true,
        resolution: 'custom',
        message: `Resolved conflicts with custom field selections for ${Object.keys(selectionsByProduct).length} product(s)`
      };
    } catch (error) {
      console.error('Failed to resolve with field selections:', error);
      return {
        success: false,
        error: error.message,
        message: `Failed to resolve conflicts: ${error.message}`
      };
    }
  }

  /**
   * Logs current git state for debugging
   */
  async logGitState() {
    try {
      const status = await this.git.status();
      console.log('=== GIT STATE ===');
      console.log('Branch:', status.current);
      console.log('Tracking:', status.tracking);
      console.log('Modified:', status.modified);
      console.log('Staged:', status.staged);
      console.log('Conflicted:', status.conflicted);
      console.log('Is clean:', status.isClean());
      console.log('================');
    } catch (error) {
      console.error('Could not log git state:', error);
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
      // Check for and remove stale lock files first
      await this.removeStaleLockFiles();
      
      const statusSummary = await this.git.status();
      const conflictedFiles = files || statusSummary.conflicted || [];

      if (conflictedFiles.length === 0) {
        return {
          success: true,
          message: 'No conflicts to resolve'
        };
      }

      if (resolution === 'abort') {
        // Check if we're actually in a merge state before aborting
        const fs = await import('fs/promises');
        const path = await import('path');
        const mergeHeadPath = path.join(this.projectPath, '.git', 'MERGE_HEAD');
        
        try {
          await fs.access(mergeHeadPath);
          // MERGE_HEAD exists, we can abort the merge
          await this.git.raw(['merge', '--abort']);
          return {
            success: true,
            aborted: true,
            message: 'Merge aborted, returned to previous state'
          };
        } catch (error) {
          // MERGE_HEAD doesn't exist - this is a stash-pop conflict, not a merge
          console.log('No active merge found. This is a stash conflict - cleaning up...');
          
          // For stash conflicts on cancel, we restore to a clean state:
          // Strategy: Keep the user's local working directory version (before the conflict)
          // by using `git checkout --ours` to take the local version and remove conflict markers
          
          const fs = await import('fs/promises');
          const path = await import('path');
          
          for (const file of conflictedFiles) {
            try {
              const filePath = path.join(this.projectPath, file);
              
              // Read the conflicted file
              const content = await fs.readFile(filePath, 'utf-8');
              
              // Check if file has conflict markers
              if (content.includes('<<<<<<<') && content.includes('>>>>>>>')) {
                console.log(`Removing conflict markers from ${file}, keeping local version...`);
                
                // Extract the LOCAL version (between <<<<<<< and =======)
                // This is the user's working directory version before they tried to publish
                const localVersionMatch = content.match(/<<<<<<< (?:HEAD|Updated upstream|ours)\n([\s\S]*?)\n=======/);
                
                if (localVersionMatch) {
                  const localVersion = localVersionMatch[1];
                  
                  // Write the local version back (removes conflict markers)
                  await fs.writeFile(filePath, localVersion, 'utf-8');
                  console.log(`Restored local version of ${file} (conflict markers removed)`);
                } else {
                  // Fallback: if we can't parse, use git checkout --ours (keeps working tree version)
                  await this.git.raw(['checkout', '--ours', file]);
                  console.log(`Used git checkout --ours for ${file}`);
                }
              } else {
                console.log(`${file} has no conflict markers, leaving as-is`);
              }
              
              // Now reset the index (unstage) but keep the cleaned working directory file
              await this.git.raw(['reset', 'HEAD', file]);
              
            } catch (fileError) {
              console.log(`Error processing ${file}:`, fileError.message);
              // Fallback: restore from HEAD completely (lose local changes for this file)
              try {
                await this.git.raw(['checkout', 'HEAD', file]);
                console.log(`Restored ${file} from HEAD as fallback`);
              } catch (checkoutError) {
                console.log(`Could not restore ${file}:`, checkoutError.message);
              }
            }
          }
          
          // Clear any stash state
          try {
            // Drop the stash that caused the conflict (stash@{0})
            await this.git.raw(['stash', 'drop']);
            console.log('Dropped conflicting stash');
          } catch (dropError) {
            console.log('No stash to drop or already dropped');
          }
          
          return {
            success: true,
            aborted: true,
            message: 'Conflict resolution cancelled. Your local changes are preserved.'
          };
        }
      }

      // Resolve conflicts by choosing a version or smart merging
      for (const file of conflictedFiles) {
        if (resolution === 'merge' && file.includes('products.json')) {
          // Smart merge for products.json
          console.log('Performing smart merge for products.json...');
          
          try {
            // Get local and remote versions - try multiple refs
            let localContent = null;
            let remoteContent = null;
            
            // Get local version (HEAD or current file)
            try {
              localContent = await this.git.show(['HEAD:' + file]);
            } catch (e) {
              console.log('Could not get HEAD version, reading current file');
              const fs = await import('fs/promises');
              const path = await import('path');
              const filePath = path.join(this.projectPath, file);
              
              // Read the conflicted file and extract local version
              const conflictedContent = await fs.readFile(filePath, 'utf-8');
              const localMatch = conflictedContent.match(/<<<<<<< (HEAD|Updated upstream|ours)\n([\s\S]*?)\n=======/);
              if (localMatch) {
                localContent = localMatch[2];
              }
            }
            
            // Get remote version - try MERGE_HEAD, then stash, then extract from conflict markers
            try {
              remoteContent = await this.git.show(['MERGE_HEAD:' + file]);
            } catch (e) {
              try {
                remoteContent = await this.git.show(['refs/stash@{0}:' + file]);
                console.log('Got remote content from stash');
              } catch (e2) {
                console.log('Could not get remote version from refs, extracting from conflict markers');
                const fs = await import('fs/promises');
                const path = await import('path');
                const filePath = path.join(this.projectPath, file);
                
                // Read the conflicted file and extract remote version
                const conflictedContent = await fs.readFile(filePath, 'utf-8');
                const remoteMatch = conflictedContent.match(/=======\n([\s\S]*?)\n>>>>>>> /);
                if (remoteMatch) {
                  remoteContent = remoteMatch[1];
                }
              }
            }
            
            if (localContent && remoteContent) {
              // Try to get the base/original version for 3-way merge
              let baseContent = null;
              try {
                // Try to get the merge-base (common ancestor)
                const mergeBase = await this.git.raw(['merge-base', 'HEAD', 'refs/stash@{0}']);
                if (mergeBase) {
                  baseContent = await this.git.show([mergeBase.trim() + ':' + file]);
                  console.log('Got base version from merge-base for 3-way merge');
                }
              } catch (e) {
                console.log('Could not get merge-base, will do 2-way merge:', e.message);
              }
              
              // Perform smart merge
              const mergeResult = this.smartMergeProducts(localContent, remoteContent, baseContent);
              
              if (mergeResult.success) {
                // Write merged content to file
                const fs = await import('fs/promises');
                const path = await import('path');
                const filePath = path.join(this.projectPath, file);
                
                await fs.writeFile(filePath, mergeResult.mergedContent, 'utf8');
                console.log('Smart merge successful:', mergeResult.mergeLog);
                
                // Stage the resolved file
                await this.git.add(file);
              } else {
                // Smart merge failed, fall back to local version
                console.error('Smart merge failed, using local version:', mergeResult.error);
                await this.git.raw(['checkout', '--ours', file]);
                await this.git.add(file);
              }
            } else {
              console.error('Could not get both versions for smart merge, falling back to local');
              await this.git.raw(['checkout', '--ours', file]);
              await this.git.add(file);
            }
          } catch (mergeError) {
            console.error('Error during smart merge:', mergeError);
            // Fall back to local version
            await this.git.raw(['checkout', '--ours', file]);
            await this.git.add(file);
          }
        } else if (resolution === 'local') {
          // Keep local version
          // IMPORTANT: Check if this is a merge conflict or stash pop conflict
          // In merge: --ours = local, --theirs = remote
          // In stash pop: --ours = remote (what we just pulled), --theirs = local (stashed changes)
          const fs = await import('fs/promises');
          const path = await import('path');
          const mergeHeadPath = path.join(this.projectPath, '.git', 'MERGE_HEAD');
          
          let isStashConflict = false;
          try {
            await fs.access(mergeHeadPath);
            // MERGE_HEAD exists, this is a normal merge conflict
            isStashConflict = false;
          } catch (error) {
            // No MERGE_HEAD, this is a stash pop conflict
            isStashConflict = true;
          }
          
          if (isStashConflict) {
            // Stash pop conflict: --theirs = local changes (what we want)
            await this.git.raw(['checkout', '--theirs', file]);
          } else {
            // Normal merge: --ours = local changes (what we want)
            await this.git.raw(['checkout', '--ours', file]);
          }
          await this.git.add(file);
        } else if (resolution === 'remote') {
          // Keep remote version (GitHub)
          // IMPORTANT: Check if this is a merge conflict or stash pop conflict
          const fs = await import('fs/promises');
          const path = await import('path');
          const mergeHeadPath = path.join(this.projectPath, '.git', 'MERGE_HEAD');
          
          let isStashConflict = false;
          try {
            await fs.access(mergeHeadPath);
            // MERGE_HEAD exists, this is a normal merge conflict
            isStashConflict = false;
          } catch (error) {
            // No MERGE_HEAD, this is a stash pop conflict
            isStashConflict = true;
          }
          
          if (isStashConflict) {
            // Stash pop conflict: --ours = remote changes (what we want)
            await this.git.raw(['checkout', '--ours', file]);
          } else {
            // Normal merge: --theirs = remote changes (what we want)
            await this.git.raw(['checkout', '--theirs', file]);
          }
          await this.git.add(file);
        }
      }

      // Try to complete the merge if MERGE_HEAD exists
      try {
        await this.git.raw(['commit', '--no-edit']);
        console.log('Merge commit completed');
      } catch (commitError) {
        // If commit fails, it might be because we're not in a merge
        // (e.g., stash pop conflict). That's okay - files are resolved and staged.
        console.log('No merge commit needed:', commitError.message);
      }

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
