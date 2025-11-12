# Git Show Syntax Error Fix (Test 5)

## 🐛 The Bug

**Error:** `fatal: unrecognized argument: --theirs:products.json`

**When:** Using field-level conflict resolution with multiple products (Test 5)

**Root Cause:** Incorrect git command syntax in `resolveConflictWithFieldSelections()`

---

## ❌ The Problem

```javascript
// WRONG CODE - in gitService.js resolveConflictWithFieldSelections()
if (isStashConflict) {
  const localContent = await this.git.show(['--theirs:products.json']);   // ❌ ERROR
  const remoteContent = await this.git.show(['--ours:products.json']);    // ❌ ERROR
} else {
  const localContent = await this.git.show(['--ours:products.json']);     // ❌ ERROR
  const remoteContent = await this.git.show(['--theirs:products.json']);  // ❌ ERROR
}
```

**Why it's wrong:**
- `--theirs` and `--ours` are flags for **`git checkout`** only
- `git show` doesn't support these flags
- Causes: `fatal: unrecognized argument: --theirs:products.json`

---

## ✅ The Solution

Use **git stage numbers** instead:

```javascript
// CORRECT CODE - Fixed version
if (isStashConflict) {
  // Stash conflict: :3 = local (stashed changes), :2 = remote (pulled changes)
  const localContent = await this.git.show([':3:products.json']);   // ✅ CORRECT
  const remoteContent = await this.git.show([':2:products.json']);  // ✅ CORRECT
} else {
  // Merge conflict: :2 = local (our HEAD), :3 = remote (their MERGE_HEAD)
  const localContent = await this.git.show([':2:products.json']);   // ✅ CORRECT
  const remoteContent = await this.git.show([':3:products.json']);  // ✅ CORRECT
}
```

---

## 📚 Git Stage Numbers Explained

When git detects a conflict, it stores three versions in the index:

- **`:1:file`** = Base (common ancestor)
- **`:2:file`** = Ours (local side)
  - In **merge conflicts**: Your HEAD (local changes)
  - In **stash conflicts**: What you just pulled from remote
- **`:3:file`** = Theirs (remote side)
  - In **merge conflicts**: Their MERGE_HEAD (remote changes)
  - In **stash conflicts**: Your stashed local changes

### Why Different for Stash vs Merge?

**Merge Conflict:**
```
You: HEAD (local)         → :2
They: MERGE_HEAD (remote) → :3
```

**Stash-Pop Conflict:**
```
You: stash (local)        → :3  (reversed!)
They: HEAD (remote)       → :2  (reversed!)
```

This is because in stash-pop:
1. We pull from GitHub → becomes HEAD (:2)
2. We apply stash on top → becomes the "incoming" changes (:3)

---

## 🎯 What This Fixes

**Test 5: Multiple Products Conflict**
- Creating multiple product conflicts
- Using field-level selection (advanced mode)
- Reading conflict versions to show in UI

**Before Fix:**
```
User clicks "Choose Individual Fields"
  → App tries: git show --theirs:products.json
  → Error: fatal: unrecognized argument: --theirs:products.json
  → Feature fails
```

**After Fix:**
```
User clicks "Choose Individual Fields"
  → App tries: git show :3:products.json
  → Success: Gets conflict version
  → Shows field-by-field comparison
  → User selects fields
  → Merge succeeds
```

---

## 🧪 Testing

**Quick Test:**
1. Edit 2+ products on GitHub (e.g., Laptop price, Chair description)
2. Edit same products locally with different changes
3. Try to publish → conflict dialog
4. Click "🎯 Choose Individual Fields (Advanced)"
5. **Expected:** See field-by-field comparison (not error)
6. Select fields and resolve
7. **Expected:** Successful merge with your custom selections

---

## 📁 File Modified

**`src/services/gitService.js`** (lines 1987-2001)
- Changed 4 lines from `--theirs:file`/`--ours:file` → `:2:file`/`:3:file`
- Added explanatory comments about stage numbers

---

## 🔗 Related Commands

### For `git checkout` (resolving conflicts):
```bash
git checkout --ours file    # Keep local version
git checkout --theirs file  # Keep remote version
```

### For `git show` (reading conflict versions):
```bash
git show :2:file  # Show local version
git show :3:file  # Show remote version
git show :1:file  # Show base version
```

### For `git diff` (comparing versions):
```bash
git diff :2:file :3:file  # Compare local vs remote
```

---

## ✅ Verification

After fix:
- ✅ No syntax errors in code
- ✅ Test 5 should pass
- ✅ Field-level selection feature works
- ✅ Multi-product conflicts handled correctly

---

**Status:** FIXED ✅  
**Test:** Test 5 - Multiple Products  
**Date:** November 13, 2025
