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
  }
});
