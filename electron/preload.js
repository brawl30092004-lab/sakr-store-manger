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
    checkProjectPath: (projectPath) => ipcRenderer.invoke('fs:checkProjectPath', projectPath),
    createEmptyProducts: (projectPath) => ipcRenderer.invoke('fs:createEmptyProducts', projectPath),
    loadProducts: (projectPath) => ipcRenderer.invoke('fs:loadProducts', projectPath),
    saveProducts: (projectPath, products) => ipcRenderer.invoke('fs:saveProducts', projectPath, products),
    getImagePath: (projectPath, relativePath) => ipcRenderer.invoke('fs:getImagePath', projectPath, relativePath),
    joinPath: (...parts) => ipcRenderer.invoke('fs:joinPath', ...parts),
  },

  // Export API
  export: {
    createDirectory: (dirPath) => ipcRenderer.invoke('export:createDirectory', dirPath),
    fileExists: (filePath) => ipcRenderer.invoke('export:fileExists', filePath),
    copyFile: (sourcePath, targetPath) => ipcRenderer.invoke('export:copyFile', sourcePath, targetPath),
    saveJSON: (filePath, data) => ipcRenderer.invoke('export:saveJSON', filePath, data),
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
  checkGitInstallation: () => ipcRenderer.invoke('git:checkInstallation'),
  getGitStatus: () => ipcRenderer.invoke('git:getStatus'),
  cloneRepository: (targetPath, repoUrl, username, token) => ipcRenderer.invoke('git:clone', targetPath, repoUrl, username, token),
  publishToGitHub: (commitMessage, files) => ipcRenderer.invoke('git:publish', commitMessage, files),
  restoreFile: (filePath) => ipcRenderer.invoke('git:restoreFile', filePath),
  undoProductChange: (productChange) => ipcRenderer.invoke('git:undoProductChange', productChange),
});
