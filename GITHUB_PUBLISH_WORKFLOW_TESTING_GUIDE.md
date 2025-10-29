# GitHub Publish Workflow - Testing Guide

## Test Environment Setup

### Prerequisites

1. **GitHub Account** with repository access
2. **Personal Access Token** with `repo` scope
3. **Local Git Repository** initialized and configured
4. **Application** with GitHub settings configured

### Initial Setup

```bash
# Verify git is installed
git --version

# Check current repository status
cd "your-project-path"
git status

# Verify remote is configured
git remote -v
```

---

## Test Plan

### Test Suite 1: Basic Publish Operations

#### Test 1.1: First Publish (New Product)
**Objective:** Verify publish workflow with new product

**Steps:**
1. Open application
2. Navigate to Products tab
3. Click "Add Product"
4. Fill in product details:
   - Name: "Test Product 1"
   - SKU: "TEST-001"
   - Price: 99.99
   - Description: "Test product for publish workflow"
5. Upload primary image
6. Click "Save"
7. Observe status bar changes to "Unsaved changes: 2 files"
8. Click "Publish to GitHub"
9. Wait for completion

**Expected Results:**
- ✅ Button shows spinner and "Publishing..." text
- ✅ Status bar shows "Publishing..."
- ✅ Success alert appears with commit message
- ✅ Alert shows: "Added 2 file(s)" (products.json + image)
- ✅ Status bar returns to "Ready"
- ✅ Button re-enables

**GitHub Verification:**
1. Visit repository on GitHub
2. Check recent commits
3. Verify commit message contains "Added 2 file(s)"
4. Verify `products.json` includes new product
5. Verify image file exists in public/images/

**Pass Criteria:**
- All steps complete without errors
- Changes visible on GitHub within 30 seconds
- Status bar accurately reflects state

---

#### Test 1.2: Edit Existing Product
**Objective:** Verify publish workflow with modifications

**Steps:**
1. Edit existing product (change name and price)
2. Click "Save"
3. Observe status bar: "Unsaved changes: 1 file"
4. Click "Publish to GitHub"
5. Wait for completion

**Expected Results:**
- ✅ Success alert with "Modified 1 file(s)"
- ✅ Status bar returns to "Ready"

**GitHub Verification:**
- Commit message: "Update products via Store Manager: Modified 1 file(s)"
- `products.json` shows updated values

---

#### Test 1.3: Delete Product
**Objective:** Verify publish workflow with deletions

**Steps:**
1. Delete a product with 2 images (primary + 1 gallery)
2. Click "Save"
3. Observe status bar: "Unsaved changes: 3 files"
4. Click "Publish to GitHub"

**Expected Results:**
- ✅ Success alert with "Deleted 3 file(s)"
- ✅ Image files deleted from repository

**GitHub Verification:**
- Commit shows 3 deletions
- Images removed from public/images/
- Product removed from products.json

---

#### Test 1.4: Mixed Operations
**Objective:** Verify publish with multiple operation types

**Steps:**
1. Add 1 new product with image
2. Edit 1 existing product (name only)
3. Delete 1 product with 2 images
4. Click "Publish to GitHub"

**Expected Results:**
- ✅ Status bar: "Unsaved changes: 6 files"
  - 2 added (new product + image)
  - 1 modified (products.json)
  - 3 deleted (product + 2 images)
- ✅ Commit message: "Added 2 file(s), Modified 1 file(s), Deleted 3 file(s)"

---

### Test Suite 2: Error Handling

#### Test 2.1: No Changes to Publish
**Objective:** Verify behavior when repository is clean

**Steps:**
1. Ensure no unsaved changes
2. Observe "Publish to GitHub" button

**Expected Results:**
- ✅ Button is disabled (grayed out)
- ✅ Tooltip: "No changes to publish"
- ✅ Status bar: "Ready"
- ✅ Clicking does nothing

**Pass Criteria:**
- Button cannot be activated when no changes exist

---

#### Test 2.2: Authentication Failure
**Objective:** Verify error handling for invalid credentials

**Setup:**
1. Go to Settings
2. Change GitHub token to invalid value: `ghp_invalid123`
3. Save settings

**Steps:**
1. Make a change (add product)
2. Click "Publish to GitHub"

**Expected Results:**
- ✅ Error alert: "✗ Publish Failed"
- ✅ Message includes "Authentication failed"
- ✅ Suggestion: "Please check your GitHub username and token"
- ✅ Status bar shows error
- ✅ Button re-enables for retry

**Cleanup:**
1. Restore valid token
2. Test connection

---

#### Test 2.3: Network Failure
**Objective:** Verify error handling for network issues

**Setup:**
1. Disconnect from internet (disable WiFi/unplug ethernet)

**Steps:**
1. Make a change
2. Click "Publish to GitHub"

**Expected Results:**
- ✅ Error alert: "Network error"
- ✅ Message: "Please check your internet connection"
- ✅ Button re-enables for retry

**Cleanup:**
1. Reconnect to internet
2. Retry publish (should succeed)

---

#### Test 2.4: Merge Conflicts
**Objective:** Verify conflict detection and handling

**Setup:**
1. Make local change: Edit product "Test Product 1" name to "Local Name"
2. Don't publish yet
3. Go to GitHub website
4. Edit same product directly on GitHub: Change name to "Remote Name"
5. Commit on GitHub

**Steps:**
1. Back in app, click "Publish to GitHub"

**Expected Results:**
- ✅ Error alert: "✗ Publish Failed"
- ✅ Message: "Merge conflicts detected"
- ✅ Step: "pull"
- ✅ Suggestion to resolve manually
- ✅ Status bar shows error

**Manual Resolution:**
```bash
cd "your-project-path"
git pull origin main
# Edit products.json to resolve conflict
# Choose local or remote version
git add products.json
git commit -m "Resolved merge conflict"
```

**Verify:**
1. Return to app
2. Click "Publish to GitHub" again
3. Should succeed

---

#### Test 2.5: Missing Configuration
**Objective:** Verify error handling for incomplete setup

**Setup:**
1. Go to Settings
2. Clear GitHub username (leave empty)
3. Save settings

**Steps:**
1. Make a change
2. Click "Publish to GitHub"

**Expected Results:**
- ✅ Error alert: "GitHub credentials not configured"
- ✅ Message directs user to Settings

**Cleanup:**
1. Restore username
2. Save settings

---

### Test Suite 3: UI and UX

#### Test 3.1: Button States
**Objective:** Verify all button states work correctly

| Scenario | Button State | Visual | Cursor |
|----------|-------------|--------|--------|
| No changes | Disabled | Gray background | not-allowed |
| Has changes | Enabled | Blue background | pointer |
| Publishing | Disabled | Darker blue + spinner | wait |
| After success | Disabled | Gray background | not-allowed |
| After error | Enabled | Blue background | pointer |

**Steps:**
1. Test each scenario
2. Verify button appearance
3. Check cursor changes on hover

---

#### Test 3.2: Status Bar Updates
**Objective:** Verify status bar reflects current state

**Scenarios to Test:**

| State | Indicator | Message |
|-------|-----------|---------|
| Ready | 🟢 Green | "Ready" |
| 1 change | 🟡 Yellow pulsing | "Unsaved changes: 1 file" |
| 5 changes | 🟡 Yellow pulsing | "Unsaved changes: 5 files • 2 modified • 2 added • 1 deleted" |
| Publishing | 🟡 Yellow | "Publishing..." |
| Error | 🟡 Yellow | "Publishing..." + "Error: [message]" |

**Steps:**
1. Create each scenario
2. Observe status bar
3. Verify text and indicator color

---

#### Test 3.3: Loading Animation
**Objective:** Verify spinner animation works

**Steps:**
1. Make changes
2. Click "Publish to GitHub"
3. Observe button during publish

**Expected Results:**
- ✅ Spinner appears immediately
- ✅ Spinner rotates smoothly (360° continuous)
- ✅ Text changes to "Publishing..."
- ✅ Button color changes slightly
- ✅ Cursor shows "wait" state

---

#### Test 3.4: Success Notification
**Objective:** Verify success feedback is clear

**Steps:**
1. Successfully publish changes
2. Read alert message

**Expected Alert Format:**
```
✓ Successfully published changes to GitHub in 3.2s

Commit: Update products via Store Manager: Added 2 file(s)
Branch: main
```

**Verify:**
- ✅ Checkmark (✓) present
- ✅ Duration displayed
- ✅ Commit message shown
- ✅ Branch name shown

---

#### Test 3.5: Error Notification
**Objective:** Verify error feedback is helpful

**Steps:**
1. Trigger authentication error (invalid token)
2. Read alert message

**Expected Alert Format:**
```
✗ Publish Failed

Failed to push to GitHub: Authentication failed. Please check your GitHub username and token.
```

**Verify:**
- ✅ X mark (✗) present
- ✅ Clear error description
- ✅ Actionable suggestion
- ✅ Step that failed (if applicable)

---

### Test Suite 4: Performance

#### Test 4.1: Small Change (1 file)
**Objective:** Measure publish time for minimal change

**Steps:**
1. Edit one product (name only)
2. Click "Publish to GitHub"
3. Note time from click to success

**Expected:**
- ✅ Complete in < 5 seconds
- ✅ Success alert shows duration

---

#### Test 4.2: Large Change (10+ files)
**Objective:** Measure publish time for large change

**Steps:**
1. Add 5 products with 2 images each (10 image files + 1 products.json)
2. Click "Publish to GitHub"
3. Note time

**Expected:**
- ✅ Complete in < 15 seconds (depends on image size)
- ✅ No UI freezing during publish

---

#### Test 4.3: Rapid Successive Changes
**Objective:** Verify status updates don't interfere with publish

**Steps:**
1. Make change and publish
2. While publishing, make another change
3. Wait for first publish to complete
4. Verify status bar updates
5. Publish second change

**Expected:**
- ✅ First publish completes successfully
- ✅ Status bar immediately shows new changes
- ✅ Second publish succeeds

---

### Test Suite 5: Security

#### Test 5.1: Token Visibility
**Objective:** Verify token is never exposed

**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Make changes and publish
4. Watch console logs

**Expected:**
- ✅ No token visible in logs
- ✅ No token in error messages
- ✅ Remote URL logs don't contain credentials

---

#### Test 5.2: Remote URL Cleanup
**Objective:** Verify credentials are removed from git config

**Steps:**
1. Before publish, check remote URL:
   ```bash
   git remote get-url origin
   ```
   Expected: `https://github.com/user/repo.git`

2. Publish changes

3. After publish, check remote URL again:
   ```bash
   git remote get-url origin
   ```
   Expected: `https://github.com/user/repo.git` (no token)

**Expected:**
- ✅ Remote URL same before and after
- ✅ No credentials in git config

---

#### Test 5.3: Token Encryption at Rest
**Objective:** Verify token is stored encrypted

**Steps:**
1. Configure GitHub settings with token
2. Navigate to config file location
3. Open config file in text editor

**Expected:**
- ✅ Token field contains encrypted value (not plain text)
- ✅ Token is long encrypted string
- ✅ Cannot read actual token from file

---

### Test Suite 6: Edge Cases

#### Test 6.1: Empty Commit Message
**Objective:** Verify auto-generation works

**Steps:**
1. Make changes
2. Publish without custom message

**Expected:**
- ✅ Commit message auto-generated
- ✅ Format: "Update products via Store Manager: [changes]"

---

#### Test 6.2: Very Long Commit Message
**Objective:** Verify long messages are handled

**Steps:**
1. Modify code to pass 500-character commit message
2. Publish

**Expected:**
- ✅ Publish succeeds
- ✅ Full message visible on GitHub

---

#### Test 6.3: Special Characters in Product Names
**Objective:** Verify special characters don't break workflow

**Steps:**
1. Add product with name: `Product "Special" & <Chars>`
2. Publish

**Expected:**
- ✅ Publish succeeds
- ✅ Special characters properly encoded in JSON

---

#### Test 6.4: Simultaneous Edits
**Objective:** Verify last-write-wins behavior

**Setup:**
1. User A and User B both have app open
2. User A makes change
3. User B makes different change
4. User A publishes first

**Steps:**
1. User B clicks publish

**Expected:**
- ✅ User B's publish succeeds (no conflict if different products)
- ✅ Both changes preserved

**Conflict Scenario:**
- If both edit same product, conflict detected
- Error message shown to User B

---

#### Test 6.5: Repository Reset
**Objective:** Verify app handles repository state changes

**Steps:**
1. Make changes
2. Manually reset repository:
   ```bash
   git reset --hard HEAD
   ```
3. Return to app
4. Check status bar

**Expected:**
- ✅ Status bar updates on next check (within 5 seconds)
- ✅ Shows "Ready" (no changes)
- ✅ Publish button disabled

---

## Automated Test Script

### Quick Test Script (PowerShell)

```powershell
# GitHub Publish Workflow Test Script

Write-Host "=== GitHub Publish Workflow Test ===" -ForegroundColor Cyan

# Test 1: Repository Status
Write-Host "`nTest 1: Checking repository status..." -ForegroundColor Yellow
git status
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Repository OK" -ForegroundColor Green
} else {
    Write-Host "✗ Repository error" -ForegroundColor Red
    exit 1
}

# Test 2: Remote Configuration
Write-Host "`nTest 2: Checking remote configuration..." -ForegroundColor Yellow
$remote = git remote get-url origin
Write-Host "Remote URL: $remote"
if ($remote -like "*github.com*") {
    Write-Host "✓ Remote configured" -ForegroundColor Green
} else {
    Write-Host "✗ Remote not configured" -ForegroundColor Red
}

# Test 3: Check for credentials in config
Write-Host "`nTest 3: Checking for credential leaks..." -ForegroundColor Yellow
if ($remote -like "*@*" -and $remote -like "*:*@*") {
    Write-Host "✗ WARNING: Credentials in remote URL!" -ForegroundColor Red
} else {
    Write-Host "✓ No credentials in remote URL" -ForegroundColor Green
}

# Test 4: Check for uncommitted changes
Write-Host "`nTest 4: Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "Changes detected:" -ForegroundColor Yellow
    Write-Host $status
} else {
    Write-Host "✓ No uncommitted changes" -ForegroundColor Green
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
```

**Run with:**
```powershell
.\test-publish-workflow.ps1
```

---

## Test Results Template

### Test Execution Log

**Date:** _____________  
**Tester:** _____________  
**App Version:** _____________  

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | First Publish | ⬜ Pass ⬜ Fail | |
| 1.2 | Edit Product | ⬜ Pass ⬜ Fail | |
| 1.3 | Delete Product | ⬜ Pass ⬜ Fail | |
| 1.4 | Mixed Operations | ⬜ Pass ⬜ Fail | |
| 2.1 | No Changes | ⬜ Pass ⬜ Fail | |
| 2.2 | Auth Failure | ⬜ Pass ⬜ Fail | |
| 2.3 | Network Failure | ⬜ Pass ⬜ Fail | |
| 2.4 | Merge Conflicts | ⬜ Pass ⬜ Fail | |
| 2.5 | Missing Config | ⬜ Pass ⬜ Fail | |
| 3.1 | Button States | ⬜ Pass ⬜ Fail | |
| 3.2 | Status Updates | ⬜ Pass ⬜ Fail | |
| 3.3 | Loading Animation | ⬜ Pass ⬜ Fail | |
| 3.4 | Success Notification | ⬜ Pass ⬜ Fail | |
| 3.5 | Error Notification | ⬜ Pass ⬜ Fail | |
| 4.1 | Small Change Perf | ⬜ Pass ⬜ Fail | Time: _____s |
| 4.2 | Large Change Perf | ⬜ Pass ⬜ Fail | Time: _____s |
| 5.1 | Token Visibility | ⬜ Pass ⬜ Fail | |
| 5.2 | URL Cleanup | ⬜ Pass ⬜ Fail | |

**Overall Result:** ⬜ All Passed ⬜ Some Failed  
**Issues Found:** ___________________________  
**Recommendations:** ___________________________

---

## Troubleshooting During Testing

### Issue: Tests fail with "not a git repository"
**Solution:**
```bash
cd "your-project-path"
git init
git remote add origin https://github.com/user/repo.git
```

### Issue: Tests fail with "permission denied"
**Solution:**
1. Check file permissions
2. Run app as administrator (if needed)
3. Verify git user configuration

### Issue: Cannot reproduce merge conflict
**Solution:**
1. Ensure you're on same branch locally and remotely
2. Make conflicting changes to same lines
3. Try with `products.json` specifically

---

## Continuous Testing

### Daily Smoke Test (5 minutes)
1. Add one product
2. Publish
3. Verify on GitHub
4. Delete product
5. Publish
6. Verify on GitHub

### Weekly Full Test (30 minutes)
- Run all Test Suites 1-3
- Document any issues
- Update test results

### Release Test (1 hour)
- Run all test suites
- Run automated script
- Verify on multiple machines
- Complete test results template

---

## Success Criteria

✅ **All tests in Suites 1-3 pass**  
✅ **No credentials leaked in logs or config**  
✅ **Publish completes in < 10 seconds for typical changes**  
✅ **Error messages are clear and actionable**  
✅ **UI feedback is immediate and accurate**  
✅ **No repository corruption after any test**

---

## Related Documentation

- `GITHUB_PUBLISH_WORKFLOW_IMPLEMENTATION.md` - Implementation details
- `GITHUB_PUBLISH_WORKFLOW_QUICK_REFERENCE.md` - Quick reference guide
- `GITHUB_SETTINGS_TESTING_GUIDE.md` - Settings configuration tests
