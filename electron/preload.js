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
    emptyDirectory: (dirPath) => ipcRenderer.invoke('fs:emptyDirectory', dirPath),
    createEmptyProducts: (projectPath) => ipcRenderer.invoke('fs:createEmptyProducts', projectPath),
    loadProducts: (projectPath) => ipcRenderer.invoke('fs:loadProducts', projectPath),
    saveProducts: (projectPath, products) => ipcRenderer.invoke('fs:saveProducts', projectPath, products),
    getImagePath: (projectPath, relativePath) => ipcRenderer.invoke('fs:getImagePath', projectPath, relativePath),
    joinPath: (...parts) => ipcRenderer.invoke('fs:joinPath', ...parts),
  },

  // Coupons API for coupons.json
  coupons: {
    load: (projectPath) => ipcRenderer.invoke('fs:loadCoupons', projectPath),
    save: (projectPath, coupons) => ipcRenderer.invoke('fs:saveCoupons', projectPath, coupons),
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
  
  // App Management API
  forceReset: (options) => ipcRenderer.invoke('app:forceReset', options),
  getGitStatus: () => ipcRenderer.invoke('git:getStatus'),
  cloneRepository: (targetPath, repoUrl, username, token) => ipcRenderer.invoke('git:clone', targetPath, repoUrl, username, token),
  publishToGitHub: (commitMessage, files) => ipcRenderer.invoke('git:publish', commitMessage, files),
  restoreFile: (filePath) => ipcRenderer.invoke('git:restoreFile', filePath),
  undoProductChange: (productChange) => ipcRenderer.invoke('git:undoProductChange', productChange),
  
  // Repository validation and management APIs
  validateRepoIntegrity: (projectPath) => ipcRenderer.invoke('git:validateRepoIntegrity', projectPath),
  validateGitRemote: (projectPath, expectedUrl) => ipcRenderer.invoke('git:validateGitRemote', projectPath, expectedUrl),
  resetRepoToRemote: (projectPath) => ipcRenderer.invoke('git:resetRepoToRemote', projectPath),
  updateGitRemote: (projectPath, newUrl) => ipcRenderer.invoke('git:updateGitRemote', projectPath, newUrl),
  
  // New sync and conflict resolution APIs
  checkRemoteChanges: () => ipcRenderer.invoke('git:checkRemoteChanges'),
  getRemoteChangeDetails: () => ipcRenderer.invoke('git:getRemoteChangeDetails'),
  pullManual: () => ipcRenderer.invoke('git:pullManual'),
  pullWithStrategy: (strategy) => ipcRenderer.invoke('git:pullWithStrategy', strategy),
  getConflictDetails: () => ipcRenderer.invoke('git:getConflictDetails'),
  resolveConflict: (resolution, files) => ipcRenderer.invoke('git:resolveConflict', resolution, files),
  resolveConflictWithFieldSelections: (fieldSelections) => ipcRenderer.invoke('git:resolveConflictWithFieldSelections', fieldSelections),
  continuePublish: (commitMessage, files) => ipcRenderer.invoke('git:continuePublish', commitMessage, files),
  checkPotentialConflicts: () => ipcRenderer.invoke('git:checkPotentialConflicts'),
});
