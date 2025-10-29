import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import sharp from 'sharp';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
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
  } else {
    // Production mode - load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    
    // Check for updates after window loads
    mainWindow.webContents.on('did-finish-load', () => {
      checkForUpdates();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for File System Operations
ipcMain.handle('fs:loadProducts', async (event, projectPath) => {
  try {
    const productsFilePath = path.join(projectPath, 'products.json');
    
    // Check if file exists
    const exists = await fs.pathExists(productsFilePath);
    
    if (!exists) {
      // Create empty products.json
      await fs.writeJSON(productsFilePath, [], { spaces: 2, encoding: 'utf8' });
      return [];
    }
    
    // Read and parse products.json with UTF-8 encoding
    const products = await fs.readJSON(productsFilePath, { encoding: 'utf8' });
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
});

ipcMain.handle('fs:saveProducts', async (event, projectPath, products) => {
  try {
    const productsFilePath = path.join(projectPath, 'products.json');
    
    // Write products.json with 2-space indentation and UTF-8 encoding
    await fs.writeJSON(productsFilePath, products, { spaces: 2, encoding: 'utf8' });
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
 * Generate standardized image filename
 * @param {number} productId - Product ID
 * @param {string} imageType - 'primary' or 'gallery'
 * @param {number|null} index - Gallery image index (null for primary)
 * @param {string} extension - File extension (jpg, webp, avif)
 * @returns {string} Filename like 'product-23-primary.jpg' or 'product-23-gallery-1.webp'
 */
function generateImageFilename(productId, imageType, index, extension) {
  if (imageType === 'primary') {
    return `product-${productId}-primary.${extension}`;
  } else if (imageType === 'gallery') {
    return `product-${productId}-gallery-${index}.${extension}`;
  }
  throw new Error(`Invalid image type: ${imageType}`);
}

/**
 * Process a product image: resize if needed, convert to multiple formats
 * @param {Buffer} imageBuffer - Image data as Buffer
 * @param {string} projectPath - Project root path
 * @param {number} productId - Product ID
 * @param {string} imageType - 'primary' or 'gallery'
 * @param {number|null} index - Gallery image index (null for primary)
 * @returns {Promise<string>} Path to primary JPG file (relative to project root)
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

    // Load image with Sharp from buffer
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

    // Process and save in parallel: JPG, WebP, and AVIF
    const jpgPath = path.join(imagesDir, `${baseName}.jpg`);
    const webpPath = path.join(imagesDir, `${baseName}.webp`);
    const avifPath = path.join(imagesDir, `${baseName}.avif`);

    await Promise.all([
      // JPG - high quality, progressive
      image.clone().jpeg({ quality: 90, progressive: true }).toFile(jpgPath),
      
      // WebP - good quality, smaller size
      image.clone().webp({ quality: 80 }).toFile(webpPath),
      
      // AVIF - lower quality, excellent compression
      image.clone().avif({ quality: 60 }).toFile(avifPath)
    ]);

    // Return the relative path to the primary JPG
    // Using forward slashes for consistency across platforms
    return `images/${baseName}.jpg`;
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
    const fullBasePath = path.join(projectPath, basePath);

    // Delete all three formats
    const extensions = ['.jpg', '.webp', '.avif'];
    await Promise.all(
      extensions.map(async (ext) => {
        const filePath = fullBasePath + ext;
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      })
    );

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
 * IPC Handler for testing GitHub connection
 */
ipcMain.handle('settings:testConnection', async (event, config) => {
  try {
    // Dynamically import the ES modules
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    
    // Get the full config with decrypted token
    let fullConfig = configService.getConfigWithToken();
    
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
    
    // Create GitService instance
    const gitService = new GitService(fullConfig.projectPath, {
      username: fullConfig.username,
      token: fullConfig.token,
      repoUrl: fullConfig.repoUrl
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
    
    // Validate we have a project path
    if (!config.projectPath) {
      return {
        success: false,
        message: 'No project path configured',
        hasChanges: false
      };
    }
    
    // Create GitService instance
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl
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
 * IPC Handler for publishing changes to GitHub
 */
ipcMain.handle('git:publish', async (event, commitMessage = null) => {
  try {
    // Dynamically import the ES modules
    const { getConfigService } = await import('../src/services/configService.js');
    const GitService = (await import('../src/services/gitService.js')).default;
    
    const configService = getConfigService();
    const config = configService.getConfigWithToken();
    
    // Validate we have a project path
    if (!config.projectPath) {
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
    
    // Create GitService instance
    const gitService = new GitService(config.projectPath, {
      username: config.username,
      token: config.token,
      repoUrl: config.repoUrl
    });
    
    // Execute the publish workflow
    const result = await gitService.publishChanges(commitMessage);
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

// Auto-Updater Configuration and Handlers

/**
 * Configure auto-updater
 */
function setupAutoUpdater() {
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
  // Only check for updates in production
  if (!app.isPackaged) {
    console.log('Skipping update check in development mode');
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
    if (!app.isPackaged) {
      return {
        success: false,
        message: 'Update checking is only available in production builds'
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
