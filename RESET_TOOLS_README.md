# App Reset Tools - Usage Guide

## 📁 Available Reset Scripts

### 1. `reset-app.bat` (Smart Reset - ⭐ Recommended)

**Full-featured reset tool with automatic detection and safety features.**

#### Features:
- ✅ Automatically detects all app data locations
- ✅ Extracts project path from config.json
- ✅ Shows exactly what will be deleted
- ✅ Two modes: Safe and Complete
- ✅ Colored output for clarity
- ✅ Confirmation prompts to prevent accidents
- ✅ Can automatically restart the app

#### Usage:

**Safe Reset (Keeps Products):**
```cmd
reset-app.bat
```
- Deletes app settings and configurations
- Keeps products.json and images safe
- Requires typing "RESET" to confirm

**Complete Reset (Deletes EVERYTHING):**
```cmd
reset-app.bat /all
```
- Deletes ALL app data
- Deletes project folder, products.json, images
- Requires typing "DELETE EVERYTHING" to confirm
- ⚠️ USE WITH EXTREME CAUTION!

---

### 2. `quick-reset.bat` (Simple Reset)

**Quick and simple safe reset - no frills.**

#### Features:
- ✅ Fast execution
- ✅ Always safe mode (keeps products)
- ✅ Simple confirmation
- ✅ No complex options

#### Usage:
```cmd
quick-reset.bat
```
- Double-click or run from command line
- Press any key to confirm
- Done in seconds

---

### 3. `nuclear-reset.bat` (Nuclear Option - ☢️ DEVELOPERS ONLY)

**The most thorough cleanup possible - searches and destroys EVERYTHING.**

#### Features:
- 🔥 Searches entire user profile for app traces
- 🗑️ Deletes cache, prefetch, recent items
- 🧹 Clears all browser storage (IndexedDB, localStorage, GPUCache)
- 📊 Shows remaining files for manual cleanup
- ⚠️ Multiple safety confirmations
- 🔍 Most comprehensive detection

#### Usage:
```cmd
nuclear-reset.bat
```
- Type "I UNDERSTAND" to proceed
- Type "DELETE EVERYTHING" to confirm
- Removes every trace of the app from system
- ☢️ **EXTREMELY DESTRUCTIVE - USE ONLY FOR TESTING!**

#### When to use:
- 🧪 Testing fresh installations
- 🗑️ Completely removing the app
- 🐛 Debugging complex cache/storage issues
- 💾 You have backups of important data

---

## 🎯 When to Use Each Tool

### Use `reset-app.bat` when:
- ⭐ **Default choice for most users**
- You want to see exactly what will be deleted
- You need to extract project path information
- You want the option for complete reset
- You prefer detailed feedback
- You're troubleshooting issues

### Use `quick-reset.bat` when:
- You just want a quick safe reset
- You don't need project info
- You want simplicity
- You trust the defaults
- You need speed

### Use `nuclear-reset.bat` when:
- ☢️ **You're a developer/power user**
- Testing fresh app installations
- Removing ALL traces for debugging
- Nothing else worked
- You have backups!

---

## 📊 Comparison

| Feature | reset-app.bat | quick-reset.bat | nuclear-reset.bat |
|---------|---------------|-----------------|-------------------|
| **Detects project path** | ✅ Yes | ❌ No | ✅ Yes |
| **Shows what's deleted** | ✅ Detailed | ⚠️ Basic | ✅ Very Detailed |
| **Safe reset** | ✅ Yes | ✅ Yes | ❌ No |
| **Complete reset** | ✅ Yes (`/all`) | ❌ No | ✅ Always |
| **Searches system** | ❌ No | ❌ No | ✅ Yes |
| **Clears cache** | ✅ Yes | ✅ Yes | ✅ Deep Clean |
| **Clears prefetch** | ❌ No | ❌ No | ✅ Yes |
| **Clears recent** | ❌ No | ❌ No | ✅ Yes |
| **Colored output** | ✅ Yes | ❌ No | ✅ Yes |
| **Auto-restart app** | ✅ Optional | ❌ No | ❌ No |
| **Speed** | ⚠️ Slower | ✅ Fast | ⚠️ Slowest |
| **Ease of use** | ⚠️ More options | ✅ Simple | ⚠️ Advanced |
| **Danger level** | ⚠️ Medium | ✅ Safe | ☢️ HIGH |

---

## 🛡️ Safety Features

### `reset-app.bat` Safety:
1. ✅ Shows list of what will be deleted
2. ✅ Requires explicit confirmation text
3. ✅ Different confirmation for complete reset
4. ✅ Extracts and shows project path first
5. ✅ Closes app before deleting

### `quick-reset.bat` Safety:
1. ✅ Always safe mode (products protected)
2. ✅ Requires pressing a key to continue
3. ✅ Closes app before deleting

### `nuclear-reset.bat` Safety:
1. ⚠️ TWO confirmation prompts
2. ⚠️ Must type exact phrases
3. ⚠️ Shows extensive warnings
4. ⚠️ Lists all files before deletion
5. ⚠️ Optional manual cleanup of remaining files
6. ☢️ NO UNDO - This is the nuclear option!

---

## 📝 What Gets Deleted

### Both Tools (Safe Mode):
```
✗ %APPDATA%\SakrStoreManager
  - config.json (settings, GitHub credentials)
  - All cached data
  - Application logs

✗ %LOCALAPPDATA%\SakrStoreManager
  - Local cache
  - Session data

✗ %TEMP%\SakrStoreManager
  - Temporary files

✓ Your project folder (SAFE)
✓ products.json (SAFE)
✓ All images (SAFE)
```

### `reset-app.bat /all` (Complete Mode):
```
✗ Everything from safe mode PLUS:
✗ Your entire project folder
✗ products.json (ALL PRODUCTS)
✗ All product images
✗ EVERYTHING related to the app
```

---

## 🧪 Testing

### Test Safe Reset:
1. Backup your data first
2. Run: `reset-app.bat`
3. Type: `RESET`
4. Wait for completion
5. Start app → Welcome screen should appear
6. Check project folder → Products should exist

### Test Complete Reset (WITH BACKUP!):
1. **BACKUP EVERYTHING FIRST!**
2. Run: `reset-app.bat /all`
3. Type: `DELETE EVERYTHING`
4. Wait for completion
5. Start app → Welcome screen should appear
6. Project folder should be gone

---

## 🔧 Troubleshooting

### "Access Denied" Errors:
**Solution:** Run as Administrator
```cmd
Right-click → Run as administrator
```

### App Won't Close:
**Solution:** Manually close from Task Manager, then run script

### Project Path Not Found:
**Cause:** config.json doesn't exist or is corrupted
**Solution:** Script will still work, but won't show project location

### Script Doesn't Delete Everything:
**Causes:**
- Files are in use (close all apps)
- Permission issues (run as admin)
- Different install location

**Solution:** Check console output for error messages

---

## 💡 Pro Tips

### 1. Create Desktop Shortcuts:
```cmd
Right-click on script → Send to → Desktop (create shortcut)
```

### 2. Always Backup First:
Before using `/all`, backup:
- products.json
- images folder
- Any custom configurations

### 3. Use Safe Mode First:
Try `reset-app.bat` (without `/all`) first to see if it solves your issue.

### 4. Check Output:
Both scripts show what they're doing - read the messages!

### 5. Run from Correct Location:
Run the scripts from the app's installation folder for best results.

---

## 📞 Support

### If Reset Doesn't Work:

1. **Manual Reset:**
   ```
   1. Close the app completely
   2. Delete: %APPDATA%\SakrStoreManager
   3. Delete: %LOCALAPPDATA%\SakrStoreManager
   4. Delete: %TEMP%\SakrStoreManager
   5. (Optional) Delete your project folder
   6. Restart the app
   ```

2. **Check Task Manager:**
   - Make sure no app processes are running
   - Kill any lingering electron.exe processes

3. **Run as Administrator:**
   - Some folders may require admin rights to delete

---

## ⚠️ Important Warnings

### Before Using Complete Reset (`/all`):
- 🚨 **BACKUP YOUR DATA!**
- 🚨 **Cannot be undone!**
- 🚨 **All products will be lost!**
- 🚨 **All images will be lost!**
- 🚨 **Only use with test data or with backups!**

### Safe Reset Warnings:
- ⚠️ Settings will be cleared
- ⚠️ GitHub credentials will be deleted
- ⚠️ Need to reconfigure app after reset

---

## 🎓 Examples

### Example 1: App Won't Start
```cmd
# Use quick reset for speed
quick-reset.bat

# Or use smart reset for more info
reset-app.bat
Type: RESET
```

### Example 2: Want Fresh Start (Keep Products)
```cmd
reset-app.bat
Type: RESET
```

### Example 3: Complete Fresh Start (Delete All)
```cmd
# BACKUP FIRST!
reset-app.bat /all
Type: DELETE EVERYTHING
```

### Example 4: Testing as New User
```cmd
# Create test project first!
reset-app.bat /all
Type: DELETE EVERYTHING
```

---

## 🔒 Security Note

These scripts:
- ✅ Only delete app-related data
- ✅ Don't modify system files
- ✅ Don't require internet connection
- ✅ Don't send data anywhere
- ✅ Can be reviewed (they're plain text)

---

**Choose the right tool for your needs:**
- **Need it quick?** → `quick-reset.bat`
- **Want control?** → `reset-app.bat`
- **Delete everything?** → `reset-app.bat /all` (with backup!)

**Remember:** When in doubt, use safe mode and keep backups! 🛡️
