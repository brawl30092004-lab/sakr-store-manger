# GitHub Flow Testing Guide

## Prerequisites

Before testing, you need:
1. A GitHub account
2. A test repository on GitHub
3. A Personal Access Token with 'repo' permissions
4. The repository should contain:
   - `products.json` in the root (can be empty: `[]`)
   - `images/` folder in the root (can be empty)

### Create Test Repository

```bash
# On GitHub, create a new repository named "test-store-data"
# Clone it locally
git clone https://github.com/YOUR-USERNAME/test-store-data.git
cd test-store-data

# Create initial structure
echo "[]" > products.json
mkdir images
echo "# Test Store Data" > README.md

# Commit and push
git add .
git commit -m "Initial setup"
git push origin main
```

---

## Test Suite

### Test 1: Initial GitHub Setup ✅

**Objective:** Verify repository cloning works

**Steps:**
1. Launch the app
2. Open Settings (click Settings or press Ctrl+,)
3. Select "GitHub Repository" in Data Source
4. Fill in GitHub settings:
   - Repository URL: `https://github.com/YOUR-USERNAME/test-store-data`
   - GitHub Username: `YOUR-USERNAME`
   - Personal Access Token: `ghp_XXXXXXXXXXXX`
   - Local Project Path: Click Browse → Select an empty folder
5. Click "Save Settings"

**Expected Results:**
- ✅ "Cloning repository..." message appears
- ✅ Clone completes successfully
- ✅ "Settings saved successfully!" message appears
- ✅ products.json file appears in the selected folder
- ✅ images/ folder appears in the selected folder
- ✅ .git folder appears (hidden)

**Verify on File System:**
```
C:\path\to\selected\folder\
├── .git\
├── products.json
├── images\
└── README.md
```

---

### Test 2: Add Product with Image ✅

**Objective:** Verify new products sync to GitHub

**Steps:**
1. Click "Back to Main" from Settings
2. Click "+ New Product"
3. Fill in product details:
   - Name: "Test Product 1"
   - Price: 99.99
   - Category: "Electronics"
   - Stock: 10
4. Upload a primary image
5. Click "Save"
6. Click "Publish to GitHub" button (or press Ctrl+P)

**Expected Results:**
- ✅ "Step 1/3: Pulling latest changes..." appears
- ✅ "Step 2/3: Committing changes..." appears
- ✅ "Step 3/3: Pushing to GitHub..." appears
- ✅ "Successfully published changes to GitHub" appears
- ✅ No errors

**Verify on GitHub:**
1. Go to your repository on GitHub
2. Check products.json contains the new product
3. Check images/ folder contains:
   - `product-1-primary.jpg`
   - `product-1-primary.webp`
   - `product-1-primary.avif`

---

### Test 3: Edit Product ✅

**Objective:** Verify edits sync to GitHub

**Steps:**
1. Select "Test Product 1" from the list
2. Click "Edit"
3. Change:
   - Price: 79.99
   - Stock: 5
4. Click "Save"
5. Click "Publish to GitHub"

**Expected Results:**
- ✅ Publish succeeds
- ✅ Success message appears

**Verify on GitHub:**
1. Check products.json on GitHub
2. Verify price is now 79.99
3. Verify stock is now 5

---

### Test 4: Add Multiple Images ✅

**Objective:** Verify gallery images sync

**Steps:**
1. Select "Test Product 1"
2. Click "Edit"
3. Add 3 gallery images
4. Click "Save"
5. Click "Publish to GitHub"

**Expected Results:**
- ✅ Publish succeeds
- ✅ All gallery images uploaded

**Verify on GitHub:**
1. Check images/ folder
2. Should contain:
   - `product-1-primary.*` (3 formats)
   - `product-1-gallery-0.*` (3 formats)
   - `product-1-gallery-1.*` (3 formats)
   - `product-1-gallery-2.*` (3 formats)
3. Total: 12 files for one product

---

### Test 5: Delete Product ⭐ CRITICAL ⭐

**Objective:** Verify deletions sync to GitHub (exact replica)

**Steps:**
1. Select "Test Product 1"
2. Click "Delete"
3. Confirm deletion
4. Verify product removed from list
5. Click "Publish to GitHub"

**Expected Results:**
- ✅ "Deleted X file(s)" in commit message
- ✅ Publish succeeds

**Verify Locally:**
1. Check images/ folder
2. ✅ All product-1-* files should be deleted

**Verify on GitHub:**
1. Check products.json - should be empty `[]`
2. Check images/ folder - should be empty
3. ✅ Repository is exact replica of local

---

### Test 6: Bulk Operations ✅

**Objective:** Verify complex changes sync correctly

**Steps:**
1. Add 3 products:
   - Product A (with primary image)
   - Product B (with primary + 2 gallery images)
   - Product C (with primary image)
2. Click "Publish to GitHub"
3. Edit Product B (change price)
4. Delete Product A
5. Add Product D (with primary + 3 gallery images)
6. Click "Publish to GitHub"

**Expected Results:**
- ✅ First publish: 3 products + images
- ✅ Second publish: Product A deleted, B updated, D added

**Verify on GitHub:**
1. products.json contains Products B, C, D (not A)
2. images/ contains only images for B, C, D
3. No leftover Product A images

---

### Test 7: Conflict Resolution ✅

**Objective:** Verify pull behavior

**Steps:**
1. Add Product E locally (DON'T publish yet)
2. On GitHub website, manually edit products.json
   - Add a test product via GitHub UI
3. Now click "Publish to GitHub"

**Expected Results:**
- ✅ Pull step merges GitHub changes
- ✅ Local Product E retained
- ✅ GitHub product retained
- ✅ Both products in final result

**Verify:**
1. Both products visible in app
2. Both products in GitHub repository

---

### Test 8: No Changes Scenario ✅

**Objective:** Verify behavior when nothing to publish

**Steps:**
1. Make no changes
2. Click "Publish to GitHub"

**Expected Results:**
- ✅ Message: "Already up to date. No changes to publish."
- ✅ No commit created
- ✅ No push attempted

---

### Test 9: Test Connection Feature ✅

**Objective:** Verify connection testing works

**Steps:**
1. Go to Settings
2. Click "Test Connection"

**Expected Results:**
- ✅ "Testing..." appears
- ✅ Success message with repository name
- ✅ Example: "Connection successful! Repository: username/test-store-data"

**Test with Bad Token:**
1. Change token to invalid value
2. Click "Test Connection"
3. ✅ Error: "Invalid token. Please check your Personal Access Token."

---

### Test 10: Switch Between Modes ✅

**Objective:** Verify switching between Local and GitHub modes

**Steps:**
1. Start in GitHub mode with products
2. Go to Settings
3. Switch to "Local Files"
4. Browse to a different folder with products.json
5. Return to main view
6. ✅ Products from local folder displayed
7. Switch back to "GitHub Repository"
8. ✅ Products from GitHub clone displayed

---

## Edge Cases

### Edge Case 1: Repository Already Cloned
**Test:**
1. Set up GitHub mode (repo cloned)
2. Close app
3. Reopen app
4. Go to Settings
5. Save settings again

**Expected:**
- ✅ No re-clone attempted
- ✅ "Repository already exists" detected
- ✅ Settings saved successfully

### Edge Case 2: Invalid Repository URL
**Test:**
1. Enter invalid URL: `https://github.com/fake/nonexistent`
2. Click "Save Settings"

**Expected:**
- ✅ Clone fails with clear error
- ✅ "Repository not found" or "404" error

### Edge Case 3: Network Failure During Publish
**Test:**
1. Disable internet
2. Make changes
3. Click "Publish to GitHub"

**Expected:**
- ✅ Error: "Cannot connect to GitHub"
- ✅ Changes remain local
- ✅ Can retry when internet restored

---

## Performance Tests

### Test: Large Gallery (10+ Images)
1. Add product with 15 gallery images
2. Publish to GitHub

**Expected:**
- ✅ All images processed
- ✅ All images pushed (45 files total)
- ✅ Reasonable performance (<30 seconds)

### Test: Multiple Products (50+)
1. Add 50 products with images
2. Publish to GitHub

**Expected:**
- ✅ All products synced
- ✅ All images synced
- ✅ No timeout errors

---

## Regression Tests

After any code changes, verify:

- [ ] Local mode still works
- [ ] GitHub mode clone works
- [ ] Product CRUD operations work
- [ ] Image upload/delete works
- [ ] Publish to GitHub works
- [ ] Deletions sync properly
- [ ] Settings save/load works
- [ ] Mode switching works

---

## Success Criteria

All tests must pass with:
✅ No errors in console
✅ No data loss
✅ Exact sync between local and GitHub
✅ Proper error messages for failures
✅ UI feedback for long operations
✅ Clean git history on GitHub

---

## Known Issues / Limitations

1. **Merge Conflicts:** Manual resolution required if files edited on GitHub and locally
2. **Large Files:** Very large images may slow down push
3. **Branch:** Currently works with default branch only
4. **Offline:** Requires internet for clone and publish operations

---

## Automated Test Script (Optional)

```javascript
// Future: Add automated tests
describe('GitHub Flow', () => {
  test('should clone repository', async () => {
    // Test implementation
  });
  
  test('should publish changes', async () => {
    // Test implementation
  });
  
  test('should sync deletions', async () => {
    // Test implementation
  });
});
```

---

## Report Template

Use this template to report test results:

```
## Test Report - GitHub Flow

Date: ___________
Tester: ___________
Version: ___________

### Results
- [ ] Test 1: Initial Setup - PASS/FAIL
- [ ] Test 2: Add Product - PASS/FAIL
- [ ] Test 3: Edit Product - PASS/FAIL
- [ ] Test 4: Gallery Images - PASS/FAIL
- [ ] Test 5: Delete Product - PASS/FAIL
- [ ] Test 6: Bulk Operations - PASS/FAIL
- [ ] Test 7: Conflict Resolution - PASS/FAIL
- [ ] Test 8: No Changes - PASS/FAIL
- [ ] Test 9: Test Connection - PASS/FAIL
- [ ] Test 10: Mode Switching - PASS/FAIL

### Issues Found:
1. 
2. 
3. 

### Notes:
```

---

## Tips for Testing

1. **Use a test repository** - Don't test with production data
2. **Test incrementally** - Do one test at a time
3. **Verify on GitHub** - Always check the actual repository
4. **Check git history** - Use `git log` to see commits
5. **Monitor console** - Watch for errors in dev tools
6. **Test offline** - Verify error handling works
7. **Test with delays** - Ensure loading states display
8. **Clear cache** - Sometimes needed between tests

---

Happy Testing! 🚀
