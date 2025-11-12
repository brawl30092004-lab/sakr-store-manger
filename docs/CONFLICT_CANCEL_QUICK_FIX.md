# Conflict Cancel Bug - Quick Reference

## 🐛 The Bug
When cancelling conflict resolution:
- ❌ Buttons greyed out
- ❌ Status shows "Ready" (wrong)
- ❌ Local changes lost (reverted to GitHub)
- ❌ Conflict disappears

## ✅ The Fix

### Two Critical Changes:

**1. Preserve Working Directory** (`gitService.js`)
```javascript
// OLD (WRONG):
await this.git.raw(['checkout', 'HEAD', file]); // Overwrites local changes

// NEW (CORRECT):
await this.git.raw(['reset', 'HEAD', file]);    // Keeps local changes
await this.git.raw(['stash', 'drop']);          // Cleanup stash
```

**2. Refresh App State** (`useConflictHandler.js`)
```javascript
// OLD (WRONG):
const handleConflictCancelled = async () => {
  await window.electron.resolveConflict('abort');
  setShowConflictDialog(false);
  // Missing: reload & refresh!
};

// NEW (CORRECT):
const handleConflictCancelled = async () => {
  const result = await window.electron.resolveConflict('abort');
  if (result.success && onResolved) {
    await onResolved('abort', result);  // Reloads products + refreshes status
  }
  setShowConflictDialog(false);
};
```

## 🧪 Quick Test

1. Create conflict (edit same product on GitHub + app)
2. Click Publish → conflict dialog appears
3. Click Cancel
4. **Verify:**
   - ✅ Status: "1 product changed"
   - ✅ Buttons: ENABLED
   - ✅ File: Your changes intact
   - ✅ Retry: Conflict reappears

## 📁 Files Modified
- `src/services/gitService.js` (lines 2121-2164)
- `src/hooks/useConflictHandler.js` (lines 78-103)

## 📚 Full Details
See: `CONFLICT_CANCEL_BUG_FIX.md`
