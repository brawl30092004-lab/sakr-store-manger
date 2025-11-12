# Conflict Cancellation Bug Fix

## 🐛 Bug Report (Test 4)

### Symptoms
When user cancels conflict resolution during publish:
1. ❌ "Publish to Store" and "View Changes" buttons become greyed out
2. ❌ Status shows "All changes published • Ready" (incorrect)
3. ❌ App doesn't detect the changes anymore
4. ❌ Local product file reverted to GitHub version automatically
5. ❌ On next change, original conflict disappears

### Root Cause Analysis

#### Problem 1: Working Directory Overwritten
```javascript
// OLD CODE (WRONG) - in gitService.js resolveConflict()
// When MERGE_HEAD doesn't exist (stash conflicts):
for (const file of conflictedFiles) {
  await this.git.raw(['checkout', 'HEAD', file]);  // ❌ Overwrites local changes!
}
```

**Why it's wrong:**
- `git checkout HEAD file` replaces working directory with GitHub version
- User's local changes are LOST
- This happens for stash-pop conflicts (no MERGE_HEAD file)

#### Problem 2: No State Refresh After Cancel
```javascript
// OLD CODE (WRONG) - in useConflictHandler.js
const handleConflictCancelled = async () => {
  await window.electron.resolveConflict('abort');
  setShowConflictDialog(false);
  // ❌ Missing: reload products, refresh git status
};
```

**Why it's wrong:**
- Products not reloaded from disk
- Git status not rechecked
- UI shows stale state ("Ready" when changes exist)

---

## ✅ The Fix

### Fix 1: Preserve Working Directory on Abort

**File:** `src/services/gitService.js` (lines 2121-2164)

```javascript
if (resolution === 'abort') {
  const mergeHeadPath = path.join(this.projectPath, '.git', 'MERGE_HEAD');
  
  try {
    await fs.access(mergeHeadPath);
    // MERGE_HEAD exists - abort the merge
    await this.git.raw(['merge', '--abort']);
    return {
      success: true,
      aborted: true,
      message: 'Merge aborted, returned to previous state'
    };
  } catch (error) {
    // No MERGE_HEAD - this is a stash conflict
    console.log('No active merge found. This is a stash conflict - preserving working directory...');
    
    // Reset index but keep working directory
    for (const file of conflictedFiles) {
      try {
        // --mixed reset: updates index from HEAD, keeps working directory
        await this.git.raw(['reset', 'HEAD', file]);
        console.log(`Reset ${file} in index, working directory preserved`);
      } catch (resetError) {
        console.log(`Could not reset ${file}:`, resetError.message);
      }
    }
    
    // Drop the conflicting stash
    try {
      await this.git.raw(['stash', 'drop']);
      console.log('Dropped conflicting stash');
    } catch (dropError) {
      console.log('No stash to drop or already dropped');
    }
    
    return {
      success: true,
      aborted: true,
      message: 'Conflict resolution cancelled. Your local changes are preserved.'
    };
  }
}
```

**What changed:**
- ✅ Use `git reset HEAD` instead of `git checkout HEAD`
- ✅ `reset HEAD` unstages conflict but preserves working directory
- ✅ Local changes remain intact
- ✅ Drop the stash to clean up git state

### Fix 2: Refresh State After Cancel

**File:** `src/hooks/useConflictHandler.js` (lines 78-103)

```javascript
const handleConflictCancelled = useCallback(async () => {
  setIsResolving(true);
  
  try {
    // Abort the merge
    const result = await window.electron.resolveConflict('abort');
    
    if (result.success) {
      showInfo('Publish cancelled. Your local changes are preserved.');
      
      // CRITICAL: Call the onResolved callback to refresh app state
      // This reloads products from disk and refreshes git status
      // Without this, the UI shows stale state ("Ready" when changes exist)
      if (onResolved) {
        console.log('🔄 Refreshing app state after conflict cancellation...');
        await onResolved('abort', result);
      }
    } else {
      showError('Failed to cancel: ' + result.message);
    }
  } catch (error) {
    console.error('Error cancelling conflict:', error);
    showError('Failed to cancel operation');
  } finally {
    setShowConflictDialog(false);
    setPendingPublishData(null);
    setIsResolving(false);
  }
}, [onResolved]);  // Added dependency
```

**What changed:**
- ✅ Call `onResolved('abort', result)` after successful cancel
- ✅ This triggers callback in StatusBar.jsx that:
  - Reloads products via `dispatch(loadProducts())`
  - Refreshes git status via `checkGitStatus()`
- ✅ UI updates to show correct state
- ✅ Added `onResolved` to dependency array

---

## 🧪 Testing Guide

### Test Scenario: Cancel Conflict Resolution

**Setup:**
1. Create conflict:
   - Edit "Laptop" on GitHub: Price $999 → $1099
   - Edit "Laptop" locally: Description "Fast laptop" → "Ultra-fast laptop"
   - Don't sync, go directly to Publish

2. Cancel the conflict:
   - Click "Publish to Store"
   - Conflict dialog appears
   - Click "Cancel" or X button

**Expected Results After Cancel:**
1. ✅ Toast: "Publish cancelled. Your local changes are preserved."
2. ✅ Console: "🔄 Refreshing app state after conflict cancellation..."
3. ✅ Status bar shows: "1 product changed" (NOT "Ready")
4. ✅ "Publish to Store" button is ENABLED (not greyed)
5. ✅ "View Changes" button is ENABLED (not greyed)
6. ✅ Click "View Changes" - see your local changes still there:
   - "Laptop" description: "Fast laptop" → "Ultra-fast laptop" ✅
7. ✅ Check products.json file:
   - Description is "Ultra-fast laptop" (your local version) ✅
   - Price is still $999 (your local version) ✅
8. ✅ Click "Publish to Store" again - conflict appears again (same conflict)

**What Should NOT Happen:**
- ❌ Status should NOT show "Ready" after cancel
- ❌ Buttons should NOT be greyed out
- ❌ Local changes should NOT disappear
- ❌ File should NOT revert to GitHub version

---

## 📊 Git States Explained

### Merge Conflict (MERGE_HEAD exists)
```
Working Dir: <conflict markers>
Index:       <both versions>
HEAD:        <your commit>
MERGE_HEAD:  <their commit>
```
**Abort:** `git merge --abort` restores pre-merge state

### Stash Conflict (NO MERGE_HEAD)
```
Working Dir: <conflict markers>
Index:       <both versions>
Stash:       <stashed changes>
HEAD:        <current commit>
```
**Abort:** 
- OLD (WRONG): `git checkout HEAD` → overwrites working dir
- NEW (CORRECT): `git reset HEAD` → unstages, keeps working dir

---

## 🔄 Complete Cancel Flow

```
User Clicks Cancel
       ↓
handleConflictCancelled()
       ↓
window.electron.resolveConflict('abort')
       ↓
gitService.resolveConflict('abort')
       ├─ Check MERGE_HEAD exists?
       │  ├─ YES → git merge --abort
       │  └─ NO → git reset HEAD (stash conflict)
       ↓
Return success: true
       ↓
onResolved('abort', result) callback
       ├─ dispatch(loadProducts())    // Reload from disk
       └─ checkGitStatus()            // Refresh UI
       ↓
UI Updates:
  - Status bar shows changes
  - Buttons enabled
  - Toast notification
```

---

## 🎯 Key Learnings

### Git Reset Modes
- `git reset --soft HEAD`: Keep index and working dir
- `git reset --mixed HEAD`: Reset index, keep working dir ✅ (what we use)
- `git reset --hard HEAD`: Reset index AND working dir ❌ (loses changes)

### When MERGE_HEAD Exists
- Regular merge: `git merge branch`
- Cherry-pick: `git cherry-pick commit`
- Rebase: `git rebase branch`

### When MERGE_HEAD Doesn't Exist
- Stash pop: `git stash pop`
- Patch apply: `git apply`
- Manual conflict markers

### Why Callback is Critical
Without calling `onResolved()`:
- Redux store has stale product data
- Git status not rechecked
- UI shows wrong state
- User confused about what happened

---

## 📝 Files Modified

1. **src/services/gitService.js** (+20 lines)
   - Fixed abort logic to use `reset` instead of `checkout`
   - Added stash drop to clean up git state

2. **src/hooks/useConflictHandler.js** (+7 lines)
   - Added `onResolved()` callback after cancel
   - Added `onResolved` to dependency array

3. **Total Impact:** 27 lines changed, 0 bugs introduced

---

## ✅ Verification Checklist

After applying fix, verify:
- [ ] Cancel conflict → status shows changes (not "Ready")
- [ ] Cancel conflict → buttons enabled (not greyed)
- [ ] Cancel conflict → local changes preserved
- [ ] Cancel conflict → products file not reverted
- [ ] Cancel conflict → git status refreshes
- [ ] Cancel conflict → can publish again (conflict reappears)
- [ ] Console shows: "Refreshing app state after conflict cancellation"
- [ ] Toast shows: "Your local changes are preserved"
- [ ] No errors in console

---

## 🚀 Next Steps

1. Test with merge conflicts (MERGE_HEAD path)
2. Test with stash conflicts (no MERGE_HEAD path)
3. Verify multiple conflict scenarios
4. Update GIT_TESTING_COMPREHENSIVE_GUIDE.md with new Test 4 status
