# App Reset & Force Reset - Implementation Summary

## 📋 Overview

This feature provides two ways to reset the application data when crashes persist or when users want a clean start:

1. **Force Reset (Crash Screen)** - Available when the app crashes, allows immediate reset
2. **Reset App (Tools Menu)** - Safe reset option with multiple warnings and confirmations

---

## 🎯 What Gets Reset

### ✗ Data That IS Deleted:
- **Settings & Configurations** - All app settings stored in config.json
- **GitHub Credentials** - Encrypted tokens and connection details
- **AppData/Roaming** - All data in `%APPDATA%\SakrStoreManager` (Windows)
- **Logs** - Application logs
- **Temporary Files** - App-specific temp files
- **localStorage** - Browser storage (welcome screen preferences, etc.)
- **Cached Data** - All cached application data

### ✓ Data That is NOT Deleted:
- **products.json** - Your product data remains safe
- **Product Images** - All images in your project folder
- **Project Folder** - Your entire project directory stays intact
- **App Executable** - The application files themselves

---

## 🚀 Implementation Details

### 1. Electron IPC Handler (`electron/main.cjs`)

**Handler:** `app:forceReset`

**What it does:**
```javascript
ipcMain.handle('app:forceReset', async (event) => {
  // 1. Close all windows
  // 2. Delete userData directory (config.json, etc.)
  // 3. Delete app-specific temp files
  // 4. Delete logs directory
  // 5. Relaunch the app
  // 6. Quit current instance
});
```

**Directories deleted:**
- `app.getPath('userData')` - Main app data
- `path.join(app.getPath('temp'), 'SakrStoreManager')` - Temp files
- `app.getPath('logs')` - Log files

---

### 2. Preload Script (`electron/preload.js`)

**Exposed API:**
```javascript
window.electron.forceReset() // Returns Promise<{ success: boolean, error?: string }>
```

---

### 3. Error Boundary Component (`src/components/ErrorBoundary.jsx`)

**New Feature:** Force Reset Button

**UI Flow:**
1. User encounters a crash
2. Error Boundary catches the error
3. Shows error screen with:
   - Restart Application button (existing)
   - Copy Error Details button (existing)
   - **⚠️ Force Reset** (new - inside expandable section)

**Implementation:**
```jsx
handleForceReset = async () => {
  // 1. Show confirmation dialog with warning
  // 2. Call window.electron.forceReset()
  // 3. App quits and relaunches automatically
};
```

**UI Design:**
- Hidden inside `<details>` element: "⚠️ Crash persists? Try Force Reset"
- Clear warning about what will be deleted
- Explicit list of safe data (products.json, images)
- Red danger button

---

### 4. App Menu Option (`src/App.jsx`)

**Location:** Tools → ⚠️ Reset App...

**Safety Features:**
1. **Danger Zone section** - Separated from other tools
2. **Visual warning** - ⚠️ icon and red styling
3. **Confirmation Dialog** - Full-screen modal with multiple warnings
4. **Cancel by default** - User must explicitly confirm

**Dialog Contents:**
- Large warning icon with pulse animation
- Red warning section explaining consequences
- Detailed list of data that will be deleted
- Blue "safe" section showing protected data
- Note about post-reset experience
- Two buttons: Cancel (default) and Confirm (danger)

---

## 🎨 UI Components

### Force Reset in Crash Screen

```
┌─────────────────────────────────────────────┐
│  ⚠️ Something went wrong                    │
│                                             │
│  [Restart Application]  [Copy Error Details]│
│                                             │
│  ▼ ⚠️ Crash persists? Try Force Reset       │
│  ┌───────────────────────────────────────┐ │
│  │ Force Reset will delete all app data: │ │
│  │ • Settings and configurations         │ │
│  │ • GitHub credentials                  │ │
│  │ • Cached data                         │ │
│  │ • Logs and temporary files            │ │
│  │                                       │ │
│  │ Note: Your products.json and images   │ │
│  │ will NOT be deleted.                  │ │
│  │                                       │ │
│  │ [⚠️ Force Reset App Data]              │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Reset App Dialog (Tools Menu)

```
┌─────────────────────────────────────────────┐
│            ⚠️                                │
│      Reset Application Data                 │
│                                             │
│  ⚠️ WARNING: This action cannot be undone!  │
│  This will permanently delete all app data: │
│                                             │
│  ✗ All settings and configurations         │
│  ✗ GitHub credentials                      │
│  ✗ Cached data in AppData/Roaming          │
│  ✗ Logs and temporary files                │
│  ✗ Welcome screen preferences              │
│                                             │
│  ✓ Your product data will be safe:         │
│  ✓ products.json will NOT be deleted       │
│  ✓ Product images will NOT be deleted      │
│  ✓ Your project folder remains intact      │
│                                             │
│  After reset, the app will restart and     │
│  you'll see the welcome screen again.      │
│                                             │
│         [Cancel]  [⚠️ Yes, Reset App Data]  │
└─────────────────────────────────────────────┘
```

---

## 📝 CSS Styles

### Error Boundary Styles (`src/components/ErrorBoundary.css`)

**New Classes:**
- `.error-force-reset` - Container for force reset section
- `.force-reset-details` - Expandable details element
- `.force-reset-content` - Content inside details
- `.force-reset-warning` - Warning text styling
- `.force-reset-list` - List of deleted items
- `.force-reset-note` - Blue info box for safe data
- `.btn-force-reset` - Red danger button

### App.css Styles

**New Classes:**
- `.btn-secondary` - Cancel button styling
- `.btn-danger` - Red danger button
- `.reset-app-dialog` - Dialog container
- `.reset-app-header` - Dialog header with icon
- `.reset-app-icon` - Large warning icon with pulse
- `.reset-app-warning` - Red warning section
- `.reset-app-list` - List of deleted data
- `.reset-app-safe` - Blue "safe data" section
- `.reset-app-note` - Information note
- `.reset-app-actions` - Button container

---

## 🔧 Technical Details

### Data Deletion Process

1. **Close Windows:** All browser windows are closed to prevent data corruption
2. **Delete userData:** 
   - Windows: `%APPDATA%\SakrStoreManager`
   - macOS: `~/Library/Application Support/SakrStoreManager`
   - Linux: `~/.config/SakrStoreManager`
3. **Delete Temp Files:** App-specific temp directory
4. **Delete Logs:** Application log files
5. **Relaunch:** `app.relaunch()` starts a fresh instance
6. **Quit:** `app.quit()` closes current instance

### localStorage Handling

localStorage is automatically cleared because:
1. It's stored in the userData directory
2. Deleting userData removes all browser storage
3. IndexedDB and sessionStorage are also cleared

### Safety Measures

**Project Path Protection:**
- The project path (where products.json lives) is NOT deleted
- Only app configuration about the path is removed
- User must re-configure the path after reset

**Two Confirmation Levels:**
1. **Native confirm()** dialog (Force Reset in crash screen)
2. **Custom modal** dialog (Reset App from Tools menu)

---

## 🧪 Testing Guide

### Test Force Reset (Crash Screen)

1. **Trigger a crash:**
   - Open DevTools (F12)
   - In Console: `throw new Error("Test crash")`
   
2. **Verify Error Boundary appears**

3. **Expand Force Reset section:**
   - Click "⚠️ Crash persists? Try Force Reset"
   - Verify warning message displays
   - Verify list of deleted data
   - Verify safe data note

4. **Click Force Reset:**
   - Verify confirmation dialog appears
   - Click OK to proceed
   - App should quit and relaunch
   - Verify welcome screen appears
   - Verify settings are reset

### Test Reset App (Tools Menu)

1. **Open Tools menu:**
   - Click Tools → ⚠️ Reset App...

2. **Verify Reset Dialog:**
   - Large warning icon should pulse
   - Red warning section visible
   - List of deleted data shown
   - Blue "safe" section visible
   - Two buttons: Cancel and Confirm

3. **Test Cancel:**
   - Click Cancel
   - Dialog closes
   - Nothing is deleted

4. **Test Confirm:**
   - Click "⚠️ Yes, Reset App Data"
   - Toast notification appears
   - App quits after 1 second
   - App relaunches
   - Welcome screen appears
   - All settings reset

### Verify Data Deletion

**Before Reset:**
1. Note location of userData:
   - Windows: `%APPDATA%\SakrStoreManager`
2. Verify config.json exists in userData
3. Note welcome screen was already seen

**After Reset:**
1. Check userData directory was deleted
2. Welcome screen appears (localStorage cleared)
3. Settings panel is empty
4. GitHub credentials gone
5. Products.json still exists in project folder
6. Images still exist

---

## 🎯 Use Cases

### When to Use Force Reset (Crash Screen)

- App crashes repeatedly on startup
- Corrupted configuration file
- Can't access settings to fix issues
- Error persists after restart
- Need immediate clean slate

### When to Use Reset App (Tools Menu)

- Want to start fresh without crashing
- Switching to different project setup
- GitHub credentials need complete reset
- Testing fresh installation experience
- Troubleshooting configuration issues
- Before sharing app with another user

---

## ⚠️ Important Notes

### For Users:

1. **Backup Important Data:**
   - Export products before reset (just to be safe)
   - Note GitHub repository URL and credentials
   - Screenshot any custom settings

2. **What Happens After Reset:**
   - Welcome screen appears
   - Need to configure data source again
   - Need to enter GitHub credentials again
   - Need to re-select project path

3. **Emergency Recovery:**
   - If reset fails, manually delete: `%APPDATA%\SakrStoreManager`
   - Relaunch app manually
   - Products.json will still be in your project folder

### For Developers:

1. **Error Handling:**
   - Force reset has try-catch protection
   - Errors are logged to console
   - User gets error message if reset fails

2. **Platform Compatibility:**
   - Uses Electron's `app.getPath()` for cross-platform paths
   - Works on Windows, macOS, and Linux
   - Path handling is automatic

3. **Testing in Development:**
   - Force reset works in dev mode
   - Config files are in dev userData location
   - Test with actual crash scenarios

---

## 📚 Related Files

### Modified Files:
1. `electron/main.cjs` - IPC handler for force reset
2. `electron/preload.js` - API exposure
3. `src/components/ErrorBoundary.jsx` - Force reset button
4. `src/components/ErrorBoundary.css` - Force reset styles
5. `src/App.jsx` - Reset App menu option and dialog
6. `src/App.css` - Reset dialog styles

### Key Dependencies:
- `fs-extra` - File system operations
- `electron` - App management and paths
- `react-hot-toast` - Success/error notifications

---

## 🔮 Future Enhancements

### Potential Improvements:

1. **Selective Reset:**
   - Option to keep certain settings
   - Reset only GitHub credentials
   - Reset only window preferences

2. **Backup Before Reset:**
   - Automatic config backup
   - Option to restore from backup
   - Export/import settings

3. **Reset History:**
   - Log when resets occur
   - Track reset frequency
   - Suggest fixes if resets are frequent

4. **Guided Recovery:**
   - Post-reset wizard
   - Pre-populate known-good settings
   - Quick reconnect to GitHub

5. **Safe Mode:**
   - Launch without loading settings
   - Diagnose config issues
   - Fix without full reset

---

## ✅ Implementation Status

**Status:** ✅ **COMPLETE**

**Tested:** 
- ✅ Force Reset from crash screen
- ✅ Reset App from Tools menu
- ✅ Data deletion verification
- ✅ App relaunch
- ✅ Welcome screen reappearance
- ✅ Settings cleared
- ✅ Products.json preserved

**Known Issues:** None

**Browser Compatibility:** All (Electron-based)

---

## 🎓 Summary

The App Reset feature provides a robust safety net for users experiencing persistent issues:

- **Two Access Points:** Crash screen and Tools menu
- **Safety First:** Multiple confirmations and warnings
- **Data Protection:** Products.json and images are never deleted
- **Clean Slate:** Complete reset of app configuration
- **User-Friendly:** Clear communication about what happens
- **Developer-Friendly:** Simple IPC API, comprehensive error handling

This implementation ensures users can always recover from configuration issues while protecting their valuable product data.

---

**Last Updated:** November 13, 2025
**Version:** 1.0.0
**Author:** GitHub Copilot
