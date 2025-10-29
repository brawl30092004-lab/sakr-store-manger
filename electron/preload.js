const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Platform info
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  
  // File System API for products.json
  fs: {
    loadProducts: (projectPath) => ipcRenderer.invoke('fs:loadProducts', projectPath),
    saveProducts: (projectPath, products) => ipcRenderer.invoke('fs:saveProducts', projectPath, products),
  },

  // Image Processing API
  image: {
    processImage: (imageData, projectPath, productId, imageType, index) => 
      ipcRenderer.invoke('image:process', imageData, projectPath, productId, imageType, index),
    deleteImage: (projectPath, imagePath) => 
      ipcRenderer.invoke('image:delete', projectPath, imagePath),
  }
});
