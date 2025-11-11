# Git Functions Comprehensive Testing Guide

**Date Created:** November 12, 2025  
**Purpose:** Complete testing of all git features including conflict resolution, sync, publish, and error handling

---

## 🎯 Testing Overview

This guide covers all git scenarios in the Sakr Store Manager application. We'll test:
- ✅ Initial setup and connection
- ✅ Basic publish and sync workflows
- ✅ Conflict resolution (the main focus)
- ✅ Error handling and edge cases
- ✅ Multi-device scenarios
- ✅ Recovery from failures

---

## 📋 Prerequisites

### What You Need:
1. **Two GitHub accounts** (or one account with two repos)
   - Account A: Your main testing account
   - Account B: Clone target account (you mentioned you'll clone to another account)

2. **Two devices/VMs** (or same device with two different project folders)
   - Device 1: Primary workstation
   - Device 2: Secondary workstation (or different folder on same device)

3. **GitHub Repository Setup:**
   ```
   1. Create a new repository on Account A
   2. Initialize with README.md
   3. Clone to Device 1
   4. Set up Sakr Store Manager on Device 1
   5. Add initial products (3-5 products)
   6. Publish to GitHub
   7. Clone same repo to Device 2
   8. Set up Sakr Store Manager on Device 2
   ```

---

## 🚀 Test Setup Instructions

### Step 1: Repository Creation (Account A)
```bash
# On GitHub (Account A):
1. Go to github.com
2. Click "New Repository"
3. Name: "sakr-store-test" (or your choice)
4. ✓ Public or Private
5. ✓ Initialize with README
6. Click "Create Repository"
7. Copy the repository URL: https://github.com/YOUR_USERNAME/sakr-store-test.git
```

### Step 2: Device 1 Setup (Primary Workstation)
```
1. Open Sakr Store Manager
2. Go to Settings (Ctrl+,)
3. Select Data Source: "GitHub Repository"
4. Fill in:
   - Repository URL: https://github.com/YOUR_USERNAME/sakr-store-test.git
   - Username: YOUR_GITHUB_USERNAME
   - Personal Access Token: (generate from GitHub Settings → Developer settings → Personal access tokens)
   - Local Project Path: C:\SakrStore\Device1 (or your preferred path)
5. Click "Test Connection" - should show ✓ success
6. Click "Save Settings"
7. App will clone the repository
```

### Step 3: Add Initial Test Data (Device 1)
```
1. Click "Add Product" (Ctrl+N)
2. Add 3 products:
   
   Product 1:
   - Name: "Test Laptop"
   - Category: "Electronics"
   - Price: 999.99
   - Description: "High-performance laptop"
   
   Product 2:
   - Name: "Office Chair"
   - Category: "Furniture"
   - Price: 199.99
   - Description: "Ergonomic office chair"
   
   Product 3:
   - Name: "Coffee Maker"
   - Category: "Appliances"
   - Price: 79.99
   - Description: "Automatic coffee maker"

3. Status bar should show: "3 products changed"
4. Click "Publish to Store" button
5. Enter commit message: "Initial products"
6. Wait for success toast: "Published to store successfully!"
```

### Step 4: Device 2 Setup (Secondary Workstation)
```
1. Open NEW instance of Sakr Store Manager (different folder or VM)
2. Go to Settings
3. Select Data Source: "GitHub Repository"
4. Fill in SAME repository details:
   - Repository URL: https://github.com/YOUR_USERNAME/sakr-store-test.git
   - Username: YOUR_GITHUB_USERNAME
   - Personal Access Token: (same or new token)
   - Local Project Path: C:\SakrStore\Device2 (DIFFERENT path)
5. Click "Test Connection" - should show ✓ success
6. Click "Save Settings"
7. App will clone the repository
8. You should see the 3 products from Device 1
```

---

## 🧪 Test Scenarios

### Test 1: Basic Publish (No Conflicts)
**Goal:** Verify normal publish workflow works correctly

**Steps:**
1. On Device 1:
   - Edit "Test Laptop" → Change price to $1099.99
   - Click "Publish to Store"
   - Enter commit message: "Updated laptop price"
   - ✅ **Expected:** Success toast, status bar clears

2. On Device 2:
   - Click sync button (or wait for auto-check)
   - ✅ **Expected:** Notification: "1 new change(s) available from your store"
   - Click "Get Updates"
   - ✅ **Expected:** "Updates synced from your store successfully"
   - Verify "Test Laptop" now shows $1099.99

**Pass Criteria:**
- ✅ Publish successful on Device 1
- ✅ Notification appears on Device 2
- ✅ Sync successful on Device 2
- ✅ Price updated correctly

---

### Test 2: Simple Conflict (Same Product, Different Fields)
**Goal:** Test conflict resolution when two devices edit different fields of the same product

**Steps:**
1. On Device 1:
   - Edit "Office Chair"
   - Change price: $199.99 → $249.99
   - DON'T PUBLISH YET

2. On Device 2:
   - Edit "Office Chair" (same product)
   - Change description: "Ergonomic office chair" → "Premium ergonomic office chair with lumbar support"
   - Click "Publish to Store"
   - Enter message: "Updated chair description"
   - ✅ **Expected:** Success (Device 2 publishes first)

3. On Device 1:
   - Now click "Publish to Store"
   - ✅ **Expected:** Conflict dialog appears!
   
   **Verify Conflict Dialog:**
   - ⚠️ Title: "Merge Conflict Detected"
   - Subtitle: "Changes on your store conflict with your local changes"
   - Shows: "1 product(s) have conflicting changes"
   - Product name: "Office Chair"
   - Shows conflicting fields:
     * Price: $199.99 (Store) → $249.99 (Your Version)
     * Description: "Premium ergonomic..." (Store) → "Ergonomic office chair" (Your Version)
   
4. On Device 1 - Resolve Conflict:
   - Choose: "💻 Use My Version" (keep $249.99 price)
   - ✅ **Expected:** 
     - Toast: "Conflict resolved! Using your version."
     - Toast: "Continuing publish to store..."
     - Toast: "Successfully published to store!"
     - Dialog closes automatically
     - Status bar clears

5. On Device 2:
   - Sync to get Device 1's changes
   - ✅ **Expected:** "Office Chair" shows $249.99 but keeps original description (Device 1 won)

**Pass Criteria:**
- ✅ Conflict detected and dialog shown
- ✅ Product-level details displayed correctly
- ✅ Field-by-field comparison shown
- ✅ Resolution successful with auto-publish continuation
- ✅ Changes synced to other device

---

### Test 3: Complex Conflict (Same Product, Same Field)
**Goal:** Test when both devices edit the exact same field

**Steps:**
1. On Device 1:
   - Edit "Coffee Maker"
   - Change price: $79.99 → $89.99
   - DON'T PUBLISH

2. On Device 2:
   - Edit "Coffee Maker" (same product)
   - Change price: $79.99 → $69.99 (different value!)
   - Publish to Store
   - Message: "Coffee maker sale price"
   - ✅ **Expected:** Success

3. On Device 1:
   - Click "Publish to Store"
   - ✅ **Expected:** Conflict dialog appears
   
   **Verify Conflict Details:**
   - Shows "Coffee Maker"
   - Price conflict:
     * Current Store: $69.99
     * Your Version: $89.99
   - Clear visual distinction between versions

4. Test Resolution Option A - Use Store Version:
   - Click "☁️ Keep Store Version"
   - ✅ **Expected:**
     - Toast: "Conflict resolved! Using store version."
     - Toast: "Successfully published to store!"
     - "Coffee Maker" price becomes $69.99 (reverted)
     - Status bar clears

**Pass Criteria:**
- ✅ Same-field conflict detected
- ✅ Both versions shown clearly
- ✅ "Keep Store Version" discards local changes correctly
- ✅ No errors or stuck states

---

### Test 4: Cancel Conflict Resolution
**Goal:** Verify user can cancel out of conflict without breaking git state

**Steps:**
1. Create another conflict (use any product, any field)
2. When conflict dialog appears:
   - Click "❌ Cancel" button
   - ✅ **Expected:**
     - Toast: "Merge cancelled. Your changes are preserved."
     - Dialog closes
     - Status bar still shows changes (not cleared)
     - Can edit more products
     - Can try publish again later

3. Verify git state:
   - Status bar should show changes
   - Can make more edits
   - Next publish attempt should work normally

**Pass Criteria:**
- ✅ Cancel button works
- ✅ No git errors
- ✅ Can continue working
- ✅ Changes preserved locally

---

### Test 5: Multiple Products Conflict
**Goal:** Test when multiple products have conflicts simultaneously

**Steps:**
1. On Device 1:
   - Edit "Test Laptop" → Change description
   - Edit "Office Chair" → Change price
   - DON'T PUBLISH

2. On Device 2:
   - Edit "Test Laptop" → Change price (different field than Device 1)
   - Edit "Office Chair" → Change description (different field than Device 1)
   - Publish to Store
   - ✅ **Expected:** Success

3. On Device 1:
   - Click "Publish to Store"
   - ✅ **Expected:** Conflict dialog shows:
     - "2 product(s) have conflicting changes"
     - Both "Test Laptop" and "Office Chair" listed
     - Each shows their specific field conflicts
     - All conflicts in one scrollable dialog

4. Resolve:
   - Choose "Use My Version"
   - ✅ **Expected:** Both products resolve, publish succeeds

**Pass Criteria:**
- ✅ Multiple conflicts shown together
- ✅ Each product clearly identified
- ✅ All resolve in one action
- ✅ No partial failures

---

### Test 6: Conflict with Add/Delete Operations
**Goal:** Test conflicts when products are added/deleted on different devices

**Steps:**
1. On Device 1:
   - Add new product "Wireless Mouse" (price: $29.99)
   - DON'T PUBLISH

2. On Device 2:
   - Delete "Coffee Maker"
   - Publish to Store
   - ✅ **Expected:** Success

3. On Device 1:
   - Click "Publish to Store"
   - ✅ **Expected:** 
     - Conflict detected (products.json changed)
     - Shows file-level conflict if no product-level parsing possible
     - OR shows "Wireless Mouse" as new (Store: none, Your: $29.99)

4. Resolve:
   - Choose "Use My Version"
   - ✅ **Expected:** 
     - "Wireless Mouse" added to store
     - "Coffee Maker" stays deleted (was already deleted on Device 2)

**Pass Criteria:**
- ✅ Add/delete conflicts handled
- ✅ Resolution doesn't break products.json
- ✅ Both devices end up consistent

---

### Test 7: Sync Before Publish (Proactive Prevention)
**Goal:** Test that syncing before publishing prevents conflicts

**Steps:**
1. On Device 2:
   - Edit "Test Laptop" → Change price
   - Publish to Store

2. On Device 1:
   - DON'T sync yet
   - Edit "Test Laptop" → Change description
   - Status bar shows notification: "Updates available from store"
   - Click "Get Updates" BEFORE publishing
   - ✅ **Expected:** 
     - Sync pulls Device 2's price change
     - Local description change is preserved (git merge)
     - Now both changes are combined locally

3. On Device 1:
   - Click "Publish to Store"
   - ✅ **Expected:** 
     - NO conflict (because we synced first)
     - Publish successful
     - Both changes now on store

**Pass Criteria:**
- ✅ Sync notification works
- ✅ Sync before publish prevents conflict
- ✅ Both changes merged successfully

---

### Test 8: Error Handling - Authentication Failure
**Goal:** Test error messages when authentication fails

**Steps:**
1. On Device 1:
   - Go to Settings
   - Change Personal Access Token to invalid value: "invalid_token_123"
   - Save Settings

2. Make a change and try to publish:
   - Edit any product
   - Click "Publish to Store"
   - ✅ **Expected:**
     - Error toast: "Store authentication failed. Please check your credentials."
     - No crash
     - Changes preserved locally
     - Can fix token and retry

**Pass Criteria:**
- ✅ Clear authentication error message
- ✅ User-friendly language
- ✅ No data loss
- ✅ Recoverable

---

### Test 9: Error Handling - Network Failure
**Goal:** Test behavior when network is unavailable

**Steps:**
1. Disconnect internet (or block github.com in hosts file)
2. Make changes and try to publish:
   - Edit any product
   - Click "Publish to Store"
   - ✅ **Expected:**
     - Error toast: "Failed to publish to your store. Check your connection."
     - Changes remain locally
     - Status bar still shows changes

3. Reconnect internet:
   - Click "Publish to Store" again
   - ✅ **Expected:** Success

**Pass Criteria:**
- ✅ Network error detected
- ✅ Helpful error message
- ✅ Retry works after reconnection

---

### Test 10: Edge Case - Rapid Successive Publishes
**Goal:** Test that multiple rapid publishes don't break git state

**Steps:**
1. On Device 1:
   - Edit "Test Laptop" → Change price to $1000
   - Click "Publish to Store"
   - IMMEDIATELY edit "Office Chair" → Change price to $200
   - Click "Publish to Store" again (while first is still processing)
   - ✅ **Expected:**
     - Second publish should either queue or show error
     - No git corruption
     - Both changes eventually published

**Pass Criteria:**
- ✅ Concurrent publish attempts handled
- ✅ No git state corruption
- ✅ All changes eventually published

---

### Test 11: Edge Case - Publish During Sync
**Goal:** Test interaction between publish and sync operations

**Steps:**
1. On Device 2: Make changes and publish
2. On Device 1:
   - Click sync button
   - WHILE sync is running, try to click "Publish to Store"
   - ✅ **Expected:**
     - Publish button disabled during sync
     - OR error message: "Sync in progress"
     - After sync completes, publish works

**Pass Criteria:**
- ✅ Can't publish during sync
- ✅ Clear UI feedback
- ✅ No race conditions

---

### Test 12: Recovery - Clean Slate After Conflict Chaos
**Goal:** Verify user can recover from badly messed up git state

**Steps:**
1. Create intentional mess:
   - Cancel several conflict resolutions
   - Leave merge in progress
   - Close app abruptly (Alt+F4) during conflict

2. Restart app:
   - ✅ **Expected:**
     - App detects unfinished merge
     - Shows option to "Reset and discard conflicts"
     - OR automatically aborts merge on startup

3. Use Settings → "Reset Repository":
   - In Settings, look for reset/restore option
   - ✅ **Expected:**
     - Option to "Restore from Store" (hard reset)
     - Discards all local changes
     - Downloads fresh copy from store

**Pass Criteria:**
- ✅ Recovery options available
- ✅ Can get back to clean state
- ✅ No permanent corruption

---

## 📊 Test Results Template

Use this template to record your test results:

```markdown
## Test Results - [Date]

### Test 1: Basic Publish
- Status: ✅ PASS / ❌ FAIL
- Notes: 

### Test 2: Simple Conflict
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 3: Complex Conflict
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 4: Cancel Resolution
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 5: Multiple Products
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 6: Add/Delete Conflicts
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 7: Sync Before Publish
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 8: Auth Failure
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 9: Network Failure
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 10: Rapid Publishes
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 11: Publish During Sync
- Status: ✅ PASS / ❌ FAIL
- Notes:

### Test 12: Recovery
- Status: ✅ PASS / ❌ FAIL
- Notes:

---

### Summary
- Total Tests: 12
- Passed: __
- Failed: __
- Blocked: __

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 
```

---

## 🐛 What to Look For (Bug Hunting Checklist)

### UI Issues:
- [ ] Conflict dialog appears properly (not hidden behind other windows)
- [ ] Product names and fields are clearly readable
- [ ] Version labels ("Store" vs "Your Version") are distinct
- [ ] Buttons are clickable and responsive
- [ ] Dialog closes after successful resolution
- [ ] Status bar updates correctly
- [ ] Toast notifications appear and dismiss properly

### Data Integrity:
- [ ] No products lost after conflict resolution
- [ ] Price values formatted correctly ($X.XX)
- [ ] Product fields don't get mixed up between products
- [ ] All changes sync across devices eventually
- [ ] No duplicate products created

### Git State:
- [ ] No "MERGING" state left hanging
- [ ] Can continue editing after conflict
- [ ] Status bar reflects true git state
- [ ] Sync works after conflict resolution
- [ ] No uncommitted changes lost

### Error Messages:
- [ ] All error messages use business language (not git jargon)
- [ ] Error messages are helpful (tell user what to do)
- [ ] No raw git errors shown to user
- [ ] Authentication errors are clear
- [ ] Network errors are distinguishable

### Performance:
- [ ] Conflict detection is fast (<2 seconds)
- [ ] Dialog loads quickly
- [ ] Resolution completes in reasonable time
- [ ] App doesn't freeze during operations
- [ ] Memory usage stable after multiple operations

---

## 🎓 Tips for Effective Testing

1. **Test Systematically:** Complete tests in order, each builds on previous
2. **Document Everything:** Screenshot any weird behavior
3. **Test Edge Cases:** Try unusual sequences of operations
4. **Use Real Data:** Test with realistic product names and prices
5. **Verify Both Sides:** Always check both Device 1 and Device 2
6. **Test Language:** Confirm all messages use business-friendly terms
7. **Stress Test:** Try rapid clicks, large product counts, long descriptions

---

## 🚨 Critical Scenarios to Prioritize

If you have limited time, focus on these:

**Must Test:**
- ✅ Test 2: Simple Conflict (core functionality)
- ✅ Test 3: Complex Conflict (same field, different values)
- ✅ Test 4: Cancel Resolution (ensure no corruption)

**Should Test:**
- ✅ Test 7: Sync Before Publish (best practice workflow)
- ✅ Test 8: Auth Failure (common user error)
- ✅ Test 12: Recovery (safety net)

**Nice to Test:**
- All others (for completeness)

---

## 📞 Next Steps After Testing

1. **Report Results:** Use the test results template above
2. **File Issues:** Any bugs found, note:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if UI issue
   - Console errors if available

3. **Retest Fixes:** After I fix bugs, retest those specific scenarios

4. **Sign Off:** Once all tests pass, we'll document the final working system

---

**Ready to start?** Begin with Test 1 and work your way down! 🚀
