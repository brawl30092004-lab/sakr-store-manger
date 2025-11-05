# Enhanced Git Sync & Conflict Resolution - Implementation Guide

## Overview

This document describes the implementation of four major improvements to the Git integration, focused on user-friendliness and ease of use:

1. **Manual Pull/Sync** - User-initiated sync button with last sync time display
2. **Periodic Auto-Check** - Background checking for remote changes every 5 minutes
3. **Visual Conflict Resolution** - User-friendly dialog for resolving merge conflicts
4. **Network Resilience** - Automatic retry logic with exponential backoff

## Features Implemented

### 1. Pull/Sync Management

#### Manual Sync Button
- **Location**: Top-right of the main content area (next to breadcrumbs)
- **Functionality**: 
  - One-click sync from GitHub
  - Shows "Update" when remote changes are available
  - Shows "Sync" when up to date
  - Displays last sync time (e.g., "2 minutes ago")
  - Auto-reloads products after successful sync

#### Last Sync Tracking
- Stores timestamp in `localStorage`
- Displays relative time format
- Persists across app restarts

#### Remote Changes Indicator
- **Green badge** with ⬇️ icon shows number of incoming changes
- **Orange badge** with ⬆️ icon shows number of unpublished local changes
- Badges pulse to draw attention

### 2. Periodic Auto-Sync

#### Background Checking
- Checks for remote changes every **5 minutes**
- Uses `git fetch` to check without pulling
- Doesn't interrupt user workflow
- Shows notification when new changes are detected

#### Smart Notifications
```javascript
// Example notification
"3 new change(s) available on GitHub. Click sync to update."
```

#### Automatic Cleanup
- Clears interval on component unmount
- No memory leaks

### 3. Visual Conflict Resolution

#### Conflict Detection
- Automatically detects merge conflicts during sync
- Shows user-friendly dialog instead of cryptic error messages
- Provides conflict details (files, versions)

#### Resolution Options

**Option 1: Keep Local Changes** 💻
- Keeps your local version
- Discards GitHub version
- Best when you made recent changes

**Option 2: Use GitHub Version** ☁️
- Discards local changes
- Uses GitHub version
- **Warning**: Local changes will be lost

**Option 3: Cancel** 🚫
- Aborts the merge
- Keeps everything as is
- Try again later

#### User Experience
- Large, clear icons for each option
- Plain language explanations
- Color-coded buttons
- Warning indicators
- Helpful tips at the bottom

### 4. Network Resilience

#### Retry Logic
- Automatic retry up to **3 attempts**
- Exponential backoff: 1s, 2s, 4s
- Maximum wait time: 5 seconds

#### Smart Retry
- **Retries** network errors (timeout, connection lost)
- **Does NOT retry** authentication errors (401, 403)
- **Does NOT retry** conflict errors (manual resolution required)

#### Better Error Messages
```javascript
// Network error
"Failed to connect to GitHub. Retrying (attempt 2/3)..."

// Auth error
"Authentication failed. Please check your token in Settings."

// Conflict error
"Merge conflict detected. Choose how to resolve."
```

---

## Technical Implementation

### GitService Enhancements

#### New Methods

##### `checkForRemoteChanges(branch)`
```javascript
// Checks for remote changes without pulling
const result = await gitService.checkForRemoteChanges();

// Returns:
{
  success: true,
  hasRemoteChanges: true,
  behindBy: 3,        // Number of commits behind
  aheadBy: 1,         // Number of commits ahead
  upToDate: false,
  message: "3 new change(s) available on GitHub"
}
```

##### `pullWithRetry(branch, maxRetries)`
```javascript
// Pull with automatic retry
const result = await gitService.pullWithRetry(null, 3);

// Features:
// - Retries network errors
// - Exponential backoff
// - Doesn't retry auth/conflict errors
```

##### `getConflictDetails()`
```javascript
// Get detailed conflict information
const result = await gitService.getConflictDetails();

// Returns:
{
  success: true,
  hasConflicts: true,
  conflictedFiles: ['products.json'],
  conflicts: [
    {
      file: 'products.json',
      localVersion: '...',
      remoteVersion: '...'
    }
  ]
}
```

##### `resolveConflict(resolution, files)`
```javascript
// Resolve conflicts programmatically
const result = await gitService.resolveConflict('local'); // or 'remote' or 'abort'

// Returns:
{
  success: true,
  resolved: true,
  resolution: 'local',
  filesResolved: 1,
  message: "Resolved 1 file(s) by keeping local version"
}
```

##### `pushWithRetry(branch, maxRetries)`
```javascript
// Push with automatic retry
const result = await gitService.pushWithRetry(null, 3);
```

### IPC Handlers (main.cjs)

#### New Channels

| Channel | Purpose |
|---------|---------|
| `git:checkRemoteChanges` | Check for remote changes without pulling |
| `git:pullManual` | Manual pull with retry logic |
| `git:getConflictDetails` | Get detailed conflict information |
| `git:resolveConflict` | Resolve conflicts (local/remote/abort) |

### React Components

#### SyncStatusIndicator
**File**: `src/components/SyncStatusIndicator.jsx`

**Features**:
- Shows last sync time
- Manual sync button
- Remote changes badge
- Local changes badge
- Background checking (every 5 minutes)
- Conflict dialog integration

**Props**: None (uses Redux for data source check)

**State**:
```javascript
{
  lastSyncTime: Date,           // Last sync timestamp
  isSyncing: boolean,            // Sync in progress
  syncStatus: string,            // Status message
  remoteChanges: Object,         // Remote changes info
  showConflictDialog: boolean    // Conflict dialog visibility
}
```

#### ConflictResolutionDialog
**File**: `src/components/ConflictResolutionDialog.jsx`

**Props**:
```javascript
{
  isOpen: boolean,                        // Dialog visibility
  onClose: () => void,                   // Close handler
  onResolved: (resolution) => void       // Resolution callback
}
```

**Features**:
- Auto-loads conflict details
- Three resolution options
- Clear visual design
- Loading states
- Error handling

---

## User Workflows

### Workflow 1: Normal Sync

1. User clicks **Sync** button
2. System pulls from GitHub
3. If successful:
   - Shows success message
   - Updates last sync time
   - Reloads products (if changes)
4. Sync button shows "Up to date"

### Workflow 2: Sync with Conflicts

1. User clicks **Sync** button
2. System detects conflict during pull
3. Conflict dialog appears with options:
   - **Keep Local**: User's changes win
   - **Use GitHub**: GitHub version wins  
   - **Cancel**: Abort and try later
4. User chooses option
5. System resolves automatically
6. Products reload with resolved version

### Workflow 3: Background Check

1. Every 5 minutes, system checks GitHub
2. If new changes found:
   - Shows green badge with count
   - Shows notification
   - Sync button changes to "Update"
3. User can ignore or click to sync
4. No interruption to workflow

### Workflow 4: Network Failure

1. User clicks **Sync** button
2. Network fails (timeout/disconnected)
3. System shows: "Retrying (attempt 1/3)..."
4. Waits 1 second, tries again
5. Still fails, waits 2 seconds
6. Tries third time, waits 4 seconds
7. If all attempts fail:
   - Shows error message
   - User can try again manually

---

## UI/UX Design

### Sync Status Indicator

```
┌────────────────────────────────────────────┐
│ Last synced: 2 minutes ago  [⬇️ 3 new]     │
│                             [🔄 Sync]       │
└────────────────────────────────────────────┘
```

### Conflict Resolution Dialog

```
┌──────────────────────────────────────────────┐
│              ⚠️                               │
│       Merge Conflict Detected                │
│  Changes on GitHub conflict with your        │
│  local changes                               │
├──────────────────────────────────────────────┤
│                                              │
│  1 file(s) have conflicting changes:         │
│  📄 products.json                            │
│                                              │
│  What do you want to do?                     │
│                                              │
│  ┌──────────────────────────────────┐        │
│  │ 💻 Keep My Local Changes         │        │
│  │ Keep your local version          │        │
│  │ ✓ Recommended if you made        │        │
│  │   recent changes                 │        │
│  └──────────────────────────────────┘        │
│                                              │
│  ┌──────────────────────────────────┐        │
│  │ ☁️ Use GitHub Version            │        │
│  │ Discard your local changes       │        │
│  │ ⚠️ Your local changes will be    │        │
│  │   lost                           │        │
│  └──────────────────────────────────┘        │
│                                              │
│  ┌──────────────────────────────────┐        │
│  │ 🚫 Cancel                        │        │
│  │ Abort the sync                   │        │
│  │ ℹ️ You can try again later       │        │
│  └──────────────────────────────────┘        │
│                                              │
│  [💻 Keep Local] [☁️ Use GitHub] [Cancel]   │
├──────────────────────────────────────────────┤
│  💡 Tip: If unsure, click Cancel and         │
│  contact your team to coordinate.            │
└──────────────────────────────────────────────┘
```

---

## Configuration

### Periodic Check Interval
```javascript
// In SyncStatusIndicator.jsx
const CHECK_INTERVAL = 300000; // 5 minutes in milliseconds

// To change:
const CHECK_INTERVAL = 600000; // 10 minutes
```

### Retry Configuration
```javascript
// In gitService.js
async pullWithRetry(branch = null, maxRetries = 3) {
  // Change maxRetries here or when calling:
  const result = await gitService.pullWithRetry(null, 5); // 5 retries
}
```

### Backoff Timing
```javascript
// In gitService.js - pullWithRetry method
const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);

// Formula: min(1000 * 2^(attempt-1), 5000)
// Attempt 1: 1000ms (1 second)
// Attempt 2: 2000ms (2 seconds)
// Attempt 3: 4000ms (4 seconds)
// Maximum: 5000ms (5 seconds)
```

---

## Testing

### Test Case 1: Manual Sync (Happy Path)
1. Make changes on GitHub
2. Click Sync button in app
3. **Expected**: Success message, products reload

### Test Case 2: Conflict Resolution
1. Make local changes to Product A
2. Make different changes to Product A on GitHub
3. Click Sync button
4. **Expected**: Conflict dialog appears
5. Choose "Keep Local"
6. **Expected**: Local version preserved, sync completes

### Test Case 3: Network Failure
1. Disconnect internet
2. Click Sync button
3. **Expected**: Retry messages appear (3 attempts)
4. **Expected**: Final error message after all retries fail

### Test Case 4: Background Check
1. Wait 5 minutes with app open
2. Make changes on GitHub
3. **Expected**: Notification appears
4. **Expected**: Green badge shows change count
5. **Expected**: Sync button shows "Update"

### Test Case 5: Auth Error (No Retry)
1. Delete/invalidate GitHub token
2. Click Sync button
3. **Expected**: Auth error immediately (no retries)
4. **Expected**: Clear error message about token

---

## Troubleshooting

### Issue: Sync button not appearing
**Solution**: Check that `dataSource === 'github'` in Redux store

### Issue: Background checks not working
**Solution**: Check browser console for interval errors. Verify `checkForRemoteChanges` IPC handler is registered.

### Issue: Conflict dialog doesn't show
**Solution**: Verify `ConflictResolutionDialog` is imported in `SyncStatusIndicator.jsx`

### Issue: Last sync time not persisting
**Solution**: Check `localStorage` permissions. Verify data is being saved: `localStorage.getItem('lastGitSync')`

### Issue: Retry logic not working
**Solution**: Check network error detection in `pullWithRetry`. Verify error messages include network keywords.

---

## Performance Considerations

### Background Checking
- **CPU Impact**: Minimal (fetch only, no clone/pull)
- **Network Impact**: Small (~few KB per check)
- **Memory Impact**: Negligible

### Interval Management
```javascript
// Proper cleanup prevents memory leaks
useEffect(() => {
  const interval = setInterval(check, 300000);
  return () => clearInterval(interval); // IMPORTANT
}, []);
```

### Dialog Rendering
- Uses conditional rendering (`isOpen`)
- No performance impact when closed
- Lazy loads conflict details

---

## Future Enhancements

### Planned
1. ✅ Manual sync button
2. ✅ Conflict resolution UI  
3. ✅ Background checking
4. ✅ Network retry logic

### Potential Future Additions
1. **Sync Progress Bar** - Visual progress during sync
2. **Commit History** - View recent commits
3. **Branch Switching** - Switch between branches
4. **Merge Preview** - Preview changes before syncing
5. **Offline Queue** - Queue syncs when offline
6. **Sync Scheduling** - Custom sync intervals
7. **Multi-Remote** - Support multiple remotes

---

## Dependencies

### NPM Packages
- `simple-git` - Git operations
- `react-hot-toast` - Notifications
- `lucide-react` - Icons (optional for enhancements)

### Internal Dependencies
- Redux store (for `dataSource`)
- `toastService.js` (for notifications)
- `gitService.js` (core Git logic)

---

## Files Modified

| File | Changes |
|------|---------|
| `src/services/gitService.js` | Added 5 new methods for sync and conflict handling |
| `electron/main.cjs` | Added 4 new IPC handlers |
| `electron/preload.js` | Exposed 4 new IPC channels |
| `src/components/SyncStatusIndicator.jsx` | New component (manual sync UI) |
| `src/components/SyncStatusIndicator.css` | New styles |
| `src/components/ConflictResolutionDialog.jsx` | New component (conflict UI) |
| `src/components/ConflictResolutionDialog.css` | New styles |
| `src/App.jsx` | Integrated SyncStatusIndicator |
| `src/App.css` | Added header bar styles |

---

## Summary

These enhancements make Git integration significantly more user-friendly:

✅ **No Terminal Required** - Everything in the UI
✅ **Clear Feedback** - Always know sync status
✅ **Automatic Recovery** - Network errors handled automatically  
✅ **Conflict Resolution** - Simple, visual choices
✅ **Non-Intrusive** - Background checks don't interrupt work
✅ **Informative** - Badges and notifications keep user informed

Perfect for non-technical users who want GitHub sync without Git knowledge! 🎉
