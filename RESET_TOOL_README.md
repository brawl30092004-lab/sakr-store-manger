# Sakr Store Manager - Reset Tool

A unified reset tool for the Sakr Store Manager application with multiple reset options.

## 🚀 Quick Start

Simply run:
```cmd
reset-tool.bat
```

Then choose from the menu:
- **Option 1**: Quick Safe Reset (Fast & Simple)
- **Option 2**: Smart Reset (Detailed, with detection)
- **Option 3**: Complete Reset (Delete everything)
- **Option 4**: Nuclear Reset (Deep system cleanup)

---

## 📋 Reset Options Explained

### Option 1: Quick Safe Reset ⚡
**Best for:** Quick fixes, most users

**What it does:**
- Closes the app automatically
- Deletes app settings and cache
- Deletes GitHub credentials
- **Fast execution** (2-3 seconds)

**What it keeps safe:**
- ✅ Your products.json
- ✅ All product images
- ✅ Project folder
- ✅ Git repository (.git)

**No confirmations needed** - Just press Enter to start.

---

### Option 2: Smart Reset (Safe Mode) 🔍
**Best for:** When you want to see exactly what's happening

**What it does:**
- Automatically detects ALL app data locations
- Shows what it found before deleting
- Extracts and displays project path from config
- Detects if .git repository exists
- Provides detailed feedback

**What it deletes:**
- App settings and configurations
- GitHub credentials and cache
- All variations of folder names:
  - `sakr-store-manager`
  - `SakrStoreManager`  
  - `Sakr Store Manager`

**What it keeps safe:**
- ✅ Your products.json
- ✅ All product images
- ✅ Project folder (detected from config)
- ✅ Git repository (.git)

**Requires:** Typing "RESET" to confirm

---

### Option 3: Complete Reset ⚠️ DANGER
**Best for:** Starting completely fresh

**What it does:**
- Detects ALL app and project locations
- Shows everything before deletion
- **Deletes EVERYTHING:**
  - All app data
  - Project folder
  - products.json
  - All images
  - .git repository
  - Everything!

**⚠️ WARNING:** This is permanent and cannot be undone!

**Requires:** 
1. Type "DELETE EVERYTHING"
2. Type "YES" to confirm again

---

### Option 4: Nuclear Reset ☢️ DEVELOPERS ONLY
**Best for:** Testing, debugging, complete app removal

**What it does:**
- Most thorough cleanup possible
- Searches entire user profile for app traces
- Deletes everything Option 3 does PLUS:
  - System prefetch data
  - Recent items
  - All cache variations (Cache, GPUCache, Code Cache)
  - Temp files across system
  - Any remaining traces

**Use only when:**
- 🧪 Testing fresh installations
- 🗑️ Completely removing the app
- 🐛 Debugging complex issues
- 💾 You have backups!

**Requires:**
1. Type "I UNDERSTAND"
2. Type "DELETE EVERYTHING"

---

## 🔍 What the Tool Detects

The tool automatically finds and handles:

### AppData Locations (all variations):
- `C:\Users\[USER]\AppData\Roaming\sakr-store-manager`
- `C:\Users\[USER]\AppData\Roaming\SakrStoreManager`
- `C:\Users\[USER]\AppData\Roaming\Sakr Store Manager`
- `C:\Users\[USER]\AppData\Local\sakr-store-manager`
- `C:\Users\[USER]\AppData\Local\SakrStoreManager`
- `C:\Users\[USER]\AppData\Local\Sakr Store Manager`

### Temp Locations:
- `C:\Users\[USER]\AppData\Local\Temp\sakr-store-manager`
- `C:\Users\[USER]\AppData\Local\Temp\SakrStoreManager`

### Project Folder:
- Automatically extracted from `config.json`
- Includes detection of:
  - `products.json`
  - `images/` folder
  - `.git/` repository folder

---

## 📊 Comparison Matrix

| Feature | Quick Reset | Smart Reset | Complete Reset | Nuclear Reset |
|---------|-------------|-------------|----------------|---------------|
| **Speed** | ⚡ Very Fast | 🔄 Medium | 🔄 Medium | ⏳ Slow |
| **Safety** | ✅ Safe | ✅ Safe | ⚠️ Dangerous | ☢️ Destructive |
| **Keeps products** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Keeps images** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Auto-detects paths** | ✅ Yes | ✅ Advanced | ✅ Advanced | ✅ Advanced |
| **Shows details** | ❌ No | ✅ Yes | ✅ Yes | ✅ Detailed |
| **Deletes .git** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **System-wide scan** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Clears prefetch** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Clears recent** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Confirmations** | 0 | 1 | 2 | 2 |
| **Recommended for** | Most users | Troubleshooting | Starting fresh | Developers |

---

## 🛡️ Safety Features

### All Options Include:
- ✅ Automatic process termination (closes app before deletion)
- ✅ Handles locked files gracefully
- ✅ Clear feedback on what was deleted
- ✅ Error handling for inaccessible files

### Safe Options (1 & 2):
- ✅ Never touch project folder
- ✅ Products and images always protected
- ✅ Git repository preserved

### Dangerous Options (3 & 4):
- ⚠️ Multiple confirmation prompts
- ⚠️ Must type exact phrases
- ⚠️ Clear warnings displayed
- ⚠️ Lists everything before deletion

---

## 💡 Usage Examples

### Example 1: App won't start
```
1. Run reset-tool.bat
2. Choose Option 1 (Quick Reset)
3. Press Enter
4. Start the app
```

### Example 2: Want to see what will be deleted
```
1. Run reset-tool.bat
2. Choose Option 2 (Smart Reset)
3. Review the detected locations
4. Type "RESET" to confirm
```

### Example 3: Starting completely fresh
```
1. BACKUP your products.json and images!
2. Run reset-tool.bat
3. Choose Option 3 (Complete Reset)
4. Type "DELETE EVERYTHING"
5. Type "YES"
6. Start the app - it will be like first install
```

### Example 4: Removing all traces for testing
```
1. BACKUP everything important!
2. Run reset-tool.bat
3. Choose Option 4 (Nuclear Reset)
4. Type "I UNDERSTAND"
5. Type "DELETE EVERYTHING"
6. System is completely clean
```

---

## 🔧 Technical Details

### Process Termination
The tool kills these processes before deletion:
- `sakr-store-manager.exe`
- `Sakr Store Manager.exe`
- `electron.exe` (Nuclear option only)

### Config Parsing
Uses PowerShell to parse `config.json`:
```powershell
$json = Get-Content 'config.json' -Raw | ConvertFrom-Json
$json.projectPath
```

### Folder Deletion
Uses Windows `rd /s /q` command:
- `/s` - Removes all subdirectories
- `/q` - Quiet mode (no confirmation)
- Error suppression with `2>nul`

---

## ⚠️ Important Notes

### Before Complete/Nuclear Reset:
1. **BACKUP** your products.json
2. **BACKUP** your product images
3. Make sure you have the Git repository URL if you need to re-clone
4. Understand this is **permanent** and **cannot be undone**

### If Reset Fails:
1. Make sure the app is completely closed
2. Check if any file explorer windows are open in the project folder
3. Try running as Administrator (right-click → Run as administrator)
4. Manually delete locked files after restart

### After Reset:
- **Safe Reset (1 & 2):** App will start with default settings, but your products remain
- **Complete Reset (3):** App will show welcome screen, need to create new project
- **Nuclear Reset (4):** Fresh install state, nothing remains

---

## 🐛 Troubleshooting

### "Could not delete folder"
- **Cause:** Files are locked or in use
- **Solution:** Close all related programs, try again

### "No app data found"
- **Cause:** App data doesn't exist or in unexpected location
- **Solution:** App is already clean, or check manually

### "Could not extract project path"
- **Cause:** config.json missing or corrupted
- **Solution:** Not a problem for safe resets, project data is still protected

### "Access denied"
- **Cause:** Insufficient permissions
- **Solution:** Right-click reset-tool.bat → Run as administrator

---

## 📚 Related Documentation

- `docs/APP_RESET_IMPLEMENTATION.md` - Technical implementation details
- `docs/APP_RESET_COMPLETE_V2.md` - Feature summary
- `docs/CRASH_SCREEN_TESTING_GUIDE.md` - How to test the crash screen

---

## 🎯 Quick Decision Guide

**Choose Quick Reset (1) if:**
- ✅ You just want to fix the app quickly
- ✅ You want to keep all your data
- ✅ You don't need to see details

**Choose Smart Reset (2) if:**
- ✅ You want to see what's being deleted
- ✅ You want to verify project path is safe
- ✅ You're troubleshooting an issue

**Choose Complete Reset (3) if:**
- ✅ You want to start completely fresh
- ✅ You have backups of important data
- ✅ You're switching projects

**Choose Nuclear Reset (4) if:**
- ✅ You're a developer testing
- ✅ You need absolute cleanest state
- ✅ You're completely removing the app
- ✅ Nothing else worked

---

## ⚡ TL;DR

**Most users:** Use Option 1 (Quick Reset) or Option 2 (Smart Reset)

**Starting fresh:** Use Option 3 (Complete Reset) after backing up

**Developers:** Use Option 4 (Nuclear Reset) for testing

**All options close the app automatically before resetting.**
