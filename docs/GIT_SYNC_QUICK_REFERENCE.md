# Git Sync Enhancements - Quick Reference

## 🚀 Quick Start

### For Users

**Manual Sync**
- Look for the **Sync** button in the top-right corner
- Click to sync changes from GitHub
- Button shows "Update" when changes are available

**Handling Conflicts**
- If conflicts occur, a dialog will appear
- Choose one of three options:
  - **Keep Local** - Your changes win
  - **Use GitHub** - GitHub version wins
  - **Cancel** - Try again later

**Background Checks**
- App checks GitHub every 5 minutes
- Green badge appears when updates are available
- Notification shows number of new changes

---

## 🛠️ For Developers

### Quick Implementation Checklist

✅ Added to `gitService.js`:
- `checkForRemoteChanges()`
- `pullWithRetry()`
- `getConflictDetails()`
- `resolveConflict()`
- `pushWithRetry()`

✅ Added to `main.cjs`:
- `git:checkRemoteChanges`
- `git:pullManual`
- `git:getConflictDetails`
- `git:resolveConflict`

✅ Components Created:
- `SyncStatusIndicator.jsx` + CSS
- `ConflictResolutionDialog.jsx` + CSS

✅ Integration:
- Added to `App.jsx`
- Exposed in `preload.js`

---

## 📋 Component Usage

### SyncStatusIndicator

```jsx
import SyncStatusIndicator from './components/SyncStatusIndicator';

// In your component
<SyncStatusIndicator />

// Only shows in GitHub mode (automatic)
```

### ConflictResolutionDialog

```jsx
import ConflictResolutionDialog from './components/ConflictResolutionDialog';

<ConflictResolutionDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onResolved={(resolution) => {
    console.log('Resolved:', resolution);
    // Reload data
  }}
/>
```

---

## 🔧 API Reference

### checkForRemoteChanges()
```javascript
const result = await window.electron.checkRemoteChanges();
// { success, hasRemoteChanges, behindBy, aheadBy, message }
```

### pullManual()
```javascript
const result = await window.electron.pullManual();
// { success, message, changes, insertions, deletions }
```

### getConflictDetails()
```javascript
const result = await window.electron.getConflictDetails();
// { success, hasConflicts, conflictedFiles, conflicts }
```

### resolveConflict(resolution, files)
```javascript
const result = await window.electron.resolveConflict('local');
// resolution: 'local', 'remote', or 'abort'
// { success, resolved, filesResolved, message }
```

---

## ⚙️ Configuration

### Change Check Interval
```javascript
// SyncStatusIndicator.jsx, line ~48
const interval = setInterval(() => {
  checkForRemoteChanges();
}, 300000); // 5 minutes (in milliseconds)
```

### Adjust Retry Count
```javascript
// gitService.js - pullWithRetry method
async pullWithRetry(branch = null, maxRetries = 3) {
  // Change 3 to desired number
}
```

### Modify Backoff Timing
```javascript
// gitService.js - pullWithRetry method
const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
// Formula: min(1000 * 2^(attempt-1), 5000ms max)
```

---

## 🎨 UI Components

### Sync Button States

| State | Appearance | When |
|-------|------------|------|
| Default | "Sync" | Up to date |
| Has Updates | "Update" + green background | Remote changes available |
| Syncing | "Syncing..." + spinning icon | Sync in progress |

### Conflict Dialog Buttons

| Button | Color | Action |
|--------|-------|--------|
| Keep Local | Blue | Keeps local version |
| Use GitHub | Green | Uses remote version |
| Cancel | Gray | Aborts merge |

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| Sync button not showing | Verify `dataSource === 'github'` |
| Background checks not working | Check console for errors, verify IPC handlers |
| Conflict dialog not appearing | Verify component import and state management |
| Retries not working | Check error detection logic in `pullWithRetry` |

---

## 📊 Status Indicators

### Badges

- **⬇️ X new** - Incoming changes from GitHub (green)
- **⬆️ X local** - Unpublished local changes (orange)

### Last Sync Time

- "Just now" - < 1 minute
- "X minutes ago" - < 1 hour
- "X hours ago" - < 24 hours  
- "X days ago" - > 24 hours
- "Never" - No sync yet

---

## 🧪 Testing Commands

### Test Manual Sync
1. Make changes on GitHub
2. Click Sync button
3. Verify success message

### Test Conflict Resolution
1. Edit same product locally and on GitHub
2. Click Sync
3. Verify conflict dialog appears
4. Test each resolution option

### Test Network Retry
1. Disconnect internet
2. Click Sync
3. Verify retry attempts (watch console)
4. Reconnect and retry

### Test Background Check
1. Open app
2. Wait 5 minutes
3. Make GitHub changes
4. Verify notification appears

---

## 📁 File Structure

```
src/
  components/
    SyncStatusIndicator.jsx      # Main sync UI
    SyncStatusIndicator.css      # Sync UI styles
    ConflictResolutionDialog.jsx # Conflict resolution
    ConflictResolutionDialog.css # Conflict dialog styles
  services/
    gitService.js                # Enhanced with new methods
  App.jsx                        # Integrated component

electron/
  main.cjs                       # New IPC handlers
  preload.js                     # Exposed IPC channels

docs/
  GIT_SYNC_ENHANCEMENTS.md       # Full documentation
  GIT_SYNC_QUICK_REFERENCE.md    # This file
```

---

## 🎯 Key Features Summary

✅ **Manual Sync Button** - One-click sync from GitHub  
✅ **Last Sync Time** - Always know when you last synced  
✅ **Remote Changes Badge** - See incoming changes at a glance  
✅ **Background Checks** - Auto-check every 5 minutes  
✅ **Conflict Resolution** - User-friendly visual dialog  
✅ **Network Retry** - 3 automatic retries with backoff  
✅ **Smart Notifications** - Non-intrusive, informative  
✅ **GitHub Mode Only** - Automatically hides in local mode

---

## 💡 Tips

- **Check before publishing**: Always sync before publishing to avoid conflicts
- **Resolve conflicts carefully**: Read descriptions before choosing
- **Watch the badges**: Green badge means updates are available
- **Don't ignore conflicts**: They won't resolve themselves
- **Use Cancel if unsure**: Better to coordinate with team first

---

## 🔗 Related Documentation

- [Full Implementation Guide](./GIT_SYNC_ENHANCEMENTS.md)
- [GitHub Clone Fix](./GITHUB_CLONE_FIX.md)
- [GitHub Settings](./GITHUB_SETTINGS_IMPLEMENTATION.md)
- [GitHub Publish Workflow](./GITHUB_PUBLISH_WORKFLOW_IMPLEMENTATION.md)
