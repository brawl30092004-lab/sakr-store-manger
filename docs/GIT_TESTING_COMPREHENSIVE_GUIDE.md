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
1. **One GitHub account** with one repository
   - Your existing GitHub account

2. **One device** with Sakr Store Manager installed
   - You'll make changes both in the app (local) and directly on GitHub (web)

3. **Web Browser** 
   - To edit files directly on GitHub and create conflicts

4. **GitHub Repository Setup:**
   ```
   1. Use your existing repository (or create a new one)
   2. Set up Sakr Store Manager connected to this repo
   3. Add initial products (3-5 products)
   4. Publish to GitHub
   5. Now you're ready to test by editing on GitHub web and in the app
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

### Step 2: Sakr Store Manager Setup
```
1. Open Sakr Store Manager
2. Go to Settings (Ctrl+,)
3. Select Data Source: "GitHub Repository"
4. Fill in:
   - Repository URL: https://github.com/YOUR_USERNAME/sakr-store-test.git
   - Username: YOUR_GITHUB_USERNAME
   - Personal Access Token: (generate from GitHub Settings → Developer settings → Personal access tokens)
   - Local Project Path: (your preferred path, e.g., C:\SakrStore)
5. Click "Test Connection" - should show ✓ success
6. Click "Save Settings"
7. App will clone the repository
```

### Step 3: Add Initial Test Data
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

### Step 4: Verify on GitHub
```
1. Open your browser
2. Go to: https://github.com/YOUR_USERNAME/sakr-store-test
3. Navigate to: data/products.json
4. You should see your 3 products in JSON format
5. Keep this browser tab open - you'll use it to create conflicts!
```

---

## 🧪 Test Scenarios

### Test 1: Basic Publish and Sync (No Conflicts)
**Goal:** Verify normal publish and sync workflow works correctly

**Steps:**
1. In Sakr Store Manager:
   - Edit "Test Laptop" → Change price to $1099.99
   - Click "Publish to Store"
   - Enter commit message: "Updated laptop price"
   - ✅ **Expected:** Success toast, status bar clears

2. On GitHub (browser):
   - Refresh the repository page
   - Go to data/products.json
   - ✅ **Expected:** "Test Laptop" price shows 1099.99 in the JSON

3. Make a change on GitHub:
   - Click the pencil icon (Edit) on products.json
   - Find "Coffee Maker" and change price from 79.99 to 89.99
   - Scroll down, enter commit message: "Updated coffee maker price"
   - Click "Commit changes"

4. Back in Sakr Store Manager:
   - Click sync button (🔄) or wait for notification
   - ✅ **Expected:** Notification: "1 new change(s) available from your store"
   - Click "Get Updates"
   - ✅ **Expected:** "Updates synced from your store successfully"
   - Verify "Coffee Maker" now shows $89.99

**Pass Criteria:**
- ✅ Publish successful from app
- ✅ Changes visible on GitHub
- ✅ Changes made on GitHub sync to app
- ✅ Prices updated correctly in both directions

---

### Test 2: Smart Merge (Same Product, Different Fields) ⭐ NEW!
**Goal:** Test intelligent auto-merge when GitHub and local edit different fields of the same product

**Steps:**
1. On GitHub (browser):
   - Navigate to data/products.json
   - Click Edit (pencil icon)
   - Find "Office Chair"
   - Change description: "Ergonomic office chair" → "Premium ergonomic office chair with lumbar support"
   - Commit changes: "Updated chair description"
   - ✅ **Expected:** Commit successful

2. In Sakr Store Manager (WITHOUT syncing first):
   - Edit "Office Chair" (same product)
   - Change price: $199.99 → $249.99
   - DON'T click sync! Go directly to "Publish to Store"
   
3. Publish from app:
   - Click "Publish to Store"
   - ✅ **Expected:** Conflict dialog appears!
   
   **Verify Conflict Dialog:**
   - ⚠️ Title: "Merge Conflict Detected"
   - Subtitle: "Changes on your store conflict with your local changes"
   - Shows: "1 product(s) have conflicting changes"
   - Product name: "Office Chair"
   - Shows conflicting fields:
     * Price: $199.99 (Store) → $249.99 (Your Version)
     * Description: "Premium ergonomic..." (Store) → "Ergonomic office chair" (Your Version)
   - **NEW:** Shows "🔀 Smart Merge (Recommended)" button with glowing animation
   
4. Resolve Conflict with Smart Merge (⭐ RECOMMENDED):
   - Choose: "� Smart Merge (Recommended)"
   - ✅ **Expected:** 
     - Toast: "Conflict resolved! Smart merge successful."
     - Toast: "Continuing publish to store..."
     - Toast: "Successfully published to store!"
     - Dialog closes automatically
     - Status bar clears
     - **App reloads products automatically**

5. Verify on GitHub - Best of Both Worlds!:
   - Refresh products.json on GitHub
   - ✅ **Expected:** "Office Chair" shows:
     * Price: **$249.99** (your local change) ✓
     * Description: **"Premium ergonomic office chair with lumbar support"** (GitHub's change) ✓
   - **BOTH changes are kept!** No data loss! 🎉

6. Alternative: Test Manual Resolution Options
   - Repeat steps 1-3 to create the same conflict again
   - This time choose "💻 Use My Version"
   - ✅ **Expected:** 
     - Only your changes kept (price $249.99)
     - GitHub's description change lost
   
   - OR choose "☁️ Keep Store Version"
   - ✅ **Expected:** 
     - Only GitHub's changes kept (new description)
     - Your price change lost

**Pass Criteria:**
- ✅ Conflict detected and dialog shown
- ✅ Product-level details displayed correctly
- ✅ Field-by-field comparison shown
- ✅ **Smart Merge button appears and works**
- ✅ **Smart Merge combines BOTH changes (no data loss)**
- ✅ Resolution successful with auto-publish continuation
- ✅ Changes reflected on GitHub
- ✅ **App shows correct merged data after publish**

---

### Test 3: True Conflict (Same Product, Same Field, Different Values)
**Goal:** Test when both GitHub and local edit the exact same field to different values - requires user decision

**Steps:**
1. On GitHub (browser):
   - Edit products.json
   - Find "Coffee Maker"
   - Change price: 89.99 → 69.99
   - Commit: "Coffee maker sale price"
   - ✅ **Expected:** Commit successful

2. In Sakr Store Manager (WITHOUT syncing):
   - Edit "Coffee Maker" (same product)
   - Change price: $89.99 → $99.99 (different value!)
   - DON'T sync! Click "Publish to Store"
   
3. Attempt to publish:
   - ✅ **Expected:** Conflict dialog appears
   
   **Verify Conflict Details:**
   - Shows "Coffee Maker"
   - Price conflict:
     * Current Store (GitHub): $69.99
     * Your Version: $99.99
   - Clear visual distinction between versions
   - **Smart Merge button still appears** (will keep your version in this case)

4. Test Smart Merge (prefers local when truly conflicting):
   - Click "🔀 Smart Merge"
   - ✅ **Expected:**
     - Merges intelligently (keeps local $99.99 since both edited same field)
     - Toast: "Conflict resolved! Smart merge successful."
     - "Coffee Maker" price becomes $99.99

5. Alternative: Test Manual Resolution
   - Repeat steps 1-3 to create conflict again
   - Click "☁️ Keep Store Version"
   - ✅ **Expected:**
     - Toast: "Conflict resolved! Using store version."
     - Toast: "Successfully published to store!"
     - "Coffee Maker" price in app becomes $69.99 (reverted to GitHub's value)
     - Status bar clears

6. Verify on GitHub:
   - Refresh products.json
   - ✅ **Expected:** "Coffee Maker" price matches the resolution you chose

**Pass Criteria:**
- ✅ Same-field conflict detected
- ✅ Both versions shown clearly (GitHub vs Local)
- ✅ Smart Merge handles true conflicts gracefully
- ✅ Manual resolution options work correctly
- ✅ No errors or stuck states

---

### Test 4: Cancel Conflict Resolution
**Goal:** Verify user can cancel out of conflict without breaking git state

**Steps:**
1. Create another conflict:
   - On GitHub: Edit "Test Laptop" price to $999.99
   - In app (without sync): Edit "Test Laptop" description to "Updated description"
   - Try to publish from app

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
   - Can make more edits to products
   - Can try clicking sync instead
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
1. On GitHub:
   - Edit products.json
   - Change "Test Laptop" price to $1200
   - Change "Office Chair" description to "Updated on GitHub"
   - Commit changes
   - ✅ **Expected:** Commit successful

2. In app (WITHOUT syncing):
   - Edit "Test Laptop" → Change description to "Gaming laptop"
   - Edit "Office Chair" → Change price to $299.99
   - Click "Publish to Store"

3. Conflict dialog should appear:
   - ✅ **Expected:** Dialog shows:
     - "2 product(s) have conflicting changes"
     - Both "Test Laptop" and "Office Chair" listed
     - Each shows their specific field conflicts:
       * Test Laptop: price conflict (GitHub: $1200 vs Your: unchanged) + description (GitHub: unchanged vs Your: "Gaming laptop")
       * Office Chair: description conflict + price conflict
     - All conflicts in one scrollable dialog

4. Resolve:
   - Choose "💻 Use My Version"
   - ✅ **Expected:** Both products resolve, publish succeeds

5. Verify on GitHub:
   - ✅ **Expected:** Both products show your local changes

**Pass Criteria:**
- ✅ Multiple conflicts shown together
- ✅ Each product clearly identified
- ✅ All resolve in one action
- ✅ No partial failures

---

### Test 6: Conflict with Add/Delete Operations
**Goal:** Test conflicts when products are added/deleted

**Steps:**
1. On GitHub:
   - Edit products.json
   - Manually delete the entire "Coffee Maker" product object (remove the whole {...} block)
   - Commit: "Deleted coffee maker"
   - ✅ **Expected:** Commit successful

2. In app (WITHOUT syncing):
   - Add new product "Wireless Mouse":
     * Category: "Electronics"
     * Price: $29.99
     * Description: "Wireless optical mouse"
   - Click "Publish to Store"

3. Conflict detection:
   - ✅ **Expected:** 
     - Conflict detected (products.json changed on both sides)
     - Dialog shows conflict
     - May show file-level conflict if product-level parsing can't handle deletion

4. Resolve:
   - Choose "💻 Use My Version"
   - ✅ **Expected:** 
     - "Wireless Mouse" gets published
     - "Coffee Maker" reappears (because your local version still had it)

5. Verify on GitHub:
   - Check products.json
   - ✅ **Expected:** Shows your version (Mouse added, Coffee Maker back)

**Pass Criteria:**
- ✅ Add/delete conflicts handled
- ✅ Resolution doesn't break products.json structure
- ✅ No JSON syntax errors

---

### Test 7: Sync Before Publish (Proactive Prevention)
**Goal:** Test that syncing before publishing prevents conflicts

**Steps:**
1. On GitHub:
   - Edit products.json
   - Change "Test Laptop" price to $1500
   - Commit changes

2. In app:
   - DON'T sync yet
   - Edit "Test Laptop" → Change description to "Professional laptop"
   - Status bar may show notification: "Updates available from store"
   - Click "Get Updates" (🔄 sync button) BEFORE publishing
   - ✅ **Expected:** 
     - Sync pulls GitHub's price change ($1500)
     - Your local description change is preserved (git merge works)
     - Now both changes are combined locally
     - "Test Laptop" shows: $1500 (from GitHub) + "Professional laptop" (your change)

3. Now publish:
   - Click "Publish to Store"
   - ✅ **Expected:** 
     - NO conflict (because we synced first)
     - Publish successful
     - Both changes now on GitHub

4. Verify on GitHub:
   - Check products.json
   - ✅ **Expected:** "Test Laptop" has both changes (price $1500 + new description)

**Pass Criteria:**
- ✅ Sync notification works
- ✅ Sync before publish prevents conflict
- ✅ Both changes merged successfully
- ✅ Best practice workflow demonstrated

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
1. In app:
   - Edit "Test Laptop" → Change price to $1000
   - Click "Publish to Store"
   - IMMEDIATELY (while toast is still showing) edit "Office Chair" → Change price to $200
   - Quickly click "Publish to Store" again (while first is still processing)
   - ✅ **Expected:**
     - Second publish should either:
       * Wait until first completes, then run
       * Show error: "Publish in progress"
       * Button is disabled during first publish
     - No git corruption
     - Both changes eventually published

2. Verify on GitHub:
   - Check products.json
   - ✅ **Expected:** Both changes are there (or at least the first one)

**Pass Criteria:**
- ✅ Concurrent publish attempts handled gracefully
- ✅ No git state corruption
- ✅ Clear UI feedback (button disabled or error shown)
- ✅ All changes eventually published

---

### Test 11: Edge Case - Publish During Sync
**Goal:** Test interaction between publish and sync operations

**Steps:**
1. On GitHub: Make a change to any product and commit
2. In app:
   - Click sync button (🔄)
   - WHILE sync is running (loading spinner visible), try to click "Publish to Store"
   - ✅ **Expected:**
     - Publish button should be disabled during sync
     - OR error message: "Sync in progress, please wait"
     - No action taken until sync completes

3. After sync completes:
   - Make a local edit
   - Try "Publish to Store"
   - ✅ **Expected:** Works normally

**Pass Criteria:**
- ✅ Can't publish during sync
- ✅ Clear UI feedback (disabled button or error)
- ✅ No race conditions or git corruption

---

### Test 12: Recovery - Clean Slate After Conflict Chaos
**Goal:** Verify user can recover from badly messed up git state

**Steps:**
1. Create intentional mess:
   - Create a conflict (GitHub edit + local edit)
   - When conflict dialog appears, click Cancel
   - Create another conflict immediately
   - Click Cancel again
   - Close app abruptly (Alt+F4) while conflict dialog is open

2. Restart app:
   - ✅ **Expected:**
     - App starts normally OR shows recovery message
     - If stuck in merge state, shows option to "Abort merge"
     - OR automatically aborts merge on startup
     - Products still visible and editable

3. Use Settings → Reset/Restore:
   - Open Settings
   - Look for any "Reset Repository" or "Restore from Store" option
   - ✅ **Expected:**
     - Option to do hard reset (discard all local changes)
     - Downloads fresh copy from GitHub
     - Or reconnect by re-entering settings

4. If no explicit reset option, test manual recovery:
   - Delete local project folder
   - Go to Settings
   - Re-enter same repository URL
   - Save settings
   - ✅ **Expected:** Fresh clone downloads successfully

**Pass Criteria:**
- ✅ App doesn't crash on startup after messy state
- ✅ Recovery options available (manual or automatic)
- ✅ Can get back to clean working state
- ✅ No permanent corruption or data loss on GitHub

---

## 📊 Test Results Template

Use this template to record your test results:

```markdown
## Test Results - [Date]

needs changing : on first start the Data Source Not Found dialog shows which doesnt have the github option

all emojies needs changing to vectors 

pressing enter in the edit dialog should "save and close"

### Test 1: Basic Publish
- Status: ✅ PASS
- Notes: as intended

### Test 2: Simple Conflict
- Status: ✅ PASS
- Notes: as intended - UI issue found 


Visual Error: The UI labels and the data they display are mismatched.

Detailed Observation:

The column labeled "CURRENT STORE (GITHUB)" (Left/Yellow) is actually displaying the Local/User data .

The column labeled "YOUR VERSION" (Right/Green) is actually displaying the Remote/Store data .
its reversed in naming 

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
