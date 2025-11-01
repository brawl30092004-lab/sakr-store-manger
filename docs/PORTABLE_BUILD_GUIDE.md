# 📦 Portable Build Guide - Sakr Store Manager

## 🎯 Overview

This guide explains how to build a **fully portable executable** that can run on any Windows computer without installation.

### What "Portable" Means:
- ✅ **No installation required** - just double-click and run
- ✅ **No admin rights needed** - runs as regular user
- ✅ **Self-contained** - all dependencies bundled (except Git)
- ✅ **Movable** - can be run from USB drive or any folder
- ✅ **No registry changes** - leaves no traces on the system
- ✅ **Auto-updater disabled** - stable version that won't auto-update

---

## ⚡ Quick Build (2 Commands)

```powershell
# Build the portable version
npm run electron:build:portable

# Find the result
.\release\Sakr Store Manager v1.0.0 Portable.exe
```

**Expected size:** ~180-220 MB (includes Chromium and Node.js)

---

## 📋 Prerequisites on Build Machine

Before building, ensure you have:

1. **Node.js** (v16 or later) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Project dependencies installed**:
   ```powershell
   npm install
   ```

---

## 🔨 Step-by-Step Build Process

### 1. Clean Previous Builds (Optional but Recommended)

```powershell
# Remove old builds
Remove-Item -Recurse -Force .\release -ErrorAction SilentlyContinue

# Clear electron-builder cache
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache" -ErrorAction SilentlyContinue
```

### 2. Build the Application

```powershell
npm run electron:build:portable
```

**What happens during build:**
1. ✓ Vite bundles the React frontend (~30 seconds)
2. ✓ Electron-builder packages the app (~2-3 minutes)
3. ✓ Downloads Electron runtime if needed (~108 MB, first time only)
4. ✓ Bundles Sharp for image processing
5. ✓ Creates portable executable

### 3. Verify Build Success

Check the `release` folder:

```powershell
ls .\release
```

You should see:
- `Sakr Store Manager v1.0.0 Portable.exe` - **This is your portable app!**

---

## 🧪 Testing the Portable Version

### Test on Build Machine

```powershell
# Run the portable version
.\release\"Sakr Store Manager v1.0.0 Portable.exe"
```

Verify:
- ✅ App launches without errors
- ✅ Can create/edit products
- ✅ Image upload works
- ✅ Data persists between sessions
- ✅ Settings are saved

### Test on Clean Machine

1. **Copy the .exe file** to another computer (USB drive, network share, etc.)
2. **Double-click** to run - no installation needed
3. **Test all features** without Git first
4. **Optional: Install Git** to enable GitHub features

---

## 📦 What's Included in the Portable Version

### Bundled Components:
- ✅ **Electron Runtime** - Complete Chromium + Node.js
- ✅ **React Frontend** - All UI components
- ✅ **Sharp Library** - Native image processing
- ✅ **Node Modules** - All JavaScript dependencies
- ✅ **File System Access** - Read/write local files

### NOT Included (External Dependency):
- ⚠️ **Git** - Required only for GitHub sync features
  - Product management works WITHOUT Git
  - GitHub features require Git installed on the target system

---

## 🔧 System Requirements for Target Computers

### Minimum Requirements:
- **OS:** Windows 7 or later (64-bit)
- **RAM:** 2 GB minimum, 4 GB recommended
- **Disk Space:** 300 MB free space
- **Display:** 1024x768 minimum resolution

### Optional Requirements:
- **Git for Windows** - Only needed for GitHub sync features
  - Download: https://git-scm.com/download/win
  - The app will detect if Git is installed
  - All other features work without Git

---

## 📁 How Portable Storage Works

### Data Storage Location:
The portable version stores data relative to its location:

```
📁 Where you put the .exe
   ├── Sakr Store Manager v1.0.0 Portable.exe
   └── (User data stored in Windows AppData - safe for portability)
```

### What Gets Saved:
- ✅ Application settings (localStorage)
- ✅ Window size/position
- ✅ Recent projects
- ✅ Draft form data
- ✅ GitHub credentials (encrypted)

### User Data Location:
```
%LOCALAPPDATA%\sakr-store-manager-portable
```
This ensures data persists even if you move the .exe file.

---

## 🚀 Distribution

### Single-File Distribution:

**Simply share the .exe file!**

```powershell
# Example: Copy to shared folder
Copy-Item ".\release\Sakr Store Manager v1.0.0 Portable.exe" "\\server\shared\apps\"

# Example: Upload to cloud storage
# Just upload the .exe file to Google Drive, Dropbox, etc.
```

### Create a Package (Optional):

Create a ZIP with instructions:

```
Sakr-Store-Manager-Portable.zip
├── Sakr Store Manager v1.0.0 Portable.exe
├── README.txt (usage instructions)
└── Git-Installer.url (link to Git download, optional)
```

---

## ❓ Troubleshooting

### Build Fails - "Cannot find module"

```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force .\node_modules
npm install
npm run electron:build:portable
```

### Build Fails - "electron-builder error"

```powershell
# Clear cache
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"
npm run electron:build:portable
```

### "Icon not found" Error

```powershell
# Generate icon
node generate-icon.js

# Verify it exists
ls build\icon.ico
```

### Portable Version Won't Run on Target PC

**Check:**
1. ✅ Windows version is 7+ (64-bit)
2. ✅ File isn't blocked (Right-click → Properties → Unblock)
3. ✅ Not on a read-only drive
4. ✅ Antivirus isn't blocking it

### GitHub Features Don't Work

**This is expected!** The portable version requires:
1. Git to be installed on the target computer
2. User must install Git from: https://git-scm.com/download/win
3. After installing Git, restart the app

---

## 🆚 Portable vs Installer Version

| Feature | Portable | Installer |
|---------|----------|-----------|
| Installation Required | ❌ No | ✅ Yes |
| Admin Rights | ❌ No | ✅ Yes |
| Auto-Updates | ❌ Disabled | ✅ Enabled |
| Desktop Shortcut | ❌ No | ✅ Yes |
| Start Menu Entry | ❌ No | ✅ Yes |
| File Associations | ❌ No | ✅ Yes |
| Size | ~200 MB | ~200 MB |
| Git Included | ❌ No | ❌ No |

---

## 🎯 Use Cases for Portable Version

### Perfect For:
- ✅ **Testing** on multiple computers
- ✅ **USB deployment** - run from USB stick
- ✅ **Restricted environments** - no admin rights
- ✅ **Quick demos** - no installation needed
- ✅ **Multiple versions** - run different versions side-by-side
- ✅ **Network drives** - run from shared folder

### Not Ideal For:
- ❌ **Production deployment** with auto-updates
- ❌ **Company-wide rollout** with central management
- ❌ **Users expecting installation** experience

---

## 📝 User Instructions

When distributing the portable version, include these instructions:

### Quick Start Instructions:
```
Sakr Store Manager - Portable Version
=====================================

RUNNING THE APP:
1. Copy "Sakr Store Manager v1.0.0 Portable.exe" to any folder
2. Double-click the .exe file to launch
3. No installation needed!

FEATURES WITHOUT GIT:
✅ Create and manage products
✅ Upload and edit images
✅ Export product catalogs
✅ Full offline functionality

ENABLE GITHUB FEATURES (OPTIONAL):
1. Download Git for Windows: https://git-scm.com/download/win
2. Install Git with default options
3. Restart Sakr Store Manager
4. Configure GitHub in Settings

SYSTEM REQUIREMENTS:
- Windows 7 or later (64-bit)
- 2 GB RAM minimum
- No installation or admin rights required

SUPPORT:
- Documentation: See docs folder
- Issues: GitHub repository
```

---

## 🔒 Security Considerations

### Portable Version Security:
- ✅ **Code-signed** (if you have a certificate)
- ✅ **Encrypted credentials** - GitHub tokens encrypted
- ✅ **No network calls** - except Git operations
- ✅ **Local-first** - works completely offline

### Antivirus False Positives:
Some antivirus software may flag unsigned portable .exe files:
- **Solution:** Code-sign the executable (requires certificate)
- **Workaround:** Add exception in antivirus software

---

## 🎨 Customizing the Build

### Change Version Number:

Edit `package.json`:
```json
{
  "version": "1.0.1"  ← Change this
}
```

### Change App Name:

Edit `package.json`:
```json
{
  "build": {
    "productName": "My Custom Name"  ← Change this
  }
}
```

### Rebuild:
```powershell
npm run electron:build:portable
```

---

## 🏗️ Advanced Build Options

### Build for Specific Architecture:

```powershell
# 64-bit only (default)
npm run electron:build:portable

# 32-bit (requires config change in electron-builder.yml)
npm run electron:build:portable -- --ia32
```

### Build with Compression:

Edit `electron-builder.yml`:
```yaml
portable:
  artifactName: ${productName} v${version} Portable.exe
  unicode: true
  compression: maximum  # Add this for smaller file (slower build)
```

---

## 📊 Build Performance

### Typical Build Times:
- **First build:** 4-6 minutes (downloads Electron)
- **Subsequent builds:** 2-3 minutes
- **Clean rebuild:** 3-4 minutes

### Optimize Build Speed:
```powershell
# Skip dependency check
npm run electron:build:portable -- --config.npmRebuild=false

# Use existing cache
# (Don't clear cache unless necessary)
```

---

## ✅ Checklist Before Distribution

Before sharing the portable version:

- [ ] Tested on build machine
- [ ] Tested on clean Windows machine
- [ ] Verified all features work without Git
- [ ] Tested GitHub features with Git installed
- [ ] Checked file size is reasonable (~200 MB)
- [ ] Created user instructions
- [ ] Scanned with antivirus
- [ ] Tested from USB drive (if applicable)
- [ ] Verified data persists between sessions

---

## 📚 Related Documentation

- **BUILD_AND_DISTRIBUTION_GUIDE.md** - Complete build guide
- **BUILD_NOW.md** - Quick build reference
- **GITHUB_SETTINGS_QUICK_REFERENCE.md** - GitHub setup
- **ERROR_HANDLING_QUICK_REFERENCE.md** - Troubleshooting

---

## 💡 Tips & Best Practices

### For Builders:
1. ✅ Always test on a clean machine
2. ✅ Keep build machine clean (close other apps)
3. ✅ Use stable Node.js version
4. ✅ Don't build on network drives
5. ✅ Keep backups of working builds

### For Users:
1. ✅ Keep the .exe in a permanent location
2. ✅ Don't run from Downloads folder
3. ✅ Create project folders outside Program Files
4. ✅ Install Git if you need GitHub features
5. ✅ Keep the .exe file name unchanged

---

## 🎉 Success!

You now have a fully portable version of Sakr Store Manager that can run on any Windows computer without installation!

**Next Steps:**
1. Test thoroughly on target computers
2. Gather user feedback
3. Iterate and improve
4. Build installer version if needed

Happy building! 🚀
