# Git Conflict Resolution - Quick Reference

## 🚨 What Changed?

**The conflict handling flow is now completely fixed!** Conflicts no longer break the publish workflow.

---

## ✅ What Works Now

### Before (Broken) ❌
```
Publish → Conflict → Error Message → STUCK
```

### After (Fixed) ✅
```
Publish → Conflict → Dialog → Choose Option → Auto-Publish → Done!
```

---

## 🎯 For Users

### When You See a Conflict Dialog

**You'll see three options:**

1. **💻 Keep My Local Changes**
   - Keeps your version
   - Discards what's on GitHub
   - ✓ Use this if you just made changes

2. **☁️ Use GitHub Version**
   - Discards your changes
   - Keeps what's on GitHub
   - ⚠️ Your local work will be lost!

3. **🚫 Cancel**
   - Stops the publish
   - Keeps everything as-is
   - You can try again later

### What Happens After Choosing?
- ✅ Conflict is resolved automatically
- ✅ Your choice is published to GitHub
- ✅ Success message appears
- ✅ **No page reload needed**

---

## 🔧 For Developers

### Where It Works

Conflict handling now works in **ALL** these places:
- ✅ StatusBar "Publish to GitHub" button
- ✅ File menu → "Publish to GitHub"
- ✅ Command Palette publish
- ✅ SyncStatusIndicator manual sync

### New Hook: `useConflictHandler`

```javascript
import useConflictHandler from '../hooks/useConflictHandler';

const {
  showConflictDialog,
  isResolving,
  handleConflictResolved,
  handleConflictCancelled,
  checkAndHandleConflict
} = useConflictHandler(() => {
  // Callback after successful resolution
  console.log('Conflict resolved!');
});

// In your publish handler:
const result = await window.electron.publishToGitHub(message);
if (checkAndHandleConflict(result, message)) {
  return; // Conflict detected - dialog shown
}
```

### New GitService Methods

```javascript
// Continue publish after conflict resolution
await gitService.continuePublishAfterResolution(message, files);

// Check for potential conflicts before publish
const check = await gitService.checkForPotentialConflicts();
```

### New Electron APIs

```javascript
// Continue after resolution
await window.electron.continuePublish(message, files);

// Check for conflicts proactively
await window.electron.checkPotentialConflicts();
```

---

## 📁 Files Changed

### New Files
- `src/hooks/useConflictHandler.js` - Reusable conflict handler hook

### Modified Files
- `src/services/gitService.js` - Added conflict handling + continue publish
- `src/components/StatusBar.jsx` - Integrated conflict dialog
- `src/components/App.jsx` - Integrated conflict dialog
- `src/components/ConflictResolutionDialog.jsx` - Enhanced UX
- `electron/main.cjs` - Added IPC handlers
- `electron/preload.js` - Added APIs

---

## 🧪 Quick Test

### Test Conflict Resolution

1. **Create a conflict:**
   ```bash
   # Make local change
   # Edit a product in the app
   
   # Make remote change
   # Edit same product on GitHub website
   # Commit on GitHub
   ```

2. **Trigger conflict:**
   - Click "Publish to GitHub" in app

3. **Expected:**
   - ✅ Dialog appears
   - ✅ Shows conflicted file
   - ✅ Can choose resolution
   - ✅ Publishes automatically after choice
   - ✅ Success message

---

## 🎨 Flow Diagram (Simplified)

```
User Publishes
      ↓
   Pull from GitHub
      ↓
   Conflict? ──No──→ Commit & Push → Done!
      │
     Yes
      ↓
Show Dialog
      ↓
User Chooses
      ↓
Resolve Conflict
      ↓
Commit & Push
      ↓
Done! ✅
```

---

## 🐛 Troubleshooting

### Dialog Not Showing?
- Check browser console for errors
- Verify `useConflictHandler` is imported
- Verify `ConflictResolutionDialog` is rendered

### Resolution Fails?
- Check git status: `git status`
- Check for other conflicts: `git diff`
- Try aborting: `git merge --abort`

### Publish Doesn't Continue?
- Check `continuePublish` IPC handler
- Verify `continuePublishAfterResolution` method
- Check console logs

---

## 📚 Full Documentation

See `GIT_CONFLICT_RESOLUTION_IMPROVED.md` for:
- Complete architecture details
- Full API reference
- Comprehensive testing guide
- Flow diagrams

---

## ✨ Summary

**Problem Solved:** Users can now resolve git conflicts directly in the UI without needing git knowledge or terminal access.

**Result:** Conflicts go from being a **blocker** to a **5-second decision**.
