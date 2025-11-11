# Testing Guide - User-Friendly Git Clone Implementation

## Prerequisites
1. GitHub account with a test repository
2. Personal Access Token with `repo` permissions
3. Empty folder for testing

## Test Scenarios

### ✅ Test 1: First Time Setup (Happy Path)

**Steps:**
1. Launch the app
2. Go to Settings
3. Select "GitHub Repository" as data source
4. Fill in:
   - Repository URL: `https://github.com/YOUR-USERNAME/test-repo`
   - Username: `YOUR-USERNAME`
   - Token: `ghp_XXXXXXXXXX`
   - Project Path: Browse to an **empty folder**
5. Click "Save Settings"

**Expected Results:**
- ✅ Progress overlay appears: "📥 Downloading from GitHub"
- ✅ Steps shown: Connecting → Downloading → Organizing
- ✅ Success message: "Repository downloaded successfully!"
- ✅ Folder now contains:
  - `products.json`
  - `images/` folder
  - `.git/` folder (hidden)

**Pass/Fail:** _____

---

### ✅ Test 2: Re-save with Existing Repository

**Steps:**
1. After Test 1, go back to Settings
2. Change username to something else
3. Notice token is masked (`••••••••`)
4. Click "Save Settings"

**Expected Results:**
- ✅ Progress overlay appears: "✓ Validating Repository"
- ✅ Steps shown: Checking files → Verifying GitHub connection → Complete
- ✅ Success message: "Repository validated ✓"
- ✅ NO re-download happens
- ✅ Settings saved successfully

**Pass/Fail:** _____

---

### ✅ Test 3: Missing Files (Hidden .git Remains)

**Setup:**
1. Manually delete `products.json` from your project folder
2. Keep `.git` folder (it's hidden, so folder looks empty)

**Steps:**
1. Go to Settings
2. Click "Save Settings"

**Expected Results:**
- ✅ Dialog appears: "⚠️ Files Are Missing"
- ✅ Message explains:
  - "products.json is missing"
  - "Hidden folder still connected to GitHub"
- ✅ Options shown:
  1. 🔄 Restore from GitHub (Recommended)
  2. 🗑️ Start Completely Fresh
  3. ❌ Cancel

**Test Action: Choose "Restore from GitHub"**
- ✅ Progress: "🔄 Restoring Missing Files"
- ✅ `products.json` reappears in folder
- ✅ Success: "Files restored from GitHub ✓"

**Pass/Fail:** _____

---

### ✅ Test 4: Repository URL Changed

**Setup:**
1. Create a second test repository on GitHub
2. Have an existing clone from Test 1

**Steps:**
1. Go to Settings
2. Change Repository URL to the new repo
3. Keep the same Project Path
4. Click "Save Settings"

**Expected Results:**
- ✅ Dialog appears: "🔀 Different Repository Detected"
- ✅ Shows current: `github.com/old/repo`
- ✅ Shows new: `github.com/new/repo`
- ✅ Options:
  1. 🔗 Switch Connection (keep files)
  2. 📥 Download New Repository (delete & re-clone)
  3. ❌ Cancel

**Test Action A: Choose "Switch Connection"**
- ✅ Message: "Updating GitHub connection..."
- ✅ Files stay the same
- ✅ Remote URL updated
- ✅ Success: "Remote URL updated ✓"

**Test Action B: Choose "Download New Repository"**
- ✅ Progress: "📥 Downloading from GitHub"
- ✅ Old files deleted
- ✅ New repository cloned
- ✅ Folder now has files from new repo

**Pass/Fail:** _____

---

### ✅ Test 5: Force Clone Checkbox

**Setup:**
1. Have an existing repository from previous tests

**Steps:**
1. Go to Settings
2. Check the "Start Fresh (Force Re-download)" checkbox
3. Read the warning message
4. Click "Save Settings"

**Expected Results:**
- ✅ Checkbox explanation visible:
  - "Check this to delete everything..."
  - Use cases listed
  - Warning: "⚠️ All local files will be deleted"
- ✅ Progress: "📦 Setting Up Repository"
- ✅ Steps: Preparing → Downloading → Finalizing
- ✅ All files deleted and re-downloaded
- ✅ Fresh clone from GitHub

**Pass/Fail:** _____

---

### ✅ Test 6: Non-Empty Folder (New Setup)

**Setup:**
1. Create a folder with some random files in it

**Steps:**
1. Go to Settings (fresh setup)
2. Fill in GitHub details
3. Browse to the **non-empty folder**
4. Click "Save Settings"

**Expected Results:**
- ✅ Dialog from backend: "Directory Not Empty"
- ✅ Shows file count
- ✅ Options:
  - Delete Contents and Continue (⚠️ warning)
  - Cancel - Choose Another Folder

**Test Action: Choose "Delete and Continue"**
- ✅ Files deleted
- ✅ Repository cloned
- ✅ Success

**Pass/Fail:** _____

---

### ✅ Test 7: Pull with Local Changes (Manual Test)

**Setup:**
1. Have a cloned repository
2. Edit `products.json` locally (add/remove a product)
3. DO NOT commit or publish
4. Make a change on GitHub (edit products.json directly on GitHub)

**Steps:**
1. Try to pull updates (future feature - use Git Sync)
2. Or trigger a sync that requires pull

**Expected Results:**
- ✅ Dialog: "🔄 Update Available from GitHub"
- ✅ Shows your local changes: "products.json (edited)"
- ✅ Options:
  1. 💾 Save My Changes First (Recommended)
  2. 📥 Download Updates (Discard Mine) ⚠️
  3. ❌ Cancel

**Test Action: Choose "Save My Changes First"**
- ✅ Local changes committed
- ✅ Updates pulled
- ✅ Both changes present
- ✅ Success: "Saved your changes and pulled updates"

**Pass/Fail:** _____

---

### ✅ Test 8: Cancel Operations

**Test 8a: Cancel Missing Files Restore**
1. Delete products.json
2. Click Save
3. Dialog appears
4. Click "Cancel"
- ✅ Dialog closes
- ✅ Settings NOT saved
- ✅ Can try again

**Test 8b: Cancel Repo Mismatch**
1. Change repo URL
2. Click Save
3. Dialog appears
4. Click "Cancel - Keep Current Setup"
- ✅ Dialog closes
- ✅ Old repo kept
- ✅ Settings NOT saved

**Pass/Fail:** _____

---

## Visual Checklist

### Dialogs
- [ ] Clear, non-technical language
- [ ] Icons visible and appropriate
- [ ] Recommended options highlighted in green
- [ ] Destructive options highlighted in orange
- [ ] All buttons work
- [ ] Can close dialogs
- [ ] Responsive on small screens

### Progress Indicators
- [ ] Overlay visible with semi-transparent background
- [ ] Icon animates (pulse effect)
- [ ] Steps show clearly
- [ ] Active step has spinner
- [ ] Completed steps have checkmark
- [ ] Messages update appropriately
- [ ] Closes automatically when done

### Settings UI
- [ ] Force Clone checkbox visible in GitHub mode
- [ ] Checkbox explanation clear
- [ ] Warning stands out
- [ ] Checkbox disabled during operations
- [ ] Advanced Options section styled properly

## Error Scenarios

### ❌ Test E1: Invalid Token
1. Enter wrong token
2. Click Save
- ✅ Clear error message
- ✅ No cryptic Git errors

### ❌ Test E2: Network Failure
1. Disconnect internet
2. Try to clone
- ✅ Clear error: "Cannot connect to GitHub"
- ✅ Can retry when connection restored

### ❌ Test E3: Invalid Repository URL
1. Enter `https://github.com/fake/nonexistent`
2. Click Save
- ✅ Error: "Repository not found" or "404"
- ✅ Settings not saved

## Performance Check

- [ ] Dialogs appear quickly (< 200ms)
- [ ] Progress updates smoothly
- [ ] No UI freezing during operations
- [ ] Animations are smooth
- [ ] Large repositories clone without UI hang

## Accessibility Check

- [ ] All buttons keyboard accessible (Tab navigation)
- [ ] Enter/Escape work in dialogs
- [ ] Text readable with good contrast
- [ ] Icons have appropriate size
- [ ] Touch targets large enough for mobile

## Browser Console Check

- [ ] No JavaScript errors
- [ ] Appropriate console logs for debugging
- [ ] No memory leaks (check after multiple operations)

---

## Summary

**Total Tests:** 8 scenarios + 3 error cases
**Tests Passed:** ___ / 11
**Tests Failed:** ___ / 11

**Critical Issues Found:**
1. _______________
2. _______________
3. _______________

**Minor Issues Found:**
1. _______________
2. _______________

**Recommended Improvements:**
1. _______________
2. _______________

---

## Sign-Off

**Tester Name:** _______________
**Date:** _______________
**Overall Status:** PASS / FAIL / NEEDS WORK
