// CommonJS version for better compatibility with electron-builder
const { app, BrowserWindow, ipcMain, dialog, protocol, Menu } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const os = require('os');

// Detect portable mode - check early before any updater logic
const isPortable = process.execPath && process.execPath.toLowerCase().includes('portable');

// Completely disable auto-updater for portable builds
let autoUpdater = null;
// DO NOT load electron-updater for portable builds at all

// Prevent multiple instances - ensure only one instance runs at a time
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running. Quitting...');
  app.quit();
  process.exit(0);
}

// Global error handlers to ensure clean exit on fatal errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  try {
    dialog.showErrorBox('Fatal Error', err.stack || err.message || String(err));
  } catch (e) {
    console.error('Failed to show error dialog:', e);
  }
  // Force kill all windows and quit
  BrowserWindow.getAllWindows().forEach(win => {
    try { win.destroy(); } catch (e) {}
  });
  setTimeout(() => {
    app.quit();
    process.exit(1);
  }, 100);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  try {
    dialog.showErrorBox('Fatal Error', reason && reason.stack ? reason.stack : String(reason));
  } catch (e) {
    console.error('Failed to show error dialog:', e);
  }
  // Force kill all windows and quit
  BrowserWindow.getAllWindows().forEach(win => {
    try { win.destroy(); } catch (e) {}
  });
  setTimeout(() => {
    app.quit();
    process.exit(1);
  }, 100);
});

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, focus our window instead
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

let mainWindow;

function createWindow() {
  // Remove the default menu bar completely
  Menu.setApplicationMenu(null);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  if (!app.isPackaged) {
    // Development mode - load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
    
    // Test Git detection on startup (dev mode only)
    mainWindow.webContents.on('did-finish-load', async () => {
      console.log('=== TESTING GIT DETECTION ===');
      const gitPath = findGitPath();
      console.log('Git path found:', gitPath);
      
      // Try to actually call Git
      if (gitPath) {
        try {
          const simpleGit = (await import('simple-git')).default;
          const gitOptions = gitPath !== 'git' ? { binary: gitPath } : {};
          const git = simpleGit(gitOptions);
          const version = await git.version();
          console.log('Git version check successful:', version);
        } catch (error) {
          console.error('Git version check failed:', error.message);
        }
      }
      console.log('=== GIT DETECTION TEST COMPLETE ===');
    });
  } else {
    // Production mode - load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    
    // Test Git detection on startup (production mode)
    mainWindow.webContents.on('did-finish-load', async () => {
      console.log('=== PRODUCTION MODE - TESTING GIT DETECTION ===');
      console.log('Is Portable:', isPortable);
      console.log('Is Packaged:', app.isPackaged);
      console.log('Process PATH:', process.env.PATH);
      console.log('__dirname:', __dirname);
      
      const gitPath = findGitPath();
      console.log('Git path found:', gitPath);
      
      // Try to actually call Git
      if (gitPath) {
        try {
          const simpleGit = (await import('simple-git')).default;
          const gitOptions = gitPath !== 'git' ? { binary: gitPath } : {};
          console.log('Git options:', gitOptions);
          const git = simpleGit(gitOptions);
          const version = await git.version();
          console.log('Git version check successful:', version);
        } catch (error) {
          console.error('Git version check failed:', error.message);
          console.error('Error stack:', error.stack);
        }
      } else {
        console.error('Git path is null - Git not found');
      }
      console.log('=== GIT DETECTION TEST COMPLETE ===');
    });
    
    // Check for updates after window loads (skip for portable)
    if (autoUpdater && !isPortable) {
      mainWindow.webContents.on('did-finish-load', () => {
        checkForUpdates();
      });
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle crashes and unresponsiveness
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('Window crashed!', { killed });
    const options = {
      type: 'error',
      title: 'Application Crashed',
      message: 'The application has crashed. Do you want to restart?',
      buttons: ['Restart', 'Close']
    };
    dialog.showMessageBox(options).then((result) => {
      if (result.response === 0) {
        app.relaunch();
        app.quit();
      } else {
        app.quit();
      }
    });
  });
  
  mainWindow.on('unresponsive', () => {
    console.warn('Window became unresponsive');
    const options = {
      type: 'warning',
      title: 'Application Not Responding',
      message: 'The application is not responding. Do you want to wait or close?',
      buttons: ['Wait', 'Close']
    };
    dialog.showMessageBox(options).then((result) => {
      if (result.response === 1) {
        mainWindow.destroy();
        app.quit();
      }
    });
  });
}

// IPC Handlers for File System Operations

/**
 * Check if project path exists and is accessible
 */
ipcMain.handle('fs:checkProjectPath', async (event, projectPath) => {
  try {
    if (!projectPath) {
      return { exists: false, isDirectory: false, hasGitRepo: false, error: 'No path provided' };
    }
    
    const exists = await fs.pathExists(projectPath);
    if (!exists) {
      return { exists: false, isDirectory: false, hasGitRepo: false, error: 'Path does not exist' };
    }
    
    const stats = await fs.stat(projectPath);
    const isDirectory = stats.isDirectory();
    
    // Check if it's a git repository
    let hasGitRepo = false;
    if (isDirectory) {
      const gitPath = path.join(projectPath, '.git');
      hasGitRepo = await fs.pathExists(gitPath);
    }
    
    return { exists: true, isDirectory, hasGitRepo, error: null };
  } catch (error) {
    return { exists: false, isDirectory: false, hasGitRepo: false, error: error.message };
  }
});

/**
 * Empty a directory (delete all contents but keep the folder)
 */
ipcMain.handle('fs:emptyDirectory', async (event, dirPath) => {
  try {
    console.log('Emptying directory:', dirPath);
    await fs.emptyDir(dirPath);
    console.log('Directory emptied successfully');
    return { success: true };
  } catch (error) {
    console.error('Error emptying directory:', error);
    return { success: false, message: error.message };
  }
});

/**
 * Create empty products.json file at the specified path
 */
ipcMain.handle('fs:createEmptyProducts', async (event, projectPath) => {
  try {
    const productsFilePath = path.join(projectPath, 'products.json');
    
    // Ensure directory exists
    await fs.ensureDir(projectPath);
    
    // Create empty products.json
    await fs.writeJSON(productsFilePath, [], { spaces: 2, encoding: 'utf8' });
    
    return { success: true, path: productsFilePath };
  } catch (error) {
    console.error('Error creating products.json:', error);
    throw error;
  }
});

ipcMain.handle('fs:loadProducts', async (event, projectPath) => {
  const productsFilePath = path.join(projectPath, 'products.json');
  
  try {
    // Check if file exists
    const exists = await fs.pathExists(productsFilePath);
    
    if (!exists) {
      // Auto-create empty products.json for first-time users
      console.log('products.json not found, creating empty file...');
      await fs.ensureDir(projectPath);
      await fs.writeJSON(productsFilePath, [], { spaces: 2, encoding: 'utf8' });
      return [];
    }
    
    // Read and parse products.json with UTF-8 encoding
    const products = await fs.readJSON(productsFilePath, { encoding: 'utf8' });
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    // If it's a parse error or other issue, try to create empty file
    if (error.code === 'ENOENT' || error.name === 'SyntaxError') {
      console.log('Creating empty products.json due to error...');
      try {
        await fs.ensureDir(projectPath);
        await fs.writeJSON(productsFilePath, [], { spaces: 2, encoding: 'utf8' });
        return [];
      } catch (createError) {
        console.error('Failed to create products.json:', createError);
        throw new Error('PRODUCTS_NOT_FOUND: ' + productsFilePath);
      }
    }
    throw error;
  }
});

ipcMain.handle('fs:saveProducts', async (event, projectPath, products) => {
  try {
    const productsFilePath = path.join(projectPath, 'products.json');
    
    // Custom replacer to preserve .00 format for price and discountedPrice
    const replacer = (key, value) => {
      // If the key is 'price' or 'discountedPrice' and the value is a number
      if ((key === 'price' || key === 'discountedPrice') && typeof value === 'number') {
        // Return the number as-is (will be handled by JSON.stringify with proper formatting)
        return parseFloat(value.toFixed(2));
      }
      return value;
    };
    
    // Convert to JSON string with custom formatting to preserve .00
    const jsonString = JSON.stringify(products, replacer, 2);
    
    // Use regex to ensure price and discountedPrice always have 2 decimal places
    const formattedJsonString = jsonString.replace(
      /"(price|discountedPrice)":\s*(\d+(?:\.\d{1,2})?)/g,
      (match, fieldName, number) => {
        const num = parseFloat(number);
        return `"${fieldName}": ${num.toFixed(2)}`;
      }
    );
    
    // Write the formatted JSON to file
    await fs.writeFile(productsFilePath, formattedJsonString, 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
});

/**
 * IPC Handler to get absolute path for image
 * Resolves relative image paths (e.g., "images/product-1.jpg") to absolute paths
 */
ipcMain.handle('fs:getImagePath', async (event, projectPath, relativePath) => {
  try {
    if (!relativePath) {
      return null;
    }
    
    // Handle data URLs - return as is
    if (relativePath.startsWith('data:')) {
      return relativePath;
    }
    
    // Handle already resolved URLs
    if (relativePath.startsWith('local-image://') || relativePath.startsWith('file://')) {
      return relativePath;
    }
    
    // Resolve relative path to absolute path
    const absolutePath = path.join(projectPath, relativePath);
    
    // Check if file exists
    const exists = await fs.pathExists(absolutePath);
    
    if (!exists) {
      console.warn(`Image not found: ${absolutePath}`);
      return null;
    }
    
    // Return custom protocol URL that works in both dev and production
    // Use forward slashes and encode the path
    const normalizedPath = absolutePath.replace(/\\/g, '/');
    return `local-image://${normalizedPath}`;
  } catch (error) {
    console.error('Error resolving image path:', error);
    return null;
  }
});

// Image Processing Handlers

/**
 * Process a product image: resize if needed, convert to WebP format
 * Accepts any image format (JPEG, PNG, WebP, AVIF) and converts to WebP
 * @param {Buffer} imageBuffer - Image data as Buffer (any format)
 * @param {string} projectPath - Project root path
 * @param {number} productId - Product ID
 * @param {string} imageType - 'primary' or 'gallery'
 * @param {number|null} index - Gallery image index (null for primary)
 * @returns {Promise<string>} Path to WebP file (relative to project root)
 */
async function processProductImage(imageBuffer, projectPath, productId, imageType, index = null) {
  try {
    // Create images directory if it doesn't exist
    const imagesDir = path.join(projectPath, 'images');
    await fs.ensureDir(imagesDir);

    // Generate base filename
    const baseName = imageType === 'primary' 
      ? `product-${productId}-primary`
      : `product-${productId}-gallery-${index}`;

    // Load image with Sharp from buffer (Sharp auto-detects format: JPEG, PNG, WebP, AVIF, etc.)
    let image = sharp(imageBuffer);
    
    // Get metadata to check dimensions
    const metadata = await image.metadata();
    
    // Resize if image is larger than 2000x2000px
    if (metadata.width > 2000 || metadata.height > 2000) {
      image = image.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Process and save as WebP only (converts from any input format)
    const webpPath = path.join(imagesDir, `${baseName}.webp`);

    await image.webp({ quality: 85 }).toFile(webpPath);

    // Return the relative path to the WebP file
    // Using forward slashes for consistency across platforms
    return `images/${baseName}.webp`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * IPC Handler for image processing
 */
ipcMain.handle('image:process', async (event, imageData, projectPath, productId, imageType, index) => {
  try {
    // Convert base64 data URL to buffer
    const base64Data = imageData.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const imagePath = await processProductImage(imageBuffer, projectPath, productId, imageType, index);
    return { success: true, path: imagePath };
  } catch (error) {
    console.error('Image processing error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler for deleting old image files
 */
ipcMain.handle('image:delete', async (event, projectPath, imagePath) => {
  try {
    if (!imagePath) return { success: true };

    // Extract base name (without extension)
    const ext = path.extname(imagePath);
    const basePath = imagePath.slice(0, -ext.length);
    const fullPath = path.join(projectPath, basePath) + '.webp';

    // Delete WebP file
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler for bulk deleting product images
 * @param {string} projectPath - Project root path
 * @param {number} productId - Product ID
 * @param {string} imageType - 'all', 'primary', or 'gallery'
 * @returns {Promise<{success: boolean, deletedCount: number, error?: string}>}
 */
ipcMain.handle('image:deleteProductImages', async (event, projectPath, productId, imageType = 'all') => {
  try {
    const imagesDir = path.join(projectPath, 'images');
    
    // Check if images directory exists
    const dirExists = await fs.pathExists(imagesDir);
    if (!dirExists) {
      return { success: true, deletedCount: 0 };
    }

    // Read all files in the images directory
    const files = await fs.readdir(imagesDir);
    
    // Build pattern for matching files
    let patterns = [];
    if (imageType === 'all') {
      // Match all files for this product
      patterns.push(`product-${productId}-primary.`);
      patterns.push(`product-${productId}-gallery-`);
    } else if (imageType === 'primary') {
      // Match only primary images
      patterns.push(`product-${productId}-primary.`);
    } else if (imageType === 'gallery') {
      // Match only gallery images
      patterns.push(`product-${productId}-gallery-`);
    } else {
      throw new Error(`Invalid imageType: ${imageType}`);
    }

    // Filter files that match the patterns
    const matchingFiles = files.filter(file => {
      return patterns.some(pattern => file.startsWith(pattern));
    });

    // Delete all matching files
    let deletedCount = 0;
    await Promise.all(
      matchingFiles.map(async (file) => {
        const filePath = path.join(imagesDir, file);
        try {
          await fs.remove(filePath);
          deletedCount++;
        } catch (err) {
          console.warn(`Failed to delete file ${file}:`, err);
        }
      })
    );

    return { success: true, deletedCount };
  } catch (error) {
    console.error('Error deleting product images:', error);
    return { success: false, deletedCount: 0, error: error.message };
  }
});

// Settings and GitHub Integration Handlers

/**
 * IPC Handler for browsing directory
 */
ipcMain.handle('settings:browseDirectory', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Local Git Repository Folder'
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    console.error('Error browsing directory:', error);
    throw error;
  }
});

/**
 * IPC Handler for saving settings
 */
ipcMain.handle('settings:save', async (event, config) => {
  try {
    // Dynamically import the ES module
    const { getConfigService } = await import('../src/services/configService.js');
    const configService = getConfigService();
    
    const success = configService.saveConfig(config);
    
    if (success) {
      console.log('Settings saved to:', configService.getConfigPath());
      return { success: true, message: 'Settings saved successfully' };
    } else {
      return { success: false, message: 'Failed to save settings' };
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, message: error.message };
  }
});

/**
 * Finds Git executable path on Windows
 * Checks common installation paths when Git is not in PATH
 * @returns {string|null} - Path to git.exe or null if not found
 */
function findGitPath() {
  console.log('[findGitPath] Starting Git detection...');
  
  const { existsSync } = require('fs');
  const { join } = require('path');
  
  // Common Git installation paths on Windows (check these FIRST before trying PATH)
  const commonPaths = [
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
    'C:\\Program Files\\Git\\bin\\git.exe',
    'C:\\Program Files (x86)\\Git\\bin\\git.exe',
    join(process.env.LOCALAPPDATA || '', 'Programs', 'Git', 'cmd', 'git.exe'),
    join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Git', 'cmd', 'git.exe'),
    join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Git', 'cmd', 'git.exe'),
  ];

  // Check common installation paths FIRST (more reliable in portable mode)
  console.log('[findGitPath] Checking', commonPaths.length, 'common paths...');
  for (const gitPath of commonPaths) {
    try {
      console.log('[findGitPath] Checking:', gitPath);
      if (existsSync(gitPath)) {
        console.log('[findGitPath] ✓ Found Git at:', gitPath);
        return gitPath;
      }
    } catch (error) {
      console.log('[findGitPath] Error checking path:', gitPath, '-', error.message);
      continue;
    }
  }

  // If not found in common paths, try PATH as fallback
  console.log('[findGitPath] Not found in common paths, checking PATH...');
  try {
    const { execSync } = require('child_process');
    execSync('git --version', { stdio: 'ignore' });
    console.log('[findGitPath] ✓ Git found in PATH');
    return 'git'; // Git is in PATH
  } catch (error) {
    console.log('[findGitPath] Git not in PATH:', error.message);
  }

  console.log('[findGitPath] ✗ Git not found anywhere');
  return null;
}

/**
 * IPC Handler for loading settings
 */
ipcMain.handle('settings:load', async (event) => {
  try {
    // Dynamically import the ES module
    const { getConfigService } = await import('../src/services/configService.js');
    const configService = getConfigService();
    
    const config = configService.getConfigForDisplay();
    return config;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
});

/**
 * IPC Handler for checking if Git is installed on the system
 */
ipcMain.handle('git:checkInstallation', async () => {
  const debugLogs = []; // Collect logs to send back
  const log = (msg) => {
    console.log(msg);
    debugLogs.push(msg);
  };
  
  try {
    log('[git:checkInstallation] Starting Git detection...');
    
    // Find Git executable path first
    const gitPath = findGitPath();
    log('[git:checkInstallation] findGitPath() returned: ' + gitPath);
    
    if (!gitPath) {
      return {
        success: false,
        installed: false,
        version: null,
        message: 'Git is not installed on this system. Please install Git to use GitHub features.',
        error: 'Git executable not found',
        debugLogs: debugLogs
      };
    }
    
    // Instead of importing GitService, use simple-git directly
    log('[git:checkInstallation] Importing simple-git...');
    const simpleGit = (await import('simple-git')).default;
    log('[git:checkInstallation] simple-git imported successfully');
    
    // Create git instance with the found path
    const gitOptions = gitPath !== 'git' ? { 
      binary: gitPath,
      unsafe: {
        allowUnsafeCustomBinary: true  // Allow paths with spaces like "C:\Program Files\Git\cmd\git.exe"
      }
    } : {};
    log('[git:checkInstallation] Git options: ' + JSON.stringify(gitOptions));
    
    const git = simpleGit(gitOptions);
    log('[git:checkInstallation] Calling git.version()...');
    
    // Try to get Git version
    const version = await git.version();
    log('[git:checkInstallation] Git version result: ' + JSON.stringify(version));
    
    const versionString = version.installed ? `${version.major}.${version.minor}.${version.patch}` : 'unknown';
    
    return {
      success: true,
      installed: true,
      version: versionString,
      gitVersion: version,
      gitPath: gitPath,
      message: `Git is installed (version ${versionString})`,
      debugLogs: debugLogs
    };
    
  } catch (error) {
    log('[git:checkInstallation] ERROR: ' + error.message);
    console.error('Error checking Git installation:', error);
    
    // Check if it's a "git not found" error
    if (error.message && (
        error.message.includes('spawn git ENOENT') || 
        error.message.includes('git: command not found') ||
        error.message.includes('not recognized as an internal or external command'))) {
      return {
        success: false,
        installed: false,
        version: null,
        message: 'Git is not installed on this system. Please install Git to use GitHub features.',
        error: error.message,
        debugLogs: debugLogs
      };
    }
    
    return {
      success: false,
      installed: false,
      version: null,
      message: 'Failed to check Git installation: ' + error.message,
      error: error.message,
      debugLogs: debugLogs,
      errorStack: error.stack
    };
  }
});

/**
 * IPC Handler for testing GitHub connection
 */
ipcMain.handle('settings:testConnection', async (event, config) => {
  try {
    // Dynamically import the ES modules
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    
    // Get the full config with decrypted token
    let fullConfig = configService.getConfigWithToken() || {};
    
    // If a new token is provided, use it instead
    if (config.token && config.token !== '••••••••') {
      fullConfig = {
        ...fullConfig,
        ...config,
        token: config.token
      };
    } else {
      // Merge with provided config but keep existing token
      fullConfig = {
        ...fullConfig,
        ...config
      };
    }
    
    // Validate we have all required fields
    if (!fullConfig.projectPath) {
      return {
        success: false,
        message: 'Please select a local project path'
      };
    }
    
    // Find Git executable path
    const gitPath = findGitPath();
    
    // Create GitService instance
    const gitService = new GitService(fullConfig.projectPath, {
      username: fullConfig.username,
      token: fullConfig.token,
      repoUrl: fullConfig.repoUrl,
      gitPath: gitPath
    });
    
    // Test the connection
    const result = await gitService.testConnection();
    return result;
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      success: false,
      message: `Connection test failed: ${error.message}`
    };
  }
});

/**
 * IPC Handler for getting Git repository status
 */
ipcMain.handle('git:getStatus', async (event) => {
  try {
    // Dynamically import the ES modules
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    // Validate we have config and a project path
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured',
        hasChanges: false
      };
    }
    
    // Find Git executable path
    const gitPath = findGitPath();
    
    // Create GitService instance
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    // Get the status
    const status = await gitService.getStatus();
    return {
      success: true,
      ...status
    };
  } catch (error) {
    console.error('Error getting git status:', error);
    return {
      success: false,
      message: `Failed to get status: ${error.message}`,
      hasChanges: false
    };
  }
});

/**
 * IPC Handler for validating repository integrity
 * Checks if required files exist in the repository
 */
ipcMain.handle('git:validateRepoIntegrity', async (event, projectPath) => {
  try {
    console.log('Validating repository integrity at:', projectPath);
    
    const requiredFiles = ['products.json'];
    const missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(projectPath, file);
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        missingFiles.push(file);
      }
    }
    
    const hasGitFolder = await fs.pathExists(path.join(projectPath, '.git'));
    
    return {
      success: true,
      hasRequiredFiles: missingFiles.length === 0,
      missingFiles,
      hasGit: hasGitFolder
    };
  } catch (error) {
    console.error('Error validating repository integrity:', error);
    return { 
      success: false, 
      hasRequiredFiles: false, 
      missingFiles: [], // ✅ Always return an array, even on error
      hasGit: false,
      error: error.message 
    };
  }
});

/**
 * IPC Handler for validating remote URL matches configured URL
 */
ipcMain.handle('git:validateGitRemote', async (event, projectPath, expectedUrl) => {
  try {
    console.log('Validating git remote at:', projectPath);
    console.log('Expected URL:', expectedUrl);
    
    const simpleGit = (await import('simple-git')).default;
    const gitPath = findGitPath();
    const gitOptions = gitPath && gitPath !== 'git' ? { 
      binary: gitPath,
      unsafe: { allowUnsafeCustomBinary: true }
    } : {};
    
    const git = simpleGit({ ...gitOptions, baseDir: projectPath });
    
    // Get remotes
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');
    
    if (!origin) {
      return {
        success: false,
        matches: false,
        message: 'No remote named "origin" found'
      };
    }
    
    // Function to clean URL (remove credentials, .git suffix, trailing slashes)
    const cleanUrl = (url) => {
      if (!url) return '';
      
      // Remove credentials from URL (username:token@)
      let cleaned = url.replace(/https?:\/\/[^@]+@/, 'https://');
      
      // Remove .git suffix
      cleaned = cleaned.replace(/\.git$/, '');
      
      // Remove trailing slashes
      cleaned = cleaned.replace(/\/$/, '');
      
      return cleaned.toLowerCase();
    };
    
    const rawCurrentUrl = origin.refs.fetch || origin.refs.push;
    const currentUrl = cleanUrl(rawCurrentUrl);
    const expected = cleanUrl(expectedUrl);
    
    console.log('Current URL (cleaned):', currentUrl);
    console.log('Expected URL (cleaned):', expected);
    
    const matches = currentUrl === expected || 
                   currentUrl.includes(expected) || 
                   expected.includes(currentUrl);
    
    return {
      success: true,
      matches,
      currentUrl: currentUrl, // Return cleaned URL without credentials
      expectedUrl: expected   // Return cleaned expected URL
    };
  } catch (error) {
    console.error('Error validating git remote:', error);
    return { 
      success: false, 
      matches: false, 
      error: error.message 
    };
  }
});

/**
 * IPC Handler for resetting repository to remote state
 * Used to restore deleted files
 */
ipcMain.handle('git:resetRepoToRemote', async (event, projectPath) => {
  try {
    console.log('Resetting repository to remote state:', projectPath);
    
    const simpleGit = (await import('simple-git')).default;
    const gitPath = findGitPath();
    const gitOptions = gitPath && gitPath !== 'git' ? { 
      binary: gitPath,
      unsafe: { allowUnsafeCustomBinary: true }
    } : {};
    
    const git = simpleGit({ ...gitOptions, baseDir: projectPath });
    
    // Fetch latest from remote
    await git.fetch('origin');
    
    // Get default branch
    const branches = await git.branch(['-r']);
    const defaultBranch = branches.all.find(b => b.includes('origin/main')) ? 'main' : 'master';
    
    console.log(`Resetting to origin/${defaultBranch}`);
    
    // Hard reset to remote branch (restores deleted files)
    await git.reset(['--hard', `origin/${defaultBranch}`]);
    
    // Clean untracked files and directories
    await git.clean('f', ['-d']);
    
    return { 
      success: true, 
      message: 'Repository restored from GitHub' 
    };
  } catch (error) {
    console.error('Error resetting repository:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
});

/**
 * IPC Handler for updating git remote URL
 */
ipcMain.handle('git:updateGitRemote', async (event, projectPath, newUrl) => {
  try {
    console.log('Updating git remote URL:', projectPath, '->', newUrl);
    
    const simpleGit = (await import('simple-git')).default;
    const gitPath = findGitPath();
    const gitOptions = gitPath && gitPath !== 'git' ? { 
      binary: gitPath,
      unsafe: { allowUnsafeCustomBinary: true }
    } : {};
    
    const git = simpleGit({ ...gitOptions, baseDir: projectPath });
    
    // Update origin remote URL
    await git.remote(['set-url', 'origin', newUrl]);
    
    console.log('Remote URL updated successfully');
    
    return { 
      success: true, 
      message: 'Remote URL updated successfully' 
    };
  } catch (error) {
    console.error('Error updating git remote:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
});

/**
 * IPC Handler for cloning GitHub repository
 */
ipcMain.handle('git:clone', async (event, targetPath, repoUrl, username, token) => {
  try {
    console.log('=== CLONE HANDLER CALLED ===');
    console.log('Target Path:', targetPath);
    console.log('Repo URL:', repoUrl);
    console.log('Username:', username);
    console.log('Token provided:', token ? 'YES (length: ' + token.length + ')' : 'NO');
    
    // If no token is provided, try to get it from stored config
    if (!token) {
      console.log('No token provided, attempting to retrieve from stored config...');
      try {
        const { getConfigService } = await import('../src/services/configService.js');
        const configService = getConfigService();
        const storedConfig = configService.getConfigWithToken();
        
        if (storedConfig && storedConfig.token) {
          token = storedConfig.token;
          console.log('Retrieved token from stored config (length: ' + token.length + ')');
        } else {
          console.error('No token found in stored config');
          return {
            success: false,
            message: 'GitHub token is required to clone the repository. Please provide a valid token.'
          };
        }
      } catch (error) {
        console.error('Failed to retrieve stored token:', error);
        return {
          success: false,
          message: 'GitHub token is required to clone the repository. Please provide a valid token.'
        };
      }
    }
    
    const simpleGit = (await import('simple-git')).default;
    
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
    
    // Find Git executable path
    const gitPath = findGitPath();
    console.log('Using Git path:', gitPath);
    
    // Configure simple-git with custom Git path if found
    const gitOptions = gitPath && gitPath !== 'git' ? { 
      binary: gitPath,
      unsafe: {
        allowUnsafeCustomBinary: true  // Allow paths with spaces
      }
    } : {};

    // Check if target path exists
    const pathExists = await fs.pathExists(targetPath);
    
    if (pathExists) {
      // Check if directory is empty
      const files = await fs.readdir(targetPath);
      const nonHiddenFiles = files.filter(f => !f.startsWith('.'));
      
      if (nonHiddenFiles.length > 0) {
        // Directory exists and has files - ask user if they want to delete
        console.log('Directory is not empty, asking user for confirmation');
        
        const result = await dialog.showMessageBox({
          type: 'warning',
          title: 'Directory Not Empty',
          message: 'The selected folder is not empty',
          detail: `The folder "${targetPath}" contains ${nonHiddenFiles.length} item(s). Do you want to delete all contents and continue?`,
          buttons: ['Delete and Continue', 'Cancel'],
          defaultId: 1, // Default to Cancel for safety
          cancelId: 1
        });
        
        if (result.response === 1) {
          // User clicked Cancel
          return {
            success: false,
            message: 'Clone operation cancelled by user.'
          };
        }
        
        // User clicked "Delete and Continue" - remove all contents
        console.log('User confirmed deletion, removing directory contents');
        await fs.emptyDir(targetPath);
        console.log('Directory emptied successfully');
      }
      
      // Directory is now empty - use init + remote + pull approach
      console.log('Directory is empty, using init + pull approach');
      
      const git = simpleGit({ ...gitOptions, baseDir: targetPath });
      
      // Initialize repository
      await git.init();
      console.log('Git initialized');
      
      // Add remote
      await git.addRemote('origin', authenticatedUrl);
      console.log('Remote added');
      
      // Fetch all branches
      await git.fetch('origin');
      console.log('Fetched from origin');
      
      // Get the default branch name
      const branches = await git.branch(['-r']);
      const defaultBranch = branches.all.find(b => b.includes('origin/main')) ? 'main' : 'master';
      console.log(`Using branch: ${defaultBranch}`);
      
      // Set up tracking and pull
      await git.checkoutBranch(defaultBranch, `origin/${defaultBranch}`);
      console.log('Checked out branch');
    } else {
      // Directory doesn't exist - create parent and use normal clone
      const parentDir = path.dirname(targetPath);
      await fs.ensureDir(parentDir);
      
      console.log('Cloning to new directory');
      await simpleGit(gitOptions).clone(authenticatedUrl, targetPath);
    }

    console.log('Repository cloned successfully');

    return {
      success: true,
      message: `Repository cloned successfully to ${targetPath}`,
      path: targetPath
    };
  } catch (error) {
    console.error('Error cloning repository:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      targetPath,
      repoUrl
    });
    return {
      success: false,
      message: `Failed to clone repository: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for publishing changes to GitHub
 */
ipcMain.handle('git:publish', async (event, commitMessage = null, files = null) => {
  try {
    // Dynamically import the ES modules
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    // Validate we have config and a project path
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured. Please configure your project in Settings.'
      };
    }

    // Validate we have GitHub credentials
    if (!config.username || !config.token || !config.repoUrl) {
      return {
        success: false,
        message: 'GitHub credentials not configured. Please set up your GitHub connection in Settings.'
      };
    }
    
    // Find Git executable path
    const gitPath = findGitPath();
    
    // Create GitService instance
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    // Execute the publish workflow with optional selective files
    const result = await gitService.publishChanges(commitMessage, files);
    return result;
  } catch (error) {
    console.error('Error publishing to GitHub:', error);
    return {
      success: false,
      message: `Failed to publish: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for restoring a specific file to its last committed state
 */
ipcMain.handle('git:restoreFile', async (event, filePath) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    // Find Git executable path
    const gitPath = findGitPath();
    
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.restoreFile(filePath);
    return result;
  } catch (error) {
    console.error('Error restoring file:', error);
    return {
      success: false,
      message: `Failed to restore file: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for undoing a specific product change
 */
ipcMain.handle('git:undoProductChange', async (event, productChange) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    // Find Git executable path
    const gitPath = findGitPath();
    
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.undoProductChange(productChange);
    return result;
  } catch (error) {
    console.error('Error undoing product change:', error);
    return {
      success: false,
      message: `Failed to undo product change: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for checking remote changes (without pulling)
 */
ipcMain.handle('git:checkRemoteChanges', async (event) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.checkForRemoteChanges();
    return result;
  } catch (error) {
    console.error('Error checking remote changes:', error);
    return {
      success: false,
      message: `Failed to check remote changes: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for pulling changes with strategy for local changes
 * Supports: auto (ask user), stash (save+restore), commit, force (discard)
 */
ipcMain.handle('git:pullWithStrategy', async (event, strategy = 'auto') => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const simpleGit = (await import('simple-git')).default;
    const gitPath = findGitPath();
    const gitOptions = gitPath && gitPath !== 'git' ? { 
      binary: gitPath,
      unsafe: { allowUnsafeCustomBinary: true }
    } : {};
    
    const git = simpleGit({ ...gitOptions, baseDir: config.projectPath });
    
    // Check for uncommitted changes
    const status = await git.status();
    const changedFiles = [...status.modified, ...status.not_added, ...status.created];
    
    if (status.isClean()) {
      // No local changes - simple pull
      await git.pull();
      return { 
        success: true, 
        message: 'Pulled latest changes from GitHub' 
      };
    }
    
    // Has local changes - handle based on strategy
    switch (strategy) {
      case 'stash':
        // Save, pull, restore
        await git.stash(['push', '-m', 'Auto-stash before pull']);
        await git.pull();
        try {
          await git.stash(['pop']);
          return { 
            success: true, 
            message: 'Pulled and restored your local changes' 
          };
        } catch {
          return { 
            success: true, 
            hasConflict: true,
            message: 'Pulled, but your changes conflict with updates. Please review.' 
          };
        }
        
      case 'commit':
        // Commit first, then pull
        await git.add('./*');
        await git.commit('Auto-save: Local changes before sync');
        await git.pull();
        return { 
          success: true, 
          message: 'Saved your changes and pulled updates' 
        };
        
      case 'force':
        // Discard local, match remote
        await git.fetch('origin');
        const branches = await git.branch(['-r']);
        const defaultBranch = branches.all.find(b => b.includes('origin/main')) ? 'main' : 'master';
        await git.reset(['--hard', `origin/${defaultBranch}`]);
        return { 
          success: true, 
          message: 'Pulled latest (your local changes were discarded)',
          localChangesDiscarded: true 
        };
        
      case 'auto':
      default:
        // Ask user what to do
        return {
          success: false,
          needsUserDecision: true,
          changedFiles,
          message: 'You have local changes. How should we proceed?'
        };
    }
  } catch (error) {
    console.error('Error pulling with strategy:', error);
    return {
      success: false,
      message: `Failed to pull: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for manual pull from GitHub with retry logic
 */
ipcMain.handle('git:pullManual', async (event) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    // Use pull with retry for better reliability
    const result = await gitService.pullWithRetry();
    return result;
  } catch (error) {
    console.error('Error pulling from GitHub:', error);
    return {
      success: false,
      message: `Failed to pull from GitHub: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for getting conflict details
 */
ipcMain.handle('git:getConflictDetails', async (event) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.getConflictDetails();
    return result;
  } catch (error) {
    console.error('Error getting conflict details:', error);
    return {
      success: false,
      message: `Failed to get conflict details: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for resolving conflicts
 */
ipcMain.handle('git:resolveConflict', async (event, resolution, files) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.resolveConflict(resolution, files);
    return result;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return {
      success: false,
      message: `Failed to resolve conflict: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for resolving conflicts with field-level selections
 */
ipcMain.handle('git:resolveConflictWithFieldSelections', async (event, fieldSelections) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.resolveConflictWithFieldSelections(fieldSelections);
    return result;
  } catch (error) {
    console.error('Error resolving conflict with field selections:', error);
    return {
      success: false,
      message: `Failed to resolve conflict: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for continuing publish after conflict resolution
 */
ipcMain.handle('git:continuePublish', async (event, commitMessage = null, files = null) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.continuePublishAfterResolution(commitMessage, files);
    return result;
  } catch (error) {
    console.error('Error continuing publish:', error);
    return {
      success: false,
      message: `Failed to continue publish: ${error.message}`,
      error: error.message
    };
  }
});

/**
 * IPC Handler for checking potential conflicts before publish
 */
ipcMain.handle('git:checkPotentialConflicts', async (event) => {
  try {
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    if (!config || !config.projectPath) {
      return {
        success: false,
        message: 'No project path configured'
      };
    }
    
    const gitPath = findGitPath();
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl,
      gitPath: gitPath
    });
    
    const result = await gitService.checkForPotentialConflicts();
    return result;
  } catch (error) {
    console.error('Error checking potential conflicts:', error);
    return {
      success: false,
      message: `Failed to check for conflicts: ${error.message}`,
      error: error.message
    };
  }
});

// Auto-Updater Configuration and Handlers

/**
 * Configure auto-updater
 */
function setupAutoUpdater() {
  // Completely skip for portable builds
  if (isPortable) {
    console.log('Auto-updater disabled for portable build');
    return;
  }
  
  if (!autoUpdater) {
    console.log('Auto-updater not available');
    return;
  }
  
  // Configure auto-updater
  autoUpdater.autoDownload = false; // Don't auto-download, ask user first
  autoUpdater.autoInstallOnAppQuit = true; // Auto-install when app quits
  
  // Auto-updater event handlers
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    
    // Notify the renderer process
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info);
    }
    
    // Show dialog to user
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: 'Would you like to download it now? The update will be installed when you quit the app.',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(result => {
      if (result.response === 0) {
        // User clicked Download
        autoUpdater.downloadUpdate();
        
        if (mainWindow) {
          mainWindow.webContents.send('update-downloading');
        }
      }
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available. Current version:', info.version);
  });

  autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err);
    
    if (mainWindow) {
      mainWindow.webContents.send('update-error', err.message);
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download progress: ${progressObj.percent}%`);
    
    if (mainWindow) {
      mainWindow.webContents.send('update-download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
    
    // Show dialog to user
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully!',
      detail: 'The update will be installed when you quit and restart the application.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(result => {
      if (result.response === 0) {
        // User clicked Restart Now
        autoUpdater.quitAndInstall();
      }
    });
  });
}

/**
 * Check for updates
 */
function checkForUpdates() {
  // Only check for updates in production and if autoUpdater is available
  if (!app.isPackaged || !autoUpdater || isPortable) {
    console.log('Skipping update check (dev mode, portable, or updater unavailable)');
    return;
  }
  try {
    autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}

/**
 * IPC Handler for manual update check
 */
ipcMain.handle('app:checkForUpdates', async () => {
  try {
    if (!app.isPackaged || !autoUpdater || isPortable) {
      return {
        success: false,
        message: 'Update checking is not available in this build.'
      };
    }
    const result = await autoUpdater.checkForUpdates();
    return {
      success: true,
      updateInfo: result.updateInfo
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      success: false,
      message: error.message
    };
  }
});

/**
 * IPC Handler for getting app version
 */
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

// Export Service Handlers

/**
 * Create directory (recursive)
 */
ipcMain.handle('export:createDirectory', async (event, dirPath) => {
  try {
    await fs.ensureDir(dirPath);
    return { success: true };
  } catch (error) {
    console.error('Error creating directory:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Check if file exists
 */
ipcMain.handle('export:fileExists', async (event, filePath) => {
  try {
    return await fs.pathExists(filePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
});

/**
 * Copy file
 */
ipcMain.handle('export:copyFile', async (event, sourcePath, targetPath) => {
  try {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    return { success: true };
  } catch (error) {
    console.error('Error copying file:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Save JSON file
 */
ipcMain.handle('export:saveJSON', async (event, filePath, data) => {
  try {
    await fs.writeJSON(filePath, data, { spaces: 2, encoding: 'utf8' });
    return { success: true };
  } catch (error) {
    console.error('Error saving JSON:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Join file paths
 */
ipcMain.handle('fs:joinPath', async (event, ...parts) => {
  try {
    return path.join(...parts);
  } catch (error) {
    console.error('Error joining paths:', error);
    throw error;
  }
});

// Create window when app is ready
app.whenReady().then(() => {
  // Register custom protocol to serve local images
  protocol.registerFileProtocol('local-image', (request, callback) => {
    const url = request.url.replace('local-image://', '');
    const decodedPath = decodeURIComponent(url);
    
    try {
      // Security check: ensure the path doesn't try to escape using ..
      const normalizedPath = path.normalize(decodedPath);
      if (normalizedPath.includes('..')) {
        console.error('Invalid path - directory traversal detected:', normalizedPath);
        callback({ error: -6 }); // FILE_NOT_FOUND
        return;
      }
      
      callback({ path: normalizedPath });
    } catch (error) {
      console.error('Error serving image:', error);
      callback({ error: -6 }); // FILE_NOT_FOUND
    }
  });
  
  // Setup auto-updater
  setupAutoUpdater();
  
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app before quit - cleanup
app.on('before-quit', () => {
  console.log('Application is quitting...');
  // Force close all windows
  BrowserWindow.getAllWindows().forEach(win => {
    try {
      win.removeAllListeners();
      win.destroy();
    } catch (e) {
      console.error('Error destroying window:', e);
    }
  });
});

// Handle app quit
app.on('quit', () => {
  console.log('Application quit successfully');
});
