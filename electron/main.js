const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');

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
