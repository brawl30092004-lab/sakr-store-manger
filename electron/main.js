const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const os = require('os');

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

// Create window when app is ready
app.whenReady().then(() => {
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
