# Testing the Crash Screen - Quick Guide

## 🧪 How to Trigger the Crash Screen for Testing

### Method 1: Browser Console (Recommended) ⭐

1. **Open the app**
2. **Press F12** to open Developer Tools
3. **Go to the Console tab**
4. **Type this command and press Enter:**
   ```javascript
   throw new Error("Testing crash screen - This is intentional");
   ```
5. **The ErrorBoundary crash screen will appear immediately!**

---

### Method 2: Test Button in Help Menu (Development Only) 🔧

**Only available when running in development mode (not in production build):**

1. **Open the app in dev mode** (`npm run dev`)
2. **Click Help menu**
3. **Click "🧪 Test Crash Screen"** (at the bottom under "Development" section)
4. **Crash screen appears!**

**Note:** This button is automatically hidden in production builds.

---

### Method 3: Modify a Component Temporarily 🛠️

If you want to test the crash screen as part of normal app flow:

1. **Open any component file** (e.g., `src/App.jsx`)
2. **Add this inside the component:**
   ```jsx
   // Temporary crash trigger
   useEffect(() => {
     throw new Error("Test crash");
   }, []);
   ```
3. **Save the file**
4. **The app will crash and show the error screen**
5. **Remove the code when done testing**

---

## 🎯 What to Test

### Basic Functionality:
- ✅ Error screen appears with error message
- ✅ "Restart Application" button works
- ✅ "Copy Error Details" button copies to clipboard
- ✅ Technical details are expandable/collapsible

### Force Reset Section:
- ✅ "⚠️ Crash persists? Try Force Reset" is collapsed by default
- ✅ Clicking expands the section
- ✅ Warning message is clear
- ✅ List of deleted data is visible
- ✅ Note about safe data (products.json) is shown

### Complete Reset Option:
- ✅ Checkbox "🚨 Also delete ALL project data" is visible
- ✅ Checking it shows warning in red
- ✅ Button text changes to "🚨 Delete EVERYTHING & Reset"
- ✅ Unchecking reverts to "⚠️ Force Reset App Data"

### Force Reset Execution:
- ✅ **Without checkbox:** Deletes app data, keeps products
- ✅ **With checkbox:** Deletes EVERYTHING including project folder

---

## 📊 Testing Scenarios

### Scenario 1: Basic Force Reset (Safe)

**Steps:**
1. Trigger crash screen (F12 → Console → `throw new Error("test")`)
2. Expand "Force Reset" section
3. **DO NOT** check the "delete project data" checkbox
4. Click "⚠️ Force Reset App Data"
5. Confirm in dialog

**Expected Results:**
- ✅ App quits and relaunches
- ✅ Welcome screen appears
- ✅ Settings are cleared
- ✅ **products.json still exists**
- ✅ **Images still exist**
- ✅ Project folder intact

---

### Scenario 2: Complete Reset (DANGER)

**Steps:**
1. Trigger crash screen
2. Expand "Force Reset" section
3. **CHECK** the "🚨 Also delete ALL project data" checkbox
4. Notice button text changes to "🚨 Delete EVERYTHING & Reset"
5. Click the button
6. Read the scary confirmation dialog
7. Click OK (if testing in a safe environment with backup!)

**Expected Results:**
- ✅ App quits and relaunches
- ✅ Welcome screen appears
- ✅ Settings are cleared
- ✅ **products.json is DELETED**
- ✅ **All images are DELETED**
- ✅ **Entire project folder is DELETED**

**⚠️ WARNING:** Only test Scenario 2 with test data or with a backup!

---

## 🛡️ Safety Tips for Testing

### Before Testing Complete Reset:

1. **Backup your data:**
   ```
   - Copy products.json to safe location
   - Copy images folder to safe location
   - Note your project path
   ```

2. **Use a test project folder:**
   - Create a separate test folder
   - Add dummy products.json
   - Add dummy images
   - Point the app to this test folder

3. **Test in development first:**
   - Run `npm run dev`
   - Test with fake data
   - Verify behavior before production

---

## 🔍 What to Verify After Reset

### After Basic Reset (No checkbox):
```
✅ Check: %APPDATA%\SakrStoreManager deleted
✅ Check: Welcome screen appears
✅ Check: Settings are empty
✅ Check: products.json exists at project path
✅ Check: images/ folder exists
```

### After Complete Reset (With checkbox):
```
✅ Check: %APPDATA%\SakrStoreManager deleted
✅ Check: Welcome screen appears
✅ Check: Settings are empty
✅ Check: Project folder does NOT exist
✅ Check: products.json does NOT exist
✅ Check: images/ folder does NOT exist
```

---

## 🐛 Common Issues

### Issue: Can't trigger crash screen
**Solution:** Make sure DevTools is open (F12) and you're in the Console tab.

### Issue: Error doesn't show in ErrorBoundary
**Solution:** ErrorBoundary only catches errors during rendering. Use `throw new Error()` in console.

### Issue: Test button not visible
**Solution:** Test button only appears in dev mode. Run `npm run dev` instead of production build.

### Issue: Reset doesn't delete project folder
**Causes:**
- Checkbox wasn't checked
- Project path not set in localStorage
- Folder doesn't exist
- Permission issues

**Check console logs** for details.

---

## 📝 Console Log Messages to Look For

### During Force Reset:
```
[app:forceReset] Starting force reset of app data...
[app:forceReset] Include project data: false (or true)
[app:forceReset] User data path: C:\Users\...\AppData\Roaming\SakrStoreManager
[app:forceReset] Deleting userData directory...
[app:forceReset] ✓ userData deleted
[app:forceReset] ✓ App temp deleted
[app:forceReset] ✓ Logs deleted
[app:forceReset] Force reset completed successfully!
```

### With Project Data Deletion:
```
[app:forceReset] ⚠️ DELETING PROJECT DATA at: E:\Projects\MyStore
[app:forceReset] ✓ Project folder deleted (including products.json and images)
```

---

## 🎬 Quick Test Script

**For a quick sanity check, run this in Console:**

```javascript
// Test 1: Show error screen
throw new Error("Test crash screen");

// After error screen appears, you can:
// - Expand Force Reset section
// - Toggle checkbox
// - Verify button text changes
// - Click Cancel to dismiss
```

---

## ✅ Checklist for Complete Test

- [ ] Trigger crash screen using F12 Console
- [ ] Verify error message displays correctly
- [ ] Test "Restart Application" button
- [ ] Test "Copy Error Details" button
- [ ] Expand Force Reset section
- [ ] Verify warning and lists are clear
- [ ] Test checkbox interaction (check/uncheck)
- [ ] Verify button text changes with checkbox
- [ ] Test basic reset (no checkbox) with backup data
- [ ] Verify products survive basic reset
- [ ] Test complete reset (with checkbox) with test data only
- [ ] Verify everything deleted with complete reset
- [ ] Test in both dev and production modes

---

## 🎓 Pro Tips

1. **Always have backups** before testing complete reset
2. **Use console logs** to verify what's being deleted
3. **Test with dummy data** first
4. **Keep DevTools open** to see any errors
5. **Read confirmation dialogs** carefully before clicking OK

---

**Remember:** The crash screen is there to help users recover from issues. Test it thoroughly but safely! 🛡️

**Need more help?** See `APP_RESET_IMPLEMENTATION.md` for full technical details.
