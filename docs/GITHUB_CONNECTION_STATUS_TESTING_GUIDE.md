# GitHub Connection & Status - Testing Guide

## Prerequisites

Before testing, ensure you have:
- [ ] A GitHub account
- [ ] A GitHub repository (public or private)
- [ ] A Personal Access Token with 'repo' permissions
- [ ] A local git repository initialized
- [ ] The Sakr Store Manager application running

## Creating a Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set a descriptive name: "Sakr Store Manager"
4. Select scopes: **✓ repo** (all repo permissions)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

## Test Suite

### Test 1: Valid Connection Test
**Objective**: Verify successful GitHub connection with valid credentials

**Steps:**
1. Open the application
2. Click **Settings** in the sidebar
3. Enter the following information:
   - **Repository URL**: `https://github.com/yourusername/your-repo-name`
   - **Username**: Your GitHub username
   - **Token**: Your Personal Access Token
   - **Project Path**: Click "Browse" and select your local git repository folder
4. Click **"Test Connection"**

**Expected Results:**
- ✅ Green success message appears
- ✅ Message shows: "Connection successful! Repository: yourusername/your-repo-name"
- ✅ Test completes in under 2 seconds

**Troubleshooting:**
- If error 404: Check repository URL is correct
- If error 401: Verify token is valid and has 'repo' permissions
- If network error: Check internet connection

---

### Test 2: Invalid Token Test
**Objective**: Verify proper error handling for invalid credentials

**Steps:**
1. Open Settings
2. Enter valid repository URL and username
3. Enter an invalid token: `ghp_InvalidToken123456789`
4. Select a valid project path
5. Click **"Test Connection"**

**Expected Results:**
- ✅ Red error message appears
- ✅ Message shows: "Invalid token. Please check your Personal Access Token."
- ✅ No application crash

---

### Test 3: Repository Not Found Test
**Objective**: Verify error handling for non-existent repository

**Steps:**
1. Open Settings
2. Enter valid token and username
3. Enter non-existent repository: `https://github.com/yourusername/repo-does-not-exist-12345`
4. Select a valid project path
5. Click **"Test Connection"**

**Expected Results:**
- ✅ Red error message appears
- ✅ Message shows: "Repository not found. Please check the repository URL..."
- ✅ No application crash

---

### Test 4: Status Bar - No Changes
**Objective**: Verify status bar shows ready state when no changes exist

**Prerequisites:**
- Settings must be configured and saved
- Local repository must be clean (no uncommitted changes)

**Steps:**
1. Open terminal in your project folder
2. Run: `git status`
3. Verify output shows: "nothing to commit, working tree clean"
4. Look at the status bar at the bottom of the application

**Expected Results:**
- ✅ Status indicator is **green** and steady (not pulsing)
- ✅ Status text shows: **"Ready"**
- ✅ "Publish to GitHub" button is **disabled** (grayed out)

---

### Test 5: Status Bar - Single File Change
**Objective**: Verify status bar detects and displays file changes

**Steps:**
1. Ensure repository is initially clean (see Test 4)
2. Open `products.json` in the project folder
3. Make a small change (e.g., add a space or change a value)
4. Save the file
5. Wait up to 5 seconds
6. Observe the status bar

**Expected Results:**
- ✅ Status indicator changes to **yellow** and **pulses**
- ✅ Status text shows: **"Unsaved changes: 1 file"**
- ✅ Additional details show: **"• 1 modified"**
- ✅ "Publish to GitHub" button becomes **enabled** (clickable)
- ✅ Update happens within **5 seconds** of saving the file

**Screenshot Areas:**
- Bottom status bar showing yellow pulsing indicator
- "Unsaved changes: 1 file • 1 modified"
- Enabled Publish button

---

### Test 6: Status Bar - Multiple File Changes
**Objective**: Verify status bar correctly counts and categorizes multiple changes

**Steps:**
1. In your project folder, perform these actions:
   ```bash
   # Modify an existing file
   echo " " >> products.json
   
   # Create a new file
   echo "test" > test-file.txt
   
   # Delete a file (create one first if needed)
   rm some-file.txt  # or use File Explorer to delete
   ```
2. Wait up to 5 seconds
3. Observe the status bar

**Expected Results:**
- ✅ Status shows: **"Unsaved changes: 3 files"**
- ✅ Details show breakdown: **"• 1 modified • 1 added • 1 deleted"**
- ✅ Yellow indicator pulses
- ✅ Publish button enabled

**Verify Counts:**
- Modified count matches modified files
- Added count matches new files
- Deleted count matches deleted files

---

### Test 7: Status Bar - Automatic Updates
**Objective**: Verify status bar updates automatically without manual refresh

**Steps:**
1. Start with a clean repository
2. Note the status bar shows "Ready"
3. Without clicking anything in the app, modify a file externally
4. Save the file
5. Watch the status bar (don't click refresh or anything)

**Expected Results:**
- ✅ Status bar updates **automatically** within **5 seconds**
- ✅ No manual refresh needed
- ✅ Changes are detected even if made outside the app

---

### Test 8: Status Bar - Return to Clean State
**Objective**: Verify status bar updates when changes are committed

**Steps:**
1. Make a file change (status bar should show changes)
2. In terminal, run:
   ```bash
   git add .
   git commit -m "test commit"
   ```
3. Wait up to 5 seconds
4. Observe status bar

**Expected Results:**
- ✅ Status bar returns to **"Ready"** state
- ✅ Indicator returns to **green** (no pulse)
- ✅ Publish button becomes **disabled**
- ✅ Update happens automatically

---

### Test 9: Invalid Configuration Handling
**Objective**: Verify graceful handling of missing or invalid settings

**Steps:**
1. Open Settings
2. Clear all fields (or don't save any settings)
3. Click "Test Connection"
4. Observe the status bar behavior

**Expected Results:**
- ✅ Error message shown for incomplete configuration
- ✅ Status bar shows "Ready" (doesn't crash)
- ✅ Publish button stays disabled
- ✅ No console errors

---

### Test 10: Network Offline Test
**Objective**: Verify application handles network errors gracefully

**Steps:**
1. Disconnect from internet (disable Wi-Fi/Ethernet)
2. Open Settings
3. Enter valid configuration
4. Click "Test Connection"

**Expected Results:**
- ✅ Error message: "Network error. Please check your internet connection."
- ✅ Application remains responsive
- ✅ Status bar continues to function
- ✅ No crash or freeze

---

## Performance Tests

### Test 11: Status Check Performance
**Objective**: Verify status checks don't impact application performance

**Steps:**
1. Open Task Manager / Activity Monitor
2. Note CPU and memory usage
3. Let application run with status checks for 5 minutes
4. Observe resource usage

**Expected Results:**
- ✅ CPU usage remains low (< 5% average)
- ✅ Memory usage stable (no memory leak)
- ✅ Application remains responsive
- ✅ Status updates don't cause lag

---

### Test 12: Large Repository Test
**Objective**: Verify performance with many changed files

**Steps:**
1. Create 20+ file changes in the repository
2. Wait for status bar to update
3. Observe update time and display

**Expected Results:**
- ✅ Status updates within 5 seconds
- ✅ Correct total count displayed
- ✅ Breakdown shows all categories
- ✅ No performance degradation

---

## Edge Cases

### Test 13: Special Characters in Repository Name
**Steps:**
1. Test with repository names containing:
   - Hyphens: `my-repo-name`
   - Underscores: `my_repo_name`
   - Numbers: `repo123`

**Expected Results:**
- ✅ All formats work correctly
- ✅ Connection successful for valid repos

---

### Test 14: Private Repository Access
**Steps:**
1. Use a private repository URL
2. Ensure token has 'repo' access
3. Test connection

**Expected Results:**
- ✅ Connection successful
- ✅ Shows repository name correctly
- ✅ Notes repository is private

---

### Test 15: Repository URL Formats
**Test different URL formats:**
- `https://github.com/user/repo`
- `https://github.com/user/repo.git`
- `git@github.com:user/repo.git` (should show format error)

**Expected Results:**
- ✅ HTTPS formats work
- ✅ SSH format shows helpful error

---

## Testing Checklist Summary

Copy this checklist for testing:

**Connection Tests:**
- [ ] Valid credentials → Success
- [ ] Invalid token → Error 401
- [ ] Wrong repository → Error 404
- [ ] Network offline → Network error
- [ ] Incomplete config → Validation error

**Status Bar Tests:**
- [ ] Clean repo → "Ready" state
- [ ] Single change → Detected and displayed
- [ ] Multiple changes → Correct counts
- [ ] Auto updates → Works within 5s
- [ ] After commit → Returns to "Ready"

**UI Tests:**
- [ ] Publish button disabled when no changes
- [ ] Publish button enabled with changes
- [ ] Indicator color changes (green/yellow)
- [ ] Pulse animation on changes
- [ ] Details show correct breakdown

**Performance:**
- [ ] No memory leaks
- [ ] Low CPU usage
- [ ] Responsive UI
- [ ] Fast status checks

---

## Common Issues and Solutions

### Issue: Status bar not updating
**Solutions:**
1. Check console for errors (F12)
2. Verify Settings are saved
3. Ensure project path is a git repository
4. Run `git status` in terminal to verify git works
5. Restart application

### Issue: "Repository not found" but repository exists
**Solutions:**
1. Check repository is public or token has access
2. Verify token has 'repo' permission
3. Try repository URL in browser
4. Check for typos in URL

### Issue: Changes not detected
**Solutions:**
1. Verify files are in the git repository folder
2. Check files aren't in .gitignore
3. Run `git status` to see if git detects them
4. Wait 5 seconds for auto-update

### Issue: Publish button stays disabled
**Solutions:**
1. Make a file change and save
2. Wait 5 seconds for status update
3. Check status bar shows changes
4. Verify Settings are configured

---

## Success Criteria

All tests should pass with:
- ✅ No application crashes
- ✅ Clear, helpful error messages
- ✅ Fast response times (< 2s for API calls)
- ✅ Accurate status information
- ✅ Smooth UI updates
- ✅ Low resource usage

---

## Reporting Issues

If you find bugs, report with:
1. **Test number** that failed
2. **Steps to reproduce**
3. **Expected vs actual** behavior
4. **Console errors** (if any)
5. **Screenshots** (if applicable)

Example:
```
Test 5 Failed
Steps: Modified products.json, waited 10 seconds
Expected: Status bar shows "1 file changed"
Actual: Status bar still shows "Ready"
Console: No errors
Screenshot: [attach]
```
