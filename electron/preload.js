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
    deleteProductImages: (projectPath, productId, imageType) =>
      ipcRenderer.invoke('image:deleteProductImages', projectPath, productId, imageType),
  },

  // Settings API for GitHub Integration
  saveSettings: (config) => ipcRenderer.invoke('settings:save', config),
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  browseDirectory: () => ipcRenderer.invoke('settings:browseDirectory'),
  testConnection: (config) => ipcRenderer.invoke('settings:testConnection', config),
  getGitStatus: () => ipcRenderer.invoke('git:getStatus'),
  publishToGitHub: (commitMessage) => ipcRenderer.invoke('git:publish', commitMessage),
});
