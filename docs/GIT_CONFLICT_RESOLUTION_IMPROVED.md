# Git Conflict Resolution - Improved Implementation

## 🎯 Overview

This document describes the **completely redesigned** git conflict handling flow that fixes all the issues with the previous implementation.

---

## 🔴 Problems Fixed

### Before (Broken Flow)
```
User clicks "Publish"
  ↓
publishChanges() attempts pull
  ↓
CONFLICT DETECTED ❌
  ↓
Shows error toast: "Merge conflicts detected"
  ↓
User is STUCK - no UI options
  ↓
Must use terminal to resolve manually
```

### After (Working Flow)
```
User clicks "Publish"
  ↓
publishChanges() attempts pull
  ↓
CONFLICT DETECTED ✅
  ↓
Shows ConflictResolutionDialog
  ↓
User picks: Keep Local / Use Remote / Cancel
  ↓
Conflict auto-resolved
  ↓
Automatically continues with commit + push
  ↓
SUCCESS! ✅
```

---

## 🎯 Key Improvements

### 1. **Graceful Conflict Detection**
- `publishChanges()` no longer fails immediately on conflicts
- Returns special `hasConflict: true` flag instead
- Preserves all context needed to continue after resolution

### 2. **Unified Conflict Handler**
- New `useConflictHandler` hook centralizes all conflict logic
- Used consistently across all publish entry points:
  - ✅ StatusBar "Publish to GitHub" button
  - ✅ App menu "Publish to GitHub"
  - ✅ Command Palette publish
  - ✅ SyncStatusIndicator manual sync

### 3. **Automatic Resume After Resolution**
- New `continuePublishAfterResolution()` method
- After user resolves conflict, automatically:
  1. Commits changes
  2. Pushes to GitHub
  3. Shows success message
- **No page reload needed**

### 4. **Better User Experience**
- Clear, actionable dialog with three options
- Shows which files have conflicts
- Explains what each option does
- Loading states during resolution
- Success/error feedback

---

## 🏗️ Architecture

### New Files Created

#### `src/hooks/useConflictHandler.js`
Reusable custom hook that manages:
- Dialog state (open/closed)
- Resolution logic
- Automatic publish continuation
- Error handling

**Usage:**
```javascript
const {
  showConflictDialog,
  isResolving,
  handleConflictResolved,
  handleConflictCancelled,
  checkAndHandleConflict
} = useConflictHandler(onResolvedCallback);

// In your publish handler:
const result = await window.electron.publishToGitHub(message);
if (checkAndHandleConflict(result, message)) {
  // Conflict detected - dialog shown automatically
  return;
}
```

### Modified Files

#### `src/services/gitService.js`
**New Methods:**
- `continuePublishAfterResolution(commitMessage, files)` - Resumes publish after conflict resolution
- `checkForPotentialConflicts(branch)` - Proactively checks if conflicts will occur

**Modified Methods:**
- `publishChanges()` - Returns conflict info instead of failing
  ```javascript
  // Before:
  if (!results.pull.success) {
    return { success: false, error: ... }; // Just fails
  }
  
  // After:
  if (results.pull.error === 'Merge conflicts detected') {
    return {
      success: false,
      hasConflict: true,  // ✅ Special flag
      needsResolution: true,
      conflicts: results.pull.conflicts
    };
  }
  ```

#### `src/components/StatusBar.jsx`
- Imports `useConflictHandler` hook
- Imports `ConflictResolutionDialog`
- `handlePublish()` checks for conflicts with `checkAndHandleConflict()`
- Renders conflict dialog

#### `src/components/App.jsx`
- Imports `useConflictHandler` hook
- Imports `ConflictResolutionDialog`
- `handlePublishToGitHub()` checks for conflicts
- Renders conflict dialog

#### `src/components/ConflictResolutionDialog.jsx`
- Accepts `isResolving` prop from hook
- Can use external resolution handler (from hook)
- Better messages during resolution
- Shows "Resolving conflict and publishing..." status

#### `electron/main.cjs`
**New IPC Handlers:**
- `git:continuePublish` - Continues publish after resolution
- `git:checkPotentialConflicts` - Checks for potential conflicts

#### `electron/preload.js`
**New APIs:**
- `continuePublish(commitMessage, files)`
- `checkPotentialConflicts()`

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────┐
│  User clicks "Publish to GitHub"                │
│  (from StatusBar, App menu, or Command Palette) │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  handlePublish() / handlePublishToGitHub()      │
│  Calls: window.electron.publishToGitHub()       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GitService.publishChanges()                    │
│  Step 1: Pull from GitHub                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌───────┴────────┐
         │                │
    No Conflict      Conflict!
         │                │
         ▼                ▼
┌──────────────┐  ┌──────────────────────────────┐
│ Continue     │  │ Return:                      │
│ with commit  │  │ {                            │
│ and push     │  │   hasConflict: true,         │
│              │  │   needsResolution: true,     │
│              │  │   conflicts: [...]           │
│              │  │ }                            │
└──────────────┘  └────────────┬─────────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ checkAndHandleConflict()   │
                  │ Detects conflict flag      │
                  │ Shows dialog               │
                  └────────────┬───────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ ConflictResolutionDialog   │
                  │                            │
                  │ Options:                   │
                  │ • Keep Local 💻            │
                  │ • Use GitHub ☁️            │
                  │ • Cancel 🚫                │
                  └────────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         Keep Local       Use GitHub        Cancel
              │                │                │
              ▼                ▼                ▼
   ┌──────────────────┐ ┌──────────────┐ ┌─────────────┐
   │ resolveConflict( │ │ resolve...   │ │ Abort merge │
   │   'local'        │ │   'remote'   │ │             │
   │ )                │ │ )            │ │             │
   └────────┬─────────┘ └──────┬───────┘ └──────┬──────┘
            │                  │                 │
            └──────────────────┴─────────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ handleConflictResolved()   │
                  │ (from useConflictHandler)  │
                  └────────────┬───────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ Step 1: Resolve conflict   │
                  │ (git checkout --ours/theirs│
                  │  + git add + commit)       │
                  └────────────┬───────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ Step 2: Continue publish   │
                  │ continuePublishAfter...()  │
                  │ • Commit changes           │
                  │ • Push to GitHub           │
                  └────────────┬───────────────┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │ ✅ SUCCESS                 │
                  │ "Successfully published!"  │
                  │ Refresh git status         │
                  └────────────────────────────┘
```

---

## 📝 Usage Examples

### Example 1: StatusBar Publish with Conflict

```javascript
// User clicks "Publish to GitHub" button in StatusBar
const handlePublish = async (commitMessage = null) => {
  const result = await window.electron.publishToGitHub(commitMessage);
  
  // Check for conflict
  if (checkAndHandleConflict(result, commitMessage)) {
    // Dialog shown automatically
    // Hook handles resolution and continuation
    return;
  }
  
  // No conflict - handle success/error normally
  if (result.success) {
    showSuccess('Published!');
  }
};
```

### Example 2: App Menu Publish with Conflict

```javascript
// User selects "Publish to GitHub" from File menu
const handlePublishToGitHub = async () => {
  const message = prompt('Commit message:');
  if (message) {
    const result = await window.electron.publishToGitHub(message);
    
    if (checkAndHandleConflict(result, message)) {
      console.log('Conflict detected, showing dialog');
      return;
    }
    
    if (result.success) {
      showSuccess('Published!');
    }
  }
};
```

---

## 🧪 Testing Guide

### Test Case 1: Conflict During StatusBar Publish

**Setup:**
1. Make local change: Edit a product
2. Don't publish yet
3. On GitHub website: Edit same product differently
4. Commit on GitHub

**Steps:**
1. Click "Publish to GitHub" button in StatusBar
2. Wait for conflict detection

**Expected:**
- ✅ Dialog appears: "Merge Conflict Detected"
- ✅ Shows conflicted file (e.g., products.json)
- ✅ Three options visible
- ✅ Click "Keep Local"
- ✅ Shows "Resolving conflict and publishing..."
- ✅ Success message appears
- ✅ Changes published to GitHub
- ✅ No page reload needed

### Test Case 2: Conflict During Menu Publish

**Setup:** Same as Test Case 1

**Steps:**
1. Click File menu → "Publish to GitHub"
2. Enter commit message
3. Wait for conflict detection

**Expected:**
- ✅ Dialog appears immediately
- ✅ Can resolve and publish
- ✅ Menu closes after success

### Test Case 3: Cancel Conflict Resolution

**Steps:**
1. Trigger conflict (as above)
2. Click "Cancel" button

**Expected:**
- ✅ Shows "Merge cancelled"
- ✅ Dialog closes
- ✅ Git state cleaned up (merge aborted)
- ✅ Local changes preserved
- ✅ Can try publish again later

### Test Case 4: Use Remote Version

**Steps:**
1. Trigger conflict
2. Click "Use GitHub Version"

**Expected:**
- ✅ Conflict resolved
- ✅ Local changes discarded
- ✅ GitHub version kept
- ✅ Successfully published
- ✅ Products reload with GitHub data

---

## 🔧 API Reference

### useConflictHandler Hook

```javascript
const {
  showConflictDialog,      // boolean - Dialog visibility
  isResolving,             // boolean - Resolution in progress
  handleConflictResolved,  // function(resolution) - Resolve and continue
  handleConflictCancelled, // function() - Cancel/abort
  checkAndHandleConflict,  // function(result, message, files) - Check result
  setShowConflictDialog    // function(boolean) - Manual control
} = useConflictHandler(onResolvedCallback);
```

### New GitService Methods

```javascript
// Continue publish after conflict resolution
const result = await gitService.continuePublishAfterResolution(
  commitMessage,  // string - Commit message
  files          // array - Files to commit (optional)
);

// Check for potential conflicts before publish
const check = await gitService.checkForPotentialConflicts(branch);
// Returns: { potentialConflicts, diverged, hasLocalChanges, hasRemoteChanges }
```

### New Electron APIs

```javascript
// Continue publish after resolution
window.electron.continuePublish(commitMessage, files);

// Check for potential conflicts
window.electron.checkPotentialConflicts();
```

---

## 🎨 UI Components

### ConflictResolutionDialog Props

```javascript
<ConflictResolutionDialog
  isOpen={boolean}              // Show/hide dialog
  onClose={function}            // Called when cancelled
  onResolved={function}         // Called with resolution choice
  isResolving={boolean}         // Show loading state (optional)
/>
```

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Proactive Warning**
   - Check for conflicts BEFORE attempting publish
   - Show warning: "Publishing may encounter conflicts. Pull first?"

2. **Visual Diff**
   - Show side-by-side comparison of conflicting changes
   - Let users see what they're choosing between

3. **Manual Merge Option**
   - Advanced users can manually edit conflicted files
   - Opens editor with conflict markers

4. **Auto-Resolution**
   - If conflicts are trivial (e.g., different files), auto-resolve
   - Only show dialog for actual conflicting content

5. **Conflict History**
   - Track past conflicts and resolutions
   - Learn user preferences

---

## 📊 Success Metrics

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Can resolve conflicts in UI | ❌ No | ✅ Yes |
| Requires terminal knowledge | ✅ Yes | ❌ No |
| Automatic publish resume | ❌ No | ✅ Yes |
| Page reload required | ✅ Yes | ❌ No |
| Git state cleanup | ❌ Manual | ✅ Automatic |
| User friction | 🔴 High | 🟢 Low |

---

## 🐛 Known Limitations

1. **Complex Conflicts**
   - Only supports "keep local" or "keep remote" strategies
   - Cannot manually merge line-by-line conflicts
   - For complex cases, users still need git expertise

2. **Multiple Conflicted Files**
   - Resolution applies to ALL conflicted files
   - Cannot resolve different files differently

3. **Conflict Detection Timing**
   - Conflicts only detected during pull phase
   - No pre-publish warning (yet)

---

## 📚 Related Documentation

- `GIT_SYNC_ENHANCEMENTS.md` - Original conflict resolution design
- `GITHUB_PUBLISH_WORKFLOW_IMPLEMENTATION.md` - Publish workflow details
- `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md` - Error handling patterns
- `FEEDBACK_PATTERNS_GUIDE.md` - User feedback best practices

---

## ✅ Completion Checklist

- [x] Modified `gitService.publishChanges()` to return conflict info
- [x] Created `useConflictHandler` hook
- [x] Added `continuePublishAfterResolution()` method
- [x] Updated StatusBar.jsx with conflict handling
- [x] Updated App.jsx with conflict handling
- [x] Enhanced ConflictResolutionDialog
- [x] Added IPC handlers for new methods
- [x] Updated preload.js with new APIs
- [x] Added `checkForPotentialConflicts()` method
- [x] Documented complete flow

---

## 🎉 Summary

The improved git conflict resolution flow transforms a **broken, frustrating experience** into a **smooth, user-friendly workflow**. Users can now resolve conflicts directly in the UI without any git knowledge, and the system automatically continues the publish operation after resolution.

**Key Achievement:** Conflicts go from being a **blocker** to being a **minor bump** in the workflow.
